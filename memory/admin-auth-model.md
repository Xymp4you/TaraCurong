---
name: admin-auth-model
description: How admin/role auth works in TaraCurong and how to bootstrap an admin
metadata:
  type: project
---

Auth uses **Supabase** (not NextAuth/Drizzle, despite stale docs). `app/lib/auth.ts` and the middleware read the app role from `user_metadata.role` via `getClaims()` (local JWT verify; switched off `getUser()` for speed).

**Role provisioning is split across a DB trigger + the auth callbacks:**
- The `handle_new_user` trigger (docs/migrations/20260426_fix_auth_trigger.sql) fires on `auth.users` insert and creates a `jobseekers` OR `employers` row based on `raw_user_meta_data->>'role'`, defaulting to **jobseeker**. It does NOT create `admins` or `users` rows.
- Google social login has no role → defaults to jobseeker. `app/auth/callback/route.ts` assigns the picked role (from `next`) for first-time social users; new employers become **pending** (`employers.account_status` default `pending`) and are routed to `/pending-approval`. The employer layout gates non-approved employers there.

**Admins require BOTH:** a Supabase auth user with `user_metadata.role='admin'` AND a `public.admins` row (the admin OAuth callback `app/api/auth/callback/admin/route.ts` matches by email). Approving an `admin_access_requests` row provisions both. Bootstrap the first admin with `node scripts/bootstrap-admin.cjs [email] [password]`.

Employer approval UI that works: `/admin/employers` (+ `/api/admin/employers/[id]/status`). The `/admin/employer-approvals` page is an orphaned hardcoded mock (not in the admin sidebar). Related: [[supabase-shared-local-prod]] not yet written.
