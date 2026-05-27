export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  enforceRateLimit,
  getClientIp,
  getRequestId,
} from "@/lib/api-guardrails";
import { supabaseAdmin } from "@/lib/supabase";
import { tryCreateNotification } from "@/lib/notifications";

const updateAccessRequestSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]),
    notes: z.string().max(2000).optional(),
  })
  .strict();

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "admin";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req);

  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateLimit = enforceRateLimit({
      key: `admin:access-requests:update:${clientIp}`,
      maxRequests: 40,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          requestId,
          retryAfterSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    const { id } = await params;
    const parsed = updateAccessRequestSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten(), requestId },
        { status: 400 }
      );
    }

    const existing = await supabaseAdmin
      .from("admin_access_requests")
      .select("id, email, name")
      .eq("id", id)
      .single();

    if (existing.error || !existing.data) {
      return NextResponse.json(
        { error: "Access request not found", requestId },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      status: parsed.data.status,
      notes: parsed.data.notes?.trim() || null,
    };
    if (parsed.data.status !== "pending") {
      updates.reviewed_at = new Date().toISOString();
    }

    const updated = await supabaseAdmin
      .from("admin_access_requests")
      .update(updates)
      .eq("id", id)
      .select("id, status, reviewed_at")
      .single();

    if (updated.error || !updated.data) {
      return NextResponse.json(
        { error: "Access request not found", requestId },
        { status: 404 }
      );
    }

    // Fulfillment: approving a request must actually provision an admin, or the
    // approved person still can't log in. Promote their auth user to role=admin
    // and create the admins profile row the admin login callback checks.
    if (parsed.data.status === "approved") {
      try {
        const reqEmail = existing.data.email.toLowerCase();
        const reqName = existing.data.name || reqEmail;
        const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const authUser = list.data?.users?.find(
          (u) => u.email?.toLowerCase() === reqEmail
        );

        if (authUser) {
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            user_metadata: { ...authUser.user_metadata, role: "admin" },
          });
          await supabaseAdmin.from("admins").upsert(
            {
              id: authUser.id,
              email: reqEmail,
              name: reqName,
              password_hash: "auth_managed",
              role: "admin",
              is_active: true,
            },
            { onConflict: "id" }
          );
        } else {
          // No auth account yet — create the admins row by email; the role
          // metadata is set on first admin login (callback/admin).
          const existingAdmin = await supabaseAdmin
            .from("admins")
            .select("id")
            .eq("email", reqEmail)
            .maybeSingle();
          if (!existingAdmin.data) {
            await supabaseAdmin.from("admins").insert({
              email: reqEmail,
              name: reqName,
              password_hash: "auth_managed",
              role: "admin",
              is_active: true,
            });
          }
        }
      } catch (provisionError) {
        console.error("Admin provisioning failed:", { requestId, provisionError });
      }
    }

    const matchedUser = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", existing.data.email)
      .single();

    if (matchedUser.data) {
      await tryCreateNotification({
        userId: matchedUser.data.id,
        role: "jobseeker",
        type: "account",
        title: "Access Request Updated",
        message: `Your admin access request status is now ${updated.data.status}.`,
        relatedId: updated.data.id,
        relatedType: null,
      });
    }

    return NextResponse.json(
      { message: "Access request updated", request: updated.data, requestId },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    console.error("Admin access request update error:", { requestId, error });
    return NextResponse.json({ error: "Internal server error", requestId }, { status: 500 });
  }
}