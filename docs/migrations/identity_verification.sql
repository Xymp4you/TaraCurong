-- TaraCurong — identity verification schema additions
-- Run AFTER existing phase migrations. Idempotent (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
--
-- Adds:
--   employers: authorized-rep identity fields + verification status + audit columns
--   users (jobseekers): identity verification fields + status + audit columns
--   identity_verification_documents: optional separate audit log of every uploaded ID

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Employers: authorized representative identity verification
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS rep_full_name              TEXT,
  ADD COLUMN IF NOT EXISTS rep_date_of_birth          DATE,
  ADD COLUMN IF NOT EXISTS rep_relationship           TEXT
    CHECK (rep_relationship IS NULL OR rep_relationship IN
      ('owner','officer','hr_manager','authorized_hiring_agent','other')),
  ADD COLUMN IF NOT EXISTS rep_phone                  TEXT,
  ADD COLUMN IF NOT EXISTS rep_id_type                TEXT,
  ADD COLUMN IF NOT EXISTS rep_id_file                TEXT,   -- private storage URL
  ADD COLUMN IF NOT EXISTS rep_selfie_file            TEXT,   -- private storage URL
  ADD COLUMN IF NOT EXISTS authorization_confirmed    BOOLEAN DEFAULT FALSE,

  -- Verification lifecycle (separate from SRS profile approval)
  ADD COLUMN IF NOT EXISTS identity_status            TEXT
    DEFAULT 'unverified'
    CHECK (identity_status IN ('unverified','pending','verified','rejected')),
  ADD COLUMN IF NOT EXISTS identity_submitted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_reviewed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_reviewer_id       UUID,
  ADD COLUMN IF NOT EXISTS identity_rejection_reason  TEXT,
  ADD COLUMN IF NOT EXISTS identity_expires_at        TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Jobseekers (users): optional identity verification for "Verified" badge
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS identity_full_legal_name   TEXT,
  ADD COLUMN IF NOT EXISTS identity_date_of_birth     DATE,
  ADD COLUMN IF NOT EXISTS identity_id_type           TEXT,
  ADD COLUMN IF NOT EXISTS identity_id_file           TEXT,   -- private storage URL
  ADD COLUMN IF NOT EXISTS identity_selfie_file       TEXT,   -- private storage URL
  ADD COLUMN IF NOT EXISTS identity_consent_at        TIMESTAMPTZ,

  ADD COLUMN IF NOT EXISTS identity_status            TEXT
    DEFAULT 'unverified'
    CHECK (identity_status IN ('unverified','pending','verified','rejected')),
  ADD COLUMN IF NOT EXISTS identity_submitted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_reviewed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_reviewer_id       UUID,
  ADD COLUMN IF NOT EXISTS identity_rejection_reason  TEXT,
  ADD COLUMN IF NOT EXISTS identity_expires_at        TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. identity_verification_documents — append-only audit log
--    Lets the maintainer see history of submissions/rejections without losing
--    files when a user re-submits. Files themselves live in Supabase Storage.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.identity_verification_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      UUID NOT NULL,
  subject_role    TEXT NOT NULL CHECK (subject_role IN ('jobseeker','employer')),
  doc_slot        TEXT NOT NULL CHECK (doc_slot IN ('rep_id','rep_selfie','js_id','js_selfie')),
  storage_path    TEXT NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at   TIMESTAMPTZ,  -- non-NULL when replaced by a newer upload
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_idv_docs_subject
  ON public.identity_verification_documents (subject_role, subject_id);

CREATE INDEX IF NOT EXISTS idx_idv_docs_active
  ON public.identity_verification_documents (subject_role, subject_id)
  WHERE superseded_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS guidance (run separately after reviewing your existing policies)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- ALTER TABLE public.identity_verification_documents ENABLE ROW LEVEL SECURITY;
--
-- -- The owner can see their own submissions
-- CREATE POLICY idv_select_own ON public.identity_verification_documents
--   FOR SELECT USING (
--     (subject_role = 'jobseeker' AND subject_id = auth.uid())
--     OR (subject_role = 'employer' AND subject_id = auth.uid())
--   );
--
-- -- Only the service role (admin maintainer) can insert/update/delete
-- CREATE POLICY idv_admin_write ON public.identity_verification_documents
--   FOR ALL TO service_role USING (true) WITH CHECK (true);
--
-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Storage bucket (run via Supabase dashboard / SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('identity-documents', 'identity-documents', false)
-- ON CONFLICT (id) DO NOTHING;
--
-- Set bucket policy: only the service role can read/write. Owners cannot list
-- (uploads happen via signed URLs from the server API).

COMMIT;
