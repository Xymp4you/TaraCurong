export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";

// Employer documents (e.g. DTI registration cert) live in a PRIVATE bucket.
// Viewable only by an admin or the owning employer (path is prefixed with the
// employer's user id). Issues a short-lived signed URL and redirects.
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
  const allowed = user.role === "admin" || (user.role === "employer" && ownerId === user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.employerDocs)
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
