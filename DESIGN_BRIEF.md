# TaraCurong — MVP Design Brief

> Paste this entire document into Claude (or any design tool) as the system prompt / project brief. It is self-contained — the reader does not have access to the codebase.

---

## 1. What I'm building

**TaraCurong** is a community job-matching platform for Tacurong City, built by **John Aerol Tapales**, an IT student. It connects local jobseekers with verified employers and offers an optional QR-coded referral slip flow. It is **not** a government service and is not affiliated with any LGU or national agency.

The goal: every screen should feel **trustworthy, calm, and approachable** — clear enough for a tricycle driver or a fresh graduate to use on a phone, while still looking polished. Aim for "well-built community tool", not "government office".

**Three user roles, three portals:**
- **Jobseeker** — finds jobs, applies, tracks application status, receives referral slips with QR codes
- **Employer** — posts jobs, reviews applicants, updates application status, gets AI-recommended candidates
- **Admin** — approves new employers, issues/tracks referral slips, monitors the matching engine, runs compliance reports

---

## 2. Tone, language & brand

- **Audience**: Tacurong City residents (mixed digital literacy, mostly mobile). Tagalog/Bisaya speakers — copy stays in English but plain.
- **Voice**: Clear but human. "Sign in", not "Login". "Submit your application", not "Apply now!!". No marketing exclamation marks. No emojis.
- **Trust signals**: Honest about being a community project; mention that employer profiles are manually reviewed. Avoid claims of government affiliation. Tagline: "A community job platform for Tacurong City".
- **Logo**: TaraCurong logo (circular seal). Goes top-left in headers, matched in footer.

---

## 3. Visual language (current — keep or evolve, your call)

**Palette** (Tailwind tokens currently in use):
- Primary text / brand: `slate-900` (#0f172a)
- Primary action: `sky-600` / `sky-700` (#0284c7) — buttons, links, focus rings
- Success / approved / hired: `emerald-600` (#059669)
- Warning / pending: `amber-600` (#d97706)
- Danger / rejected: `rose-600` / `red-600`
- Role accents: **cyan** for jobseekers, **violet** for employers, **red** for admin
- Surfaces: white cards on `slate-50` page background

**Type**: Satoshi (Fontshare). Headings semibold/bold, body regular.

**Radius**: 8px on inputs/buttons, 16px on cards, 24px+ on hero panels.

**Motion**: Subtle. Framer Motion fade/slide on page entry. No bouncy springs.

You can refresh this — but keep the "calm, trustworthy, community-built" feel. Avoid: neon gradients, dark mode by default, playful illustrations, fintech-y purples, and anything that implies government endorsement.

---

## 4. Tech constraints (so designs are buildable)

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS + **shadcn/ui** components (Card, Button, Input, Dialog, Tabs, Select, Avatar, Badge, Skeleton, Table, Sheet, DropdownMenu)
- Radix primitives under the hood
- Lucide icons only
- Recharts for charts
- Mobile-first — most users are on phones

Don't propose anything that needs a custom UI library, exotic animations, or 3D.

---

## 5. Sitemap — every page in scope

### Public / marketing
- `/` — Homepage (hero, what is TaraCurong, who it's for, partners, CTA to sign up)
- `/about`, `/contact`, `/help`, `/privacy`, `/training`, `/status`, `/get-started`
- `/referral/[slipNumber]` — **public**, QR-scannable referral slip page (employer scans this)

### Auth
- `/login` (role-aware: jobseeker or employer)
- `/login/admin` (separate, more austere)
- `/signup`, `/signup/jobseeker`, `/signup/employer`, `/signup/admin-request`
- `/verify-email`, `/reset-password`, `/auth/error`

### Jobseeker portal (left sidebar nav)
- Dashboard — profile completeness, recent applications, recommended jobs, referral slips count
- Jobs — search + filters (work setup, employment type, salary range, location)
- Job detail — full description + Apply button
- Applications — list grouped/filtered by status pipeline: `submitted → under_review → shortlisted → interview → hired / rejected / withdrawn`
- Application detail — status timeline, employer feedback, withdraw button
- Saved jobs
- Referrals — grid of slip cards with QR badge, status, expiry
- Messages — thread list + chat panel (employer ↔ jobseeker, admin announcements)
- Notifications
- Profile — profile fields: name, contact, address, education, skills, work experience, languages, licenses, trainings
- Settings — account, security, privacy

### Employer portal (left sidebar nav, violet accent)
- Dashboard — active jobs, pipeline funnel, new applicants, top matches
- Jobs — manage postings (draft / pending / active / closed / archived)
- Job detail → Applications — table of applicants per job; per-row status update (same pipeline as above) + feedback textarea
- Matching — AI-recommended candidates for a job, scored, with a one-paragraph AI rationale
- Messages, Notifications
- Profile — company / establishment details (profile fields: TIN, industry, address, contact person)
- Settings

### Admin portal (left sidebar nav, red/slate accent — feels more "console")
- Dashboard — 7 stat cards (jobseekers, employers, jobs, applications, pending employers, pending jobs, pending admin requests) + monthly trend line + job-status pie + referral status pie + top employers list
- Employers — table + status filter (pending / approved / suspended / archived); approve/suspend actions
- Employer detail — full full profile data
- Jobs — table of all jobs across employers; status moderation
- Applicants — cross-portal list of every application
- Matching — overall matching engine console; per-job match view
- Referrals — issue new slip (jobseeker × job × employer), track status (issued / hired / not_hired / expired)
- Users — manage jobseeker accounts
- Audit logs — append-only event stream
- Notifications, Messages
- Analytics, Reports — exportable compliance reports
- Access requests — review admin-account requests
- Auth settings, Settings — global config
- Archived employers / archived jobs

---

## 6. Core flows the design must make obvious

### Flow A — Jobseeker applies
1. Browse jobs (filter chips at top, card grid below)
2. Open job → read description, salary, requirements
3. Click "Submit application" → confirmation modal → success state with link to "Track in Applications"
4. In Applications, see a **horizontal status pipeline** with the current step highlighted

### Flow B — Employer reviews
1. Employer sees a job's applicants in a table
2. Each row: avatar, name, match score (0–100 badge), applied date, current status pill
3. Row click → side sheet / drawer with full profile + resume + cover letter
4. Buttons in the sheet move them through the pipeline (Reviewed → Shortlisted → Interview → Hired / Rejected). Each action shows a success toast.

### Flow C — Admin approves an employer
1. Admin lands on dashboard → "X employers pending" stat card is the obvious thing to click
2. Pending list → row → detail page with all submitted info + uploaded Employer Profile
3. Two big buttons at the bottom: "Approve" (emerald) and "Reject" (rose), with a required reason on reject
4. After action: row disappears from pending, employer is notified

### Flow D — Referral slip (the killer feature)
1. Admin issues a slip: picks jobseeker → picks job → confirms → system generates a slip number + QR
2. Jobseeker sees the slip in their portal, can show the QR on their phone at the employer's office
3. Employer scans QR → opens `/referral/[slipNumber]` (public page) → marks "Hired" or "Not hired"
4. That outcome syncs back into both portals and into admin analytics

### Flow E — AI matching (for employers and admins)
1. From a job, click "Find matches"
2. See a ranked list of jobseekers with: match score, top-3 reasons (skill overlap, experience level, location), one-paragraph AI-generated rationale
3. Send a message or invite to apply directly from the row

---

## 7. Components I need designed (priority order)

**Must-have (MVP)**
1. **Status pipeline component** — horizontal stepper with 5–7 nodes, current step highlighted, used in Applications. Mobile version: vertical.
2. **Application/Job card** — used in lists. Title, company, location, salary, status pill, "saved" bookmark, applied date.
3. **Referral slip card** — distinct from job card. Slip number, QR icon, job title, employer, validity period, status badge. Has an "official document" feel.
4. **Public referral slip page** (`/referral/[slipNumber]`) — full-page, printable-looking, with big QR, slip number, jobseeker name, job, employer, validity, and the action button for employers ("Mark as Hired" / "Mark as Not Hired"). This is the most "community-trustworthy" surface.
5. **Role-aware login / signup** — one design with subtle role-color accent (cyan jobseeker, violet employer, red admin).
6. **Three dashboards** (jobseeker, employer, admin) — they share a shell (sidebar + topbar) but the dashboard contents are very different. See section 5 for what each shows.
7. **Approval queue page** (admin) — table with quick-approve/reject and an inline expand.
8. **Match results page** — ranked list with score badges and AI rationale.
9. **Messaging** — Slack-lite: left rail of threads, right panel of messages, composer at bottom. Plus a small "from admin" announcement style.
10. **Empty states** — for every list (no jobs match, no applications yet, no referrals yet). Warm, official tone, no cartoons.

**Nice-to-have**
- Profile completion meter (jobseeker)
- Pipeline funnel chart (employer dashboard)
- Compliance report layout (admin) — exportable PDF look
- Audit log row design

---

## 8. Statuses to design pills/badges for

Get these consistent across the whole app:

**Application**: `submitted` (slate) · `under_review` (sky) · `shortlisted` (violet) · `interview` (amber) · `hired` (emerald) · `rejected` (rose) · `withdrawn` (slate-dashed)

**Job**: `draft` (slate) · `pending` (amber) · `active` (emerald) · `closed` (slate) · `archived` (slate-muted) · `rejected` (rose) · `suspended` (rose)

**Employer**: `pending` (amber) · `approved` (emerald) · `suspended` (rose) · `archived` (slate)

**Referral slip**: `issued` (sky) · `hired` (emerald) · `not_hired` (rose) · `expired` (slate)

---

## 9. What I'd love you to deliver

1. A **style sheet**: colors, type scale, spacing, shadow, radius, button states, input states, badge variants for every status above.
2. **High-fidelity mockups** (desktop + mobile) for the priority components in section 7. Static screens are fine; no prototyping required.
3. The **public referral slip page** as a hero piece — this is the "wow" surface that admin officers will show off.
4. A short **Figma file structure** I can hand to a frontend dev: components on one page, screens on another, tokens documented.

If you want to **propose a refresh** of the current sky/violet/red palette, please show one option that keeps "government official" feeling and one option that's more modern. Don't just default to generic SaaS purple.

---

## 10. Out of scope (don't design these)

- Marketing site beyond the homepage
- Onboarding tour / product tutorial
- Native mobile apps (web-only)
- Dark mode (could come later — design light-first)
- Internationalization (English-only for v1)
- Settings deep-dives (notification prefs, integrations) — placeholder ok

---

**One-line summary**: *Design a calm, official-feeling, mobile-first job platform for a Philippine government employment office, with three role-specific portals, a strong status-pipeline pattern, and a hero "referral slip with QR" surface.*
