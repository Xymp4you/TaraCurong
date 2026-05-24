// Single source of truth for demo/static mode detection.
// Demo mode is on whenever the real Supabase env vars are missing
// or when NEXT_PUBLIC_DEMO_MODE is explicitly set to "true".
export const isDemoMode = (): boolean => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const DEMO_ROLE_COOKIE = "demo-role"
export const DEMO_USER_ID_COOKIE = "demo-user-id"

export type DemoRole = "admin" | "employer" | "jobseeker"

export const DEMO_USERS: Record<DemoRole, { id: string; email: string; name: string }> = {
  admin: { id: "demo-admin-1", email: "admin@demo.local", name: "Demo Admin" },
  employer: { id: "demo-employer-1", email: "employer@demo.local", name: "Demo Employer" },
  jobseeker: { id: "demo-jobseeker-1", email: "jobseeker@demo.local", name: "Demo Jobseeker" },
}

// Client-side cookie writer used by login/signup flows in demo mode so the
// role chosen on the form (not the email heuristic) is what middleware sees.
export const setDemoRoleCookie = (role: DemoRole | null): void => {
  if (typeof document === "undefined") return
  if (role) {
    document.cookie = `${DEMO_ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=86400`
  } else {
    document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0`
  }
}
