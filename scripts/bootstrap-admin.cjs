/**
 * Bootstrap the first admin account.
 *
 * Creates (or promotes) a Supabase auth user with user_metadata.role = 'admin'
 * and a matching row in the public.admins table, so the account can sign in at
 * /login/admin and pass the role check in middleware.
 *
 * Usage:
 *   node scripts/bootstrap-admin.cjs [email] [password]
 * Defaults: admin@taracurong.com + a generated strong password (printed once).
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const crypto = require("crypto");

const env = fs.readFileSync(".env", "utf8").split(/\r?\n/);
const get = (k) => {
  const line = env.find((l) => l.startsWith(k + "="));
  return line ? line.slice(k.length + 1).trim() : null;
};

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@taracurong.com").toLowerCase();
const password =
  process.argv[3] ||
  process.env.ADMIN_PASSWORD ||
  crypto.randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 14) + "A9!";
const name = "System Administrator";

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

(async () => {
  try {
    let userId;

    // Try to create the auth user with admin role metadata.
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin", name, full_name: name },
    });

    if (created.error) {
      const msg = created.error.message || "";
      if (/registered|exists/i.test(msg)) {
        // Already exists — find and promote to admin.
        const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existing = list.data?.users?.find((u) => u.email?.toLowerCase() === email);
        if (!existing) throw new Error("User exists but could not be located via listUsers");
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { ...existing.user_metadata, role: "admin", name, full_name: name },
        });
        console.log("Existing auth user promoted to admin:", email);
      } else {
        throw created.error;
      }
    } else {
      userId = created.data.user.id;
      console.log("Created new admin auth user:", email);
    }

    // Upsert the admins profile row (admin login callback checks this table).
    const { error: rowError } = await admin
      .from("admins")
      .upsert(
        { id: userId, email, name, password_hash: "auth_managed", role: "admin", is_active: true },
        { onConflict: "id" }
      );
    if (rowError) throw rowError;

    console.log("\n✅ Admin ready. Sign in at /login/admin with:");
    console.log("   Email:    " + email);
    console.log("   Password: " + password);
    console.log("\n(Change this password after first login.)");
  } catch (e) {
    console.error("FAILED:", e.message || e);
    process.exitCode = 1;
  }
})();
