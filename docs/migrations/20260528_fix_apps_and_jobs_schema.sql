-- Batch B follow-up: align the jobs/applications schema with what the code
-- actually inserts and reads. Both tables were silently broken: every
-- employer create-job 500'd ("Could not find the 'description' column"), and
-- every jobseeker apply 500'd downstream (no applicant_id / cover_letter /
-- resume_url columns + the route inserts applicant_id while the schema had
-- jobseeker_id).

-- 1. Jobs: add the three columns the create/update routes try to write.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS work_type text,
  ADD COLUMN IF NOT EXISTS location text;

-- 2. Applications: standardize on `applicant_id` (what most of the codebase
-- uses) by renaming jobseeker_id, and add the missing detail columns.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS applicant_name  text,
  ADD COLUMN IF NOT EXISTS applicant_email text,
  ADD COLUMN IF NOT EXISTS cover_letter    text,
  ADD COLUMN IF NOT EXISTS resume_url      text,
  ADD COLUMN IF NOT EXISTS feedback        text;

-- Rename jobseeker_id -> applicant_id only if the old name still exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'jobseeker_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'applicant_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.applications RENAME COLUMN jobseeker_id TO applicant_id';
  END IF;
END $$;
