export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";

// Message attachments live in a PRIVATE bucket. A requester may view one only if
// they are a participant (sender or recipient) of a message referencing it.
// Issues a short-lived signed URL and redirects.
export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const { data: message } = await supabaseAdmin
    .from("messages")
    .select("id")
    .contains("attachment_urls", [path])
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  if (!message) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.messageAttachments)
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
