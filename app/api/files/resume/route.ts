export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";

// Resumes live in a PRIVATE bucket. This endpoint authorizes the requester and
// issues a short-lived signed URL, then redirects to it. Allowed:
//  - admins
//  - the owning jobseeker (resume path is prefixed with their user id)
//  - an employer who received an application carrying this resume path
export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const ownerId = path.split("/")[0];
  let allowed = false;

  if (user.role === "admin") {
    allowed = true;
  } else if (user.role === "jobseeker") {
    allowed = ownerId === user.id;
  } else if (user.role === "employer") {
    const { data } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("employer_id", user.id)
      .eq("resume_url", path)
      .limit(1)
      .maybeSingle();
    allowed = Boolean(data);
  }

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.resumes)
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
