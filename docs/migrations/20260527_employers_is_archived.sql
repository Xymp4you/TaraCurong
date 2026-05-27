-- Migration: Add is_archived to employers
-- Date: 2026-05-27
-- Description: The employer admin routes (list, archive, archived list) all
-- reference employers.is_archived, but the column was never created. Without it
-- the list query (.eq("is_archived", false)) errored and silently returned an
-- empty list, so pending employers never appeared in the approvals page even
-- though the dashboard counted them. Add the column so the archive feature and
-- the approvals list work.

ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
