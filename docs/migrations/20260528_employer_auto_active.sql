-- Migration: Employers are auto-active (no admin approval)
-- Date: 2026-05-28
-- Rationale: This is a free community/student project. With compliance documents
-- no longer collected (data minimization), the admin has nothing to verify an
-- employer against, so upfront approval is meaningless friction. Model is now
-- post-moderation: employers are active on signup; the admin monitors and can
-- suspend. (Job postings can still be moderated separately.)

ALTER TABLE public.employers ALTER COLUMN account_status SET DEFAULT 'approved';
ALTER TABLE public.employers ALTER COLUMN is_active SET DEFAULT true;

-- Bring existing pending employers in line with the new auto-active model.
UPDATE public.employers
SET account_status = 'approved',
    is_active = true,
    verified_at = COALESCE(verified_at, now())
WHERE account_status = 'pending' OR account_status IS NULL;
