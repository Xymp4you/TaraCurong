---
name: data-minimization
description: Deliberate decision to NOT collect confidential employer compliance/identity docs
metadata:
  type: project
---

TaraCurong is a **student / community project, explicitly "not a government service"** (see the About page). Decision (2026-05-27): it must **not** collect confidential employer compliance & identity documents — doing so creates Data Privacy Act (RA 10173) liability disproportionate to the project.

**Removed from collection + display + API acceptance** (DB columns intentionally LEFT in place — unused, non-destructive): employer compliance docs (`bir_2303_file`, `business_permit_file`, `dole_certification_file`, `company_profile_file`, `srs_form_file`, `company_tax_id`/TIN) and representative identity (`rep_full_name`/`rep_date_of_birth`/`rep_id_file`/`rep_selfie_file`/`authorization_confirmed`, etc.). Touched: app/employer/profile/employer-wizard.tsx (removed identity + documents tabs), app/admin/employers/[id]/page.tsx (removed compliance/SRS-cert sections), validation-schemas.ts, app/api/employer/profile + admin/employers/create + upload/employer-document.

**Do NOT re-add confidential-document collection.** Still-open related items: the jobseeker identity page (app/jobseeker/verify-identity — collects govt ID + selfie, same concern), the SRS approval workflow (app/api/admin/employers/[id]/srs), srsPrepared*/srsSubscriberIntent metadata still collected, and storage-bucket privacy not yet audited. Related: [[admin-auth-model]].
