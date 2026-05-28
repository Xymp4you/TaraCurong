---
name: employer-trust-signals
description: How jobseekers judge employers — DTI badge, website/social, and reviews
metadata:
  type: project
---

To help jobseekers judge an employer before applying, three trust signals are surfaced on the jobseeker **job detail page** (`app/jobseeker/jobs/[id]/page.tsx`, fed by `/api/jobs/[id]` → `JobDetailResponse`):
1. **DTI-registered badge** — shown if `employers.dti_registration_file` is set (optional cert).
2. **Website + social links** — `employers.website` + `employers.social_links` (jsonb array).
3. **Reviews/ratings** — average stars + count + recent reviews.

**Employer reviews:** table `employer_reviews` (employer_id, jobseeker_id, rating 1–5, comment; unique per employer+jobseeker; FKs to employers/jobseekers). API `GET/POST /api/employers/[id]/reviews`. **Eligibility: only a jobseeker who APPLIED to that employer may review** (POST checks an `applications` row exists for applicant_id+employer_id). One review per jobseeker (upsert). The review form lives on the jobseeker **application detail** page (`app/jobseeker/applications/[id]`); reviewer shown publicly as first name + last initial. GET also returns `canReview` + `myReview` for the current jobseeker. Related: [[data-minimization]].
