import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientIp, getRequestId, enforceRateLimit } from "@/lib/api-guardrails";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50) || "attachment"
  );
}

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return file.type.split("/")[1];
  return "bin";
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);

  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rate = enforceRateLimit({
      key: `upload:message-attachment:${user.id}:${ip}`,
      maxRequests: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts", requestId },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required", requestId }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use an image, PDF, DOC, or DOCX.", requestId },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB.", requestId },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}.${getExtension(file)}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.messageAttachments)
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Message attachment upload error:", { requestId, uploadError });
      return NextResponse.json({ error: "Failed to upload attachment", requestId }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Upload successful", path, requestId },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    console.error("Message attachment upload route error:", { requestId, error });
    return NextResponse.json({ error: "Internal server error", requestId }, { status: 500 });
  }
}
