"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Seal } from "@/components/gw/atoms";
import { validatePasswordRules } from "@/lib/password-rules";

type SignupRole = "jobseeker" | "employer";

const STEPS = [
  { key: "account", label: "Account" },
  { key: "personal", label: "Personal" },
  { key: "skills", label: "Skills" },
  { key: "done", label: "Done" },
] as const;

function SignupLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<SignupRole>("jobseeker");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const livePasswordErrors = useMemo(
    () => (password.length ? validatePasswordRules(password).errors : []),
    [password],
  );
  const liveConfirmPasswordError =
    confirmPassword.length && password !== confirmPassword ? "Passwords do not match" : "";

  // Strength: 0–4 bars filled
  const strengthScore = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);
  const strengthLabel =
    strengthScore <= 1 ? "Weak" : strengthScore === 2 ? "Fair" : strengthScore === 3 ? "Good" : "Strong";

  useEffect(() => {
    const roleParam = searchParams?.get("role");
    if (roleParam === "jobseeker" || roleParam === "employer") setRole(roleParam);
  }, [searchParams]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const nextErrors: Record<string, string> = {};
    if (role === "jobseeker") {
      if (!firstName.trim()) nextErrors.firstName = "First name is required";
      if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    } else if (!companyName.trim()) {
      nextErrors.companyName = "Company name is required";
    }
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else {
      const validation = validatePasswordRules(password);
      if (!validation.isValid) nextErrors.password = validation.errors[0] || "Invalid password";
    }
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) nextErrors.terms = "You must agree to the terms to continue";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === "jobseeker" ? "/api/auth/signup/jobseeker" : "/api/auth/signup/employer";
      const payload =
        role === "jobseeker"
          ? { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password }
          : { establishmentName: companyName.trim(), email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }
      router.push(
        role === "jobseeker" ? "/login?role=jobseeker&registered=1" : "/login?role=employer&registered=1",
      );
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eyebrow = role === "jobseeker" ? "Create a jobseeker account" : "Register your establishment";
  const headline =
    role === "jobseeker"
      ? "Let’s get you set up to find work."
      : "Let’s get your company verified to hire.";
  const subhead =
    role === "jobseeker"
      ? "It takes about 3 minutes. You can finish your full profile later."
      : "Tell us about your establishment. A TaraCurong officer will review and approve within 2–3 business days.";
  const ctaLabel =
    role === "jobseeker" ? "Continue to personal details" : "Continue to compliance documents";

  return (
    <div className="gw" style={{ background: "var(--paper)", minHeight: "100vh", padding: "40px 0" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
            <Seal size={36} role="teal" />
            <div style={{ font: "600 16px/1 var(--font-ui)" }}>TaraCurong</div>
          </Link>
          <span style={{ flex: 1 }} />
          <span className="tx-caption">
            Already have an account?{" "}
            <Link href={`/login?role=${role}`} style={{ color: "var(--teal)", fontWeight: 500 }}>Sign in</Link>
          </span>
        </div>

        {/* Role toggle (preserve existing role-aware flow) */}
        <div className="gw-toggle" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={role === "jobseeker" ? "active" : ""}
            onClick={() => setRole("jobseeker")}
          >
            Jobseeker
          </button>
          <button
            type="button"
            className={role === "employer" ? "active" : ""}
            onClick={() => setRole("employer")}
          >
            Employer
          </button>
        </div>

        <div className="tx-eyebrow" style={{ color: "var(--teal)" }}>{eyebrow}</div>
        <h1 className="tx-serif" style={{ marginTop: 14, fontSize: 32, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.028em" }}>
          {headline}
        </h1>
        <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-3)" }}>{subhead}</p>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, marginBottom: 24 }}>
          {STEPS.map((s, i, arr) => {
            const current = i === 0;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12, flex: i < arr.length - 1 ? 1 : "0 0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: current ? "var(--ink)" : "var(--surface)",
                      border: current ? "none" : "1px solid var(--ink-6)",
                      color: current ? "#fff" : "var(--ink-4)",
                      display: "grid",
                      placeItems: "center",
                      font: "500 11px/1 var(--font-mono)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ font: "500 12.5px/1 var(--font-ui)", color: current ? "var(--ink)" : "var(--ink-4)" }}>
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "var(--ink-7)" }} />}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="gw-card" style={{ padding: 28 }}>
            {error && (
              <div
                style={{
                  marginBottom: 16,
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

            {role === "jobseeker" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="gw-label">First name</label>
                  <input
                    className="gw-input"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFieldError("firstName");
                    }}
                    placeholder="Juan Miguel"
                    autoComplete="given-name"
                  />
                  {fieldErrors.firstName && (
                    <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors.firstName}</div>
                  )}
                </div>
                <div>
                  <label className="gw-label">Last name</label>
                  <input
                    className="gw-input"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearFieldError("lastName");
                    }}
                    placeholder="Cruz"
                    autoComplete="family-name"
                  />
                  {fieldErrors.lastName && (
                    <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors.lastName}</div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="gw-label">Company name</label>
                <input
                  className="gw-input"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    clearFieldError("companyName");
                  }}
                  placeholder="Your Company Inc."
                  autoComplete="organization"
                />
                {fieldErrors.companyName && (
                  <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors.companyName}</div>
                )}
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label className="gw-label">Email address</label>
              <input
                type="email"
                className="gw-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                placeholder={role === "jobseeker" ? "you@example.com" : "company@example.com"}
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors.email}</div>
              ) : (
                <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                  We&apos;ll send a verification code here.
                </div>
              )}
            </div>

            {role === "jobseeker" && (
              <div style={{ marginTop: 14 }}>
                <label className="gw-label">Mobile number</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    className="gw-input"
                    style={{ width: 80, display: "flex", alignItems: "center", gap: 6, cursor: "default" }}
                  >
                    <span className="tx-mono" style={{ fontSize: 13 }}>+63</span>
                    <ChevronDown size={12} style={{ color: "var(--ink-4)" }} />
                  </div>
                  <input
                    className="gw-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="928 401 8842"
                    autoComplete="tel"
                    style={{ flex: 1 }}
                  />
                </div>
                <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                  Optional — used for SMS interview reminders.
                </div>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label className="gw-label">Password</label>
              <input
                type="password"
                className="gw-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                placeholder="Choose a strong password"
                autoComplete="new-password"
              />
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background:
                        i < strengthScore
                          ? strengthScore >= 3
                            ? "var(--emerald)"
                            : strengthScore === 2
                            ? "var(--amber)"
                            : "var(--rose)"
                          : "var(--ink-7)",
                    }}
                  />
                ))}
              </div>
              {livePasswordErrors.length > 0 ? (
                <div style={{ marginTop: 6 }}>
                  {livePasswordErrors.map((m) => (
                    <div key={m} className="tx-micro" style={{ color: "var(--rose)" }}>{m}</div>
                  ))}
                </div>
              ) : (
                <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-3)" }}>
                  {password ? `${strengthLabel} · ${password.length} characters` : "Use 8+ chars with upper/lowercase, number, and symbol."}
                </div>
              )}
              {fieldErrors.password && (
                <div className="tx-micro" style={{ marginTop: 4, color: "var(--rose)" }}>{fieldErrors.password}</div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="gw-label">Confirm password</label>
              <input
                type="password"
                className="gw-input"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              {(fieldErrors.confirmPassword || liveConfirmPasswordError) && (
                <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>
                  {fieldErrors.confirmPassword || liveConfirmPasswordError}
                </div>
              )}
            </div>

            <label
              style={{
                marginTop: 18,
                padding: 14,
                background: "var(--paper)",
                borderRadius: "var(--r-2)",
                display: "flex",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  clearFieldError("terms");
                }}
                style={{ marginTop: 2 }}
              />
              <span className="tx-caption" style={{ fontSize: 12.5 }}>
                I agree to the <Link href="/terms" style={{ color: "var(--teal)" }}>terms of use</Link> and the{" "}
                <Link href="/privacy" style={{ color: "var(--teal)" }}>data privacy notice</Link> under R.A. 10173.
                TaraCurong will only use my data for employment matching.
              </span>
            </label>
            {fieldErrors.terms && (
              <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors.terms}</div>
            )}

            <button
              type="submit"
              disabled={loading || livePasswordErrors.length > 0 || Boolean(liveConfirmPasswordError)}
              className="gw-btn gw-btn--lg gw-btn--accent gw-btn--block"
              style={{ marginTop: 18, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account…" : ctaLabel} <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 22, color: "var(--ink-4)" }}>
          <span className="tx-micro">
            Need help? Visit{" "}
            <Link href="/contact" style={{ color: "var(--teal)" }}>TaraCurong</Link> at City Hall · Mon–Fri 8am–5pm
          </span>
        </div>
      </div>
    </div>
  );
}

function SignupPageFallback() {
  return (
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
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupLandingPage />
    </Suspense>
  );
}
