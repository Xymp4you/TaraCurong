-- Add AI-generated resume summary to jobseekers.
-- Populated by POST /api/jobseeker/resume-summary (Groq), reviewed/edited by the
-- jobseeker, and surfaced (labeled "AI-generated") on employer + admin applicant views.
ALTER TABLE public.jobseekers
  ADD COLUMN IF NOT EXISTS resume_summary text;
