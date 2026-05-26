import "server-only";
import { createClient } from "./supabase-server";

/**
 * Compatibility layer to replace NextAuth auth() call.
 * Returns a session object compatible with the existing codebase.
 *
 * Uses getClaims() (local JWT verification via WebCrypto when the project uses
 * asymmetric JWT signing keys) instead of getUser(), which always makes a
 * network round-trip to the Supabase Auth server. Since auth() runs on every
 * protected page and every API route, getUser() added ~150-250ms of latency to
 * each request; getClaims() removes it once signing keys are enabled (and stays
 * correct — falling back to a network verify — until then).
 */
export const auth = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    const claims = data?.claims as
      | {
          sub?: string;
          email?: string;
          exp?: number;
          user_metadata?: Record<string, string | undefined>;
        }
      | undefined;

    if (error || !claims?.sub) return null;

    const meta = claims.user_metadata ?? {};
    const role = meta.role || "jobseeker";
    const name =
      meta.name ||
      meta.full_name ||
      `${meta.first_name || ""} ${meta.last_name || ""}`.trim() ||
      claims.email?.split("@")[0] ||
      "User";

    return {
      user: {
        id: claims.sub,
        email: claims.email,
        name: name,
        role: role,
        image: meta.avatar_url || null,
      },
      expires: new Date((claims.exp ?? Math.floor(Date.now() / 1000) + 3600) * 1000).toISOString(),
    };
  } catch (error) {
    console.error("[auth] Compatibility layer error:", error);
    return null;
  }
};

// Mock handlers for NextAuth route compatibility (can be removed later)
export const handlers = {
  GET: () => new Response("NextAuth is migrated to Supabase", { status: 200 }),
  POST: () => new Response("NextAuth is migrated to Supabase", { status: 200 }),
};

// Mock signIn/signOut for server-side if needed
export const signIn = async () => {};
export const signOut = async () => {};