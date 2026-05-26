"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Seal } from "@/components/gw/atoms";
import { createClient } from "@/lib/supabase-client";

type UserRole = "jobseeker" | "employer" | "admin";

const ROLE_INFO: Record<UserRole, { color: string; label: string; desc: string }> = {
  jobseeker: {
    color: "var(--role-jobseeker)",
    label: "Jobseeker",
    desc: "Apply to jobs and track your applications.",
  },
  employer: {
    color: "var(--role-employer)",
    label: "Employer",
    desc: "Post jobs and manage applicants.",
  },
  admin: {
    color: "var(--role-admin)",
    label: "Admin",
    desc: "Authorized officers only.",
  },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("juan.cruz@gmail.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("jobseeker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const getFriendlyAuthError = (authError?: string) => {
    if (!authError) return "Sign in failed";
    if (authError.includes("Invalid login credentials")) return "Invalid email or password.";
    return authError || "Sign in failed. Please try again.";
  };

  useEffect(() => {
    const roleParam = searchParams?.get("role");
    if (roleParam === "admin") {
      router.replace("/login/admin");
      return;
    }
    if (roleParam === "employer" || roleParam === "jobseeker") {
      setRole(roleParam);
    }
  }, [router, searchParams]);

  const handleRoleToggle = (next: UserRole) => {
    if (next === "admin") {
      router.push("/login/admin");
      return;
    }
    setRole(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(getFriendlyAuthError(authError.message));
      } else if (data.user) {
        const dashboardPaths: Record<Exclude<UserRole, "admin">, string> = {
          employer: "/employer/dashboard",
          jobseeker: "/jobseeker/dashboard",
        };
        router.push(role === "admin" ? "/admin/dashboard" : dashboardPaths[role]);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/${role}/dashboard`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const info = ROLE_INFO[role];
  const signupPath = `/signup?role=${role === "admin" ? "jobseeker" : role}`;

  return (
    <div
      className="gw grid lg:grid-cols-2 min-h-screen"
      style={{ background: "var(--paper)" }}
    >
      {/* ===== Left: identity rail ===== */}
      <div
        className="hidden lg:flex p-14 flex-col justify-between relative"
        style={{
          borderRight: "1px solid var(--ink-7)",
          background: "var(--surface)",
        }}
      >
        <div
          aria-hidden
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: info.color }}
        />
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
            <Seal size={36} />
            <div style={{ font: "600 16px/1 var(--font-ui)" }}>TaraCurong</div>
          </Link>
          <h1
            className="tx-serif"
            style={{
              marginTop: 72,
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.028em",
              maxWidth: 460,
            }}
          >
            Sign in to your<br />
            <span style={{ color: info.color }}>{info.label.toLowerCase()}</span> portal.
          </h1>
          <p className="tx-body-lg" style={{ marginTop: 16, maxWidth: 440 }}>{info.desc}</p>
        </div>
        <div>
          <div className="tx-eyebrow" style={{ marginBottom: 12 }}>About</div>
          <p className="tx-caption" style={{ maxWidth: 380, color: "var(--ink-4)" }}>
            A free community job platform for Tacurong City. Built by an IT student — not a government service.
          </p>
        </div>
      </div>

      {/* ===== Right: form ===== */}
      <div
        className="px-5 py-10 sm:px-10 sm:py-12 lg:p-14 flex flex-col justify-center"
        style={{ background: "var(--paper)" }}
      >
        {/* Mobile brand header (only on small screens) */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-3 no-underline text-inherit">
            <Seal size={32} />
            <div style={{ font: "600 16px/1 var(--font-ui)" }}>TaraCurong</div>
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full mx-auto"
          style={{ maxWidth: 380 }}
          noValidate
        >
          {/* Role toggle */}
          <div className="gw-toggle" style={{ marginBottom: 36 }}>
            {(["jobseeker", "employer", "admin"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={role === k ? "active" : ""}
                onClick={() => handleRoleToggle(k)}
              >
                {k === "jobseeker" ? "Jobseeker" : k === "employer" ? "Employer" : "Admin"}
              </button>
            ))}
          </div>

          <div className="tx-h2" style={{ marginBottom: 6 }}>Welcome back</div>
          <div className="tx-caption" style={{ marginBottom: 28 }}>
            Don&apos;t have an account yet?{" "}
            <Link href={signupPath} style={{ color: info.color, fontWeight: 500 }}>Create one</Link>.
          </div>

          {searchParams?.get("registered") === "1" && (
            <div
              style={{
                marginBottom: 18,
                padding: "10px 14px",
                background: "var(--emerald-bg)",
                color: "var(--emerald)",
                borderRadius: "var(--r-2)",
                font: "500 12.5px/1.4 var(--font-ui)",
              }}
            >
              Registration submitted successfully. Please sign in.
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 18,
                padding: "10px 14px",
                background: "var(--rose-bg)",
                color: "var(--rose)",
                borderRadius: "var(--r-2)",
                font: "500 12.5px/1.4 var(--font-ui)",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="gw-label">Email address</label>
            <input
              type="email"
              className="gw-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>
                {fieldErrors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="gw-label">Password</label>
              <Link href="/reset-password" className="tx-micro" style={{ color: info.color }}>
                Forgot password
              </Link>
            </div>
            <input
              type="password"
              className="gw-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>
                {fieldErrors.password}
              </div>
            )}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer" }}>
            <input type="checkbox" defaultChecked />
            <span className="tx-caption">Keep me signed in on this device</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="gw-btn gw-btn--lg gw-btn--block"
            style={{
              background: info.color,
              color: "#fff",
              marginTop: 28,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"} <ArrowRight size={14} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--ink-7)" }} />
            <span className="tx-micro">OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--ink-7)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="gw-btn gw-btn--ghost gw-btn--block"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.33-1.36-.33-2.09s.11-1.43.33-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <Link href="/verify-email" className="tx-micro" style={{ color: "var(--ink-3)" }}>
              Need to verify your email?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="gw"
          style={{
            minHeight: "100vh",
            background: "var(--paper)",
            display: "grid",
            placeItems: "center",
            color: "var(--ink-4)",
          }}
        >
          <span className="tx-mono" style={{ fontSize: 12, letterSpacing: "0.1em" }}>LOADING…</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
