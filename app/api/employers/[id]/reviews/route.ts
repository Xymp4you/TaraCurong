export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getRequestId, getClientIp, enforceRateLimit } from "@/lib/api-guardrails";
import { supabaseAdmin } from "@/lib/supabase";

const reviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();

// Public-facing reviewer label: first name + last initial (privacy).
function reviewerLabel(first?: string | null, last?: string | null) {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "Jobseeker";
  return `${f}${l ? ` ${l[0]}.` : ""}`.trim() || "Jobseeker";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(req);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }

  const { id: employerId } = await params;

  const { data, error } = await supabaseAdmin
    .from("employer_reviews")
    .select("id, rating, comment, created_at, jobseeker_id")
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Employer reviews fetch error:", { requestId, error });
    return NextResponse.json({ error: "Failed to load reviews", requestId }, { status: 500 });
  }

  const rows = data ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.jobseeker_id as string)));
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: js } = await supabaseAdmin
      .from("jobseekers")
      .select("id, first_name, last_name")
      .in("id", ids);
    (js ?? []).forEach((j: Record<string, unknown>) =>
      names.set(String(j.id), reviewerLabel(j.first_name as string, j.last_name as string))
    );
  }

  // Did the current jobseeker apply here (can they review)? And their existing review.
  let canReview = false;
  let myReview: { rating: number; comment: string | null } | null = null;
  const user = session.user as { id?: string; role?: string };
  if (user.role === "jobseeker" && user.id) {
    const { data: app } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("applicant_id", user.id)
      .eq("employer_id", employerId)
      .limit(1)
      .maybeSingle();
    canReview = Boolean(app);
    const mine = rows.find((r) => r.jobseeker_id === user.id);
    if (mine) myReview = { rating: mine.rating as number, comment: (mine.comment as string) ?? null };
  }

  const reviews = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    reviewer: names.get(String(r.jobseeker_id)) ?? "Jobseeker",
  }));
  const count = reviews.length;
  const average = count > 0 ? Math.round((reviews.reduce((a, b) => a + (b.rating as number), 0) / count) * 10) / 10 : 0;

  return NextResponse.json({ reviews, average, count, canReview, myReview, requestId });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(req);
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "jobseeker") {
    return NextResponse.json({ error: "Only jobseekers can review employers", requestId }, { status: 401 });
  }

  const rate = enforceRateLimit({
    key: `employer-review:${user.id}:${getClientIp(req)}`,
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many attempts", requestId }, { status: 429 });
  }

  const { id: employerId } = await params;
  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review", details: parsed.error.flatten(), requestId }, { status: 400 });
  }

  // Eligibility: must have applied to this employer.
  const { data: app } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("applicant_id", user.id)
    .eq("employer_id", employerId)
    .limit(1)
    .maybeSingle();
  if (!app) {
    return NextResponse.json(
      { error: "You can only review employers you've applied to.", requestId },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin.from("employer_reviews").upsert(
    {
      employer_id: employerId,
      jobseeker_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id,jobseeker_id" }
  );

  if (error) {
    console.error("Employer review save error:", { requestId, error });
    return NextResponse.json({ error: "Failed to save review", requestId }, { status: 500 });
  }

  return NextResponse.json({ message: "Review saved", requestId }, { status: 201 });
}
