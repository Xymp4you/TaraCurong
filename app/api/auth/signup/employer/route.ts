import { NextRequest, NextResponse } from "next/server";
import { signupEmployerRequestSchema } from "@/lib/validation-schemas";
import {
  errorResponse,
  validationErrorResponse,
  createApiError,
  ErrorCode,
  safeDatabaseOperation,
} from "@/lib/api-errors";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";
import { enforceRateLimit, getClientIp, getRequestId } from "@/lib/api-guardrails";

const MAX_DTI_BYTES = 10 * 1024 * 1024;
const ALLOWED_DTI_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function fileExt(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return file.type.split("/")[1];
  return "bin";
}

function normalizeUrl(value: string) {
  const t = value.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function parseSocialLinks(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => typeof s === "string" && s.trim())
      .map((s) => normalizeUrl(s))
      .slice(0, 10);
  } catch {
    return [];
  }
}

// Employer signup is multipart: account fields + the required DTI Business
// Registration Certificate (PDF or image). The cert is stored in the private
// employer-documents bucket. Doing it here (rather than a separate upload
// endpoint) avoids an unauthenticated upload surface.
export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const clientIp = getClientIp(req);

  const rate = enforceRateLimit({ key: `signup:employer:${clientIp}`, maxRequests: 8, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded", requestId }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse(createApiError(ErrorCode.VALIDATION_ERROR, "Invalid form submission"), requestId);
  }

  const fields = {
    establishmentName: String(form.get("establishmentName") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
    contactPerson: String(form.get("contactPerson") ?? "").trim() || undefined,
    contactPhone: String(form.get("contactPhone") ?? "").trim() || undefined,
    industry: String(form.get("industry") ?? "").trim() || undefined,
    city: String(form.get("city") ?? "").trim() || undefined,
  };

  const parsed = signupEmployerRequestSchema.safeParse(fields);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error, requestId);
  }

  // Optional — many small/informal province businesses aren't DTI-registered.
  const fileEntry = form.get("dtiRegistrationFile");
  const dtiFile = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  if (dtiFile) {
    if (!ALLOWED_DTI_TYPES.has(dtiFile.type)) {
      return errorResponse(
        createApiError(ErrorCode.VALIDATION_ERROR, "DTI certificate must be a PDF or image (PNG/JPG)."),
        requestId
      );
    }
    if (dtiFile.size > MAX_DTI_BYTES) {
      return errorResponse(
        createApiError(ErrorCode.VALIDATION_ERROR, "DTI certificate is too large. Maximum size is 10MB."),
        requestId
      );
    }
  }

  const website = normalizeUrl(String(form.get("website") ?? ""));
  const socialLinks = parseSocialLinks(form.get("socialLinks"));

  const email = parsed.data.email.toLowerCase();
  const establishmentName = parsed.data.establishmentName.trim();
  const contactPerson = (parsed.data.contactPerson || establishmentName).trim();

  const result = await safeDatabaseOperation(async () => {
    const [existingEmployer, existingJobseeker] = await Promise.all([
      supabaseAdmin.from("employers").select("id").eq("email", email).maybeSingle(),
      supabaseAdmin.from("jobseekers").select("id").eq("email", email).maybeSingle(),
    ]);
    if (existingEmployer.data || existingJobseeker.data) {
      throw new Error("email_exists");
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: parsed.data.password,
      user_metadata: {
        role: "employer",
        contact_person: contactPerson,
        establishment_name: establishmentName,
        full_name: contactPerson,
        name: contactPerson,
        first_name: contactPerson.split(" ")[0] || "",
        last_name: contactPerson.split(" ").slice(1).join(" ") || "",
      },
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      throw authError ?? new Error("auth_creation_failed");
    }

    const userId = authUser.user.id;

    // The on_auth_user_created trigger created the employers row; collect the
    // optional extras to attach to it.
    const employerUpdates: Record<string, unknown> = {};
    if (parsed.data.contactPerson) employerUpdates.contact_person = parsed.data.contactPerson.trim();
    if (parsed.data.contactPhone) employerUpdates.contact_phone = parsed.data.contactPhone.trim();
    if (parsed.data.industry) employerUpdates.industry = parsed.data.industry.trim();
    if (parsed.data.city) employerUpdates.city = parsed.data.city.trim();
    if (website) employerUpdates.website = website;
    if (socialLinks.length) employerUpdates.social_links = socialLinks;

    // Store the DTI certificate (when provided) in the private bucket.
    if (dtiFile) {
      const bytes = await dtiFile.arrayBuffer();
      const path = `${userId}/dti-${Date.now()}.${fileExt(dtiFile)}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.employerDocs)
        .upload(path, bytes, { contentType: dtiFile.type, upsert: true });

      if (uploadError) {
        // Roll back so a failed upload doesn't leave a half-created account.
        await supabaseAdmin.from("employers").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error("dti_upload_failed");
      }

      employerUpdates.dti_registration_file = path;
    }

    if (Object.keys(employerUpdates).length > 0) {
      await supabaseAdmin.from("employers").update(employerUpdates).eq("id", userId);
    }

    return {
      id: userId,
      email,
      contact_person: contactPerson,
      account_status: "approved",
    };
  }, "employerSignup");

  if (!result.success) {
    return errorResponse(result.error, requestId);
  }

  const response = NextResponse.json(
    {
      success: true,
      data: {
        employer: result.data,
        message: "Employer account created. You can sign in and start posting jobs right away.",
      },
      requestId,
    },
    { status: 201 }
  );

  response.headers.set("X-Request-ID", requestId);
  return response;
}
