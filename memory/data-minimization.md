---
name: data-minimization
description: Deliberate decision to NOT collect confidential employer compliance/identity docs
metadata:
  type: project
---

TaraCurong is a **student / community project, explicitly "not a government service"** (see the About page). Decision (2026-05-27): it must **not** collect confidential employer compliance & identity documents — doing so creates Data Privacy Act (RA 10173) liability disproportionate to the project.

**Removed from collection + display + API acceptance** (DB columns intentionally LEFT in place — unused, non-destructive): employer compliance docs (`bir_2303_file`, `business_permit_file`, `dole_certification_file`, `company_profile_file`, `srs_form_file`, `company_tax_id`/TIN) and representative identity (`rep_full_name`/`rep_date_of_birth`/`rep_id_file`/`rep_selfie_file`/`authorization_confirmed`, etc.). Touched: app/employer/profile/employer-wizard.tsx (removed identity + documents tabs), app/admin/employers/[id]/page.tsx (removed compliance/SRS-cert sections), validation-schemas.ts, app/api/employer/profile + admin/employers/create + upload/employer-document.

**Do NOT re-add the REMOVED confidential docs** (BIR/permit/DOLE/rep-ID/selfie). EXCEPTION (2026-05-28, user decision): employers can OPTIONALLY upload a **DTI Business Registration Certificate** (made optional 2026-05-28 — many small/informal province businesses aren't registered, so requiring it would exclude them). Multipart in `app/api/auth/signup/employer/route.ts`, stored as a path in the PRIVATE `employer-documents` bucket on `employers.dti_registration_file`, accepts PDF or image. Employers who provide it get a **"DTI-registered" badge** (admin employers list). Viewed via `GET /api/files/employer-document?path=...` (admin or owning employer) + shown in admin employer detail. Still-open related items: the jobseeker identity page (app/jobseeker/verify-identity — collects govt ID + selfie, same concern), the SRS approval workflow (app/api/admin/employers/[id]/srs), srsPrepared*/srsSubscriberIntent metadata still collected. Related: [[admin-auth-model]].

**Resumes (added 2026-05-27):** jobseekers CAN upload a resume (legitimate — their own doc). Stored on `jobseekers.resume_url` as a **storage PATH** in a **PRIVATE** `resumes` bucket. Viewing goes through `GET /api/files/resume?path=...` which authorizes (owner jobseeker / employer who received that application / admin) and 302-redirects to a short-lived signed URL. The apply flow auto-attaches the profile resume to `applications.resume_url`.

**Chat attachments (added 2026-05-27):** now have their OWN private `message-attachments` bucket. Upload via `POST /api/upload/message-attachment` (images + PDF/DOC, 10MB) → returns path → stored in `messages.attachment_urls` (jsonb path array). View via `GET /api/files/message-attachment?path=...` authorized to message participants (sender/recipient) only. (Previously chat piggybacked on the resume endpoint AND attachments were never even persisted — both fixed.) Same private-bucket + signed-URL pattern as resumes.
