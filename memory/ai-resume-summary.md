---
name: ai-resume-summary
description: AI-generated professional summary for jobseekers — Groq, needs GROQ_API_KEY
metadata:
  type: project
---

Jobseekers can generate an AI **professional summary** of themselves, review/edit it, and have it surfaced to employers/admins.

- Column: `jobseekers.resume_summary text` (migration `docs/migrations/20260528_add_resume_summary.sql`).
- Generate endpoint: `POST /api/jobseeker/resume-summary` — downloads the resume from the **private** `resumes` bucket (service role), extracts text via `pdf-parse` (imported as `pdf-parse/lib/pdf-parse.js` to dodge its index.js debug code; `serverExternalPackages: ["pdf-parse"]` in next.config). If the PDF yields <200 chars (e.g. scanned/image PDF), it **falls back to structured CV data** (`jobseeker_experience` + `jobseeker_education` + `jobseekers.other_skills`). Summarizes with **Groq `llama-3.3-70b-versatile`** (same model as [[employer-trust-signals]]'s matching stack), strict "use only facts present" prompt.
- **Requires `GROQ_API_KEY` (or `GROQ_API_KEYS`) — currently NOT configured.** Degrades gracefully: returns 503 `AI_NOT_CONFIGURED` / 422 `NO_SOURCE` with friendly messages; the UI shows them and the jobseeker can still write the summary by hand.
- Persisted via the normal profile PUT (`resumeSummary` added to `jobseekerProfileUpdateSchema`; PUT auto-converts camelCase→snake_case).
- UI: editable "Professional summary" Card on `app/jobseeker/profile/page.tsx` (Generate + Save, labeled AI-assisted/review-before-saving). Displayed on the **admin applicant detail** (`app/admin/applicants/[id]`) and the **employer applications drawer** (`app/employer/applications/page.tsx`, fed by `resume_summary` added to the jobseekers embed in `/api/employer/applications`) — the employer drawer's old *fabricated* "Why this matches" rationale was replaced by this real summary. Relates to [[data-minimization]] (resume stays private; only the jobseeker-approved summary is shared).
