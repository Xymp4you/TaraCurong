import { NextResponse } from "next/server";
import { createPostHandler, ApiHandlerContext } from "@/lib/api-handler";
import { signupJobseekerRequestSchema } from "@/lib/validation-schemas";
import {
  errorResponse,
  createApiError,
  ErrorCode,
  safeDatabaseOperation,
} from "@/lib/api-errors";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/utils";
import { randomUUID } from "node:crypto";
import { z } from "zod";

type SignupJobseekerBody = z.infer<typeof signupJobseekerRequestSchema>;

export const POST = createPostHandler<SignupJobseekerBody>(
  async (ctx: ApiHandlerContext, body?: SignupJobseekerBody) => {
    const email = (body?.email || "").toLowerCase().trim();

    const result = await safeDatabaseOperation(
      async () => {
        const [existingUser, existingEmployer] = await Promise.all([
          supabaseAdmin
            .from("jobseekers")
            .select("id")
            .eq("email", email)
            .maybeSingle(),
          supabaseAdmin
            .from("employers")
            .select("id")
            .eq("email", email)
            .single(),
        ]);

        if (existingUser.data || existingEmployer.data) {
          throw new Error("email_exists");
        }

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: body?.password || "",
          user_metadata: {
            role: "jobseeker",
            first_name: (body?.firstName || "").trim(),
            last_name: (body?.lastName || "").trim(),
            full_name: `${(body?.firstName || "").trim()} ${(body?.lastName || "").trim()}`.trim(),
            name: `${(body?.firstName || "").trim()} ${(body?.lastName || "").trim()}`.trim(),
          },
          email_confirm: true, // Auto-confirm for now as per previous manual logic
        });

        if (authError || !authUser.user) {
          throw authError ?? new Error("auth_creation_failed");
        }

        // The SQL trigger on_auth_user_created creates the public.jobseekers row;
        // persist the required Facebook link onto it (normalize to an https URL),
        // plus any optional onboarding details collected by the signup wizard.
        const rawFb = (body?.facebookLink || "").trim();
        const facebookLink = /^https?:\/\//i.test(rawFb) ? rawFb : `https://${rawFb}`;

        // NSRP ID stamped at signup so admin views never render "Profile ID:" blank.
        // UUID-derived 8-char suffix gives ~4B distinct IDs, effectively collision-free.
        const nsrpId = `NSRP-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
        const jobseekerUpdate: Record<string, unknown> = {
          facebook_link: facebookLink,
          nsrp_id: nsrpId,
        };
        const setIf = (col: string, val?: string | null) => {
          if (val && val.trim()) jobseekerUpdate[col] = val.trim();
        };
        setIf("phone", body?.phone);
        setIf("birth_date", body?.birthDate);
        setIf("gender", body?.gender);
        setIf("civil_status", body?.civilStatus);
        setIf("barangay", body?.barangay);
        setIf("city", body?.city);
        setIf("province", body?.province);
        setIf("preferred_occupation_1", body?.preferredOccupation1);
        setIf("preferred_occupation_2", body?.preferredOccupation2);
        setIf("preferred_occupation_3", body?.preferredOccupation3);
        const skills = (body?.otherSkills ?? []).map((s) => s.trim()).filter(Boolean);
        if (skills.length) jobseekerUpdate.other_skills = skills;

        await supabaseAdmin
          .from("jobseekers")
          .update(jobseekerUpdate)
          .eq("id", authUser.user.id);

        return {
          id: authUser.user.id,
          email: authUser.user.email,
          first_name: body?.firstName,
          last_name: body?.lastName,
        };
      },
      "jobseekerSignup"
    );

    if (!result.success) {
      return errorResponse(result.error, ctx.requestId);
    }

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: result.data,
          message: "Jobseeker account created successfully. Please check your email to verify your account.",
        },
        requestId: ctx.requestId,
      },
      { status: 201 }
    );

    response.headers.set("X-Request-ID", ctx.requestId);
    return response;
  },
  {
    bodySchema: signupJobseekerRequestSchema,
    rateLimitMaxRequests: 10,
  }
);