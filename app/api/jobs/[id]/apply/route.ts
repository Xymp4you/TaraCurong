import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { enforceRateLimit, getRequestId } from "@/lib/api-guardrails";
import { supabaseAdmin } from "@/lib/supabase";
import { logAuditAction } from "@/lib/audit";
import {
  JOBSEEKER_REQUIRED_COLS,
  REQUIRED_JOBSEEKER_FIELDS,
  missingFields,
} from "@/lib/profile-completeness";

const applySchema = z.object({
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().max(500).optional(),
  expectedSalary: z.string().max(100).optional(),
  nsrpForwarded: z.boolean().optional().default(false),
  extraAttachments: z.array(z.string().url()).optional(),
});

type SessionUser = {
  id?: string;
  role?: "admin" | "employer" | "jobseeker";
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    const userRole = (session.user as SessionUser).role;
    if (userRole !== "jobseeker") {
      return NextResponse.json(
        { error: "Only jobseekers can apply for jobs" },
        { status: 403, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    const rateLimitResult = enforceRateLimit({
      key: `apply:${session.user.id}:daily`,
      maxRequests: 10,
      windowMs: 86400000,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limited - maximum 10 applications per day" },
        {
          status: 429,
          headers: {
            "X-Request-ID": getRequestId(request),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetInSeconds),
          },
        }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    const { coverLetter, resumeUrl, expectedSalary, nsrpForwarded, extraAttachments } = parsed.data;

    const jobResult = await supabaseAdmin
      .from("jobs")
      .select("id, employer_id, job_status, is_active, archived, position_title")
      .eq("id", jobId)
      .single();

    const jobData = jobResult.data;

    if (!jobData?.id) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    // Status vocabulary is inconsistent across the codebase — accept any of the
    // values that other read paths treat as "applyable" (active is the
    // canonical state; Open/open are legacy values used elsewhere).
    const APPLYABLE_STATUSES = new Set(["active", "Open", "open"]);
    if (!APPLYABLE_STATUSES.has(jobData.job_status) || !jobData.is_active || jobData.archived) {
      return NextResponse.json(
        { error: "This job is no longer available" },
        { status: 400, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    const existingResult = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("applicant_id", session.user.id!)
      .single();

    if (existingResult.data) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    // The jobseekers table holds the canonical applicant record (no separate `users` table)
    const applicantSelect = ["first_name", "last_name", "email", "resume_url", ...JOBSEEKER_REQUIRED_COLS]
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .join(", ");
    const applicantResult = await supabaseAdmin
      .from("jobseekers")
      .select(applicantSelect)
      .eq("id", session.user.id!)
      .single();

    const applicantData = applicantResult.data as Record<string, unknown> | null;

    // Profile-completeness gate: enforce the same required fields the signup
    // wizard collects, so older accounts can't bypass them by applying directly.
    // A body-supplied resumeUrl (upload-and-apply path) satisfies the resume
    // requirement even when the jobseeker hasn't set a profile resume yet.
    const dataForGate = resumeUrl
      ? { ...applicantData, resume_url: applicantData?.resume_url || resumeUrl }
      : applicantData;
    const missing = missingFields(dataForGate, REQUIRED_JOBSEEKER_FIELDS);
    if (missing.length) {
      return NextResponse.json(
        {
          error: "Complete your profile before applying",
          message: `Please complete your profile first. Missing: ${missing.join(", ")}.`,
          code: "PROFILE_INCOMPLETE",
          missing,
        },
        { status: 403, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    // Fall back to session-provided identity if the DB lookup fails
    const applicantName = applicantData
      ? `${String(applicantData.first_name ?? "")} ${String(applicantData.last_name ?? "")}`.trim()
      : (session.user.name ?? null);
    const applicantEmail = applicantData
      ? String(applicantData.email ?? "")
      : (session.user.email ?? null);

    const inserted = await supabaseAdmin
      .from("applications")
      .insert({
        job_id: jobId,
        applicant_id: session.user.id!,
        employer_id: jobData.employer_id,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        cover_letter: coverLetter || null,
        // Default to the jobseeker's profile resume when the apply form didn't supply one.
        resume_url: resumeUrl || (applicantData?.resume_url as string | null) || null,
        expected_salary: expectedSalary || null,
        nsrp_forwarded: nsrpForwarded,
        extra_attachments: extraAttachments ? JSON.stringify(extraAttachments) : '[]',
        status: "under_review", // phase 1 migration normalization
      })
      .select("*")
      .single();

    if (inserted.error || !inserted.data) {
      console.error("[POST /api/jobs/[id]/apply] Failed to insert application:", inserted.error);
      return NextResponse.json(
        { error: "Failed to submit application", details: inserted.error?.message },
        { status: 500, headers: { "X-Request-ID": getRequestId(request) } }
      );
    }

    await logAuditAction({
      userId: session.user.id!,
      role: "jobseeker",
      action: "job_application_submit",
      resourceType: "application",
      resourceId: inserted.data.id,
      payload: { jobId },
      req: request,
    });

    // Auto-create message thread on submit
    try {
      const initialMessageContent = `Hello! I have submitted my application for the ${jobData.position_title || "position"}. Please review my profile and attachments. Thank you!`;
      await supabaseAdmin.from("messages").insert({
        sender_id: session.user.id!,
        recipient_id: jobData.employer_id,
        content: initialMessageContent,
        read: false,
      });
    } catch (msgError) {
      console.error("[POST /api/jobs/[id]/apply] Failed to auto-create message thread:", msgError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        application: inserted.data,
      },
      { headers: { "X-Request-ID": getRequestId(request) } }
    );
  } catch (error) {
    console.error("[POST /api/jobs/[id]/apply] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "X-Request-ID": getRequestId(request) } }
    );
  }
}