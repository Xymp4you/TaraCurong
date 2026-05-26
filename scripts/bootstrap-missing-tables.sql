-- ============================================================
-- Bootstrap tables that the app references but which aren't
-- defined in any migration file. Schema is best-effort, derived
-- from how each table is used in the app code.
-- ============================================================

-- ---- users (auth/role linkage) ----
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY,
  name          TEXT,
  email         TEXT UNIQUE,
  password_hash TEXT,
  role          TEXT,
  city          TEXT,
  province      TEXT,
  employment_status TEXT,
  registration_date TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- admins ----
CREATE TABLE IF NOT EXISTS public.admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role          TEXT DEFAULT 'admin',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- messages (phase1_migration ALTERs this) ----
CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID,
  recipient_id  UUID,
  content       TEXT,
  read          BOOLEAN DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- notifications ----
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  role          TEXT,
  type          TEXT,
  title         TEXT,
  body          TEXT,
  data          JSONB DEFAULT '{}'::jsonb,
  read          BOOLEAN DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- account_deletion_requests ----
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  role          TEXT,
  email         TEXT,
  status        TEXT DEFAULT 'pending',
  reason        TEXT,
  requested_at  TIMESTAMPTZ DEFAULT NOW(),
  delete_after  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- admin_access_requests ----
CREATE TABLE IF NOT EXISTS public.admin_access_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT UNIQUE,
  phone         TEXT,
  organization  TEXT,
  notes         TEXT,
  status        TEXT DEFAULT 'pending',
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- settings (user-scoped key/value) ----
CREATE TABLE IF NOT EXISTS public.settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,
  role          TEXT,
  key           TEXT,
  value         JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- services (landing/public service list) ----
CREATE TABLE IF NOT EXISTS public.services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  description   TEXT,
  icon          TEXT,
  url           TEXT,
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- experience_highlights (jobseeker profile highlight items) ----
CREATE TABLE IF NOT EXISTS public.experience_highlights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,
  title         TEXT,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- video_content (landing-page video assets) ----
CREATE TABLE IF NOT EXISTS public.video_content (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  description   TEXT,
  url           TEXT,
  thumbnail_url TEXT,
  video_type    TEXT,
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- trust_signals (landing-page trust indicators) ----
CREATE TABLE IF NOT EXISTS public.trust_signals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label         TEXT,
  description   TEXT,
  value         TEXT,
  icon          TEXT,
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- account_email_verifications ----
CREATE TABLE IF NOT EXISTS public.account_email_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,
  email         TEXT,
  token         TEXT UNIQUE,
  expires_at    TIMESTAMPTZ,
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- auth_lifecycle_tokens ----
CREATE TABLE IF NOT EXISTS public.auth_lifecycle_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,
  token         TEXT UNIQUE,
  purpose       TEXT,
  expires_at    TIMESTAMPTZ,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- bookmarks ----
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- ---- employer_requirements ----
CREATE TABLE IF NOT EXISTS public.employer_requirements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id   UUID REFERENCES employers(id) ON DELETE CASCADE,
  requirement   TEXT,
  is_mandatory  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- job_requirements ----
CREATE TABLE IF NOT EXISTS public.job_requirements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id) ON DELETE CASCADE,
  requirement   TEXT,
  is_mandatory  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---- skill_suggestions ----
CREATE TABLE IF NOT EXISTS public.skill_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill         TEXT,
  category      TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
