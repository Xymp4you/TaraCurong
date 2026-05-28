"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronDown, FileText, Globe, Link2, Plus, X } from "lucide-react";
import { Seal } from "@/components/gw/atoms";
import { validatePasswordRules } from "@/lib/password-rules";

type SignupRole = "jobseeker" | "employer";

const JOBSEEKER_STEPS = [
  { key: "account", label: "Account" },
  { key: "personal", label: "Personal" },
  { key: "skills", label: "Skills" },
  { key: "done", label: "Done" },
] as const;

const EMPLOYER_STEPS = [
  { key: "account", label: "Account" },
  { key: "establishment", label: "Establishment" },
  { key: "trust", label: "Trust" },
  { key: "done", label: "Done" },
] as const;

const GENDERS = ["Male", "Female", "Prefer not to say"];
const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated", "Divorced"];
const INDUSTRIES = [
  "Agriculture & Farming",
  "Food & Beverage",
  "Retail / Sari-sari Store",
  "Manufacturing",
  "Construction",
  "Healthcare & Pharmacy",
  "Education",
  "Information Technology",
  "Hospitality (Hotel / Restaurant)",
  "Transportation & Logistics",
  "Finance & Banking",
  "Professional Services",
  "Other",
];
const DTI_ACCEPT = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

function SignupLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<SignupRole>("jobseeker");
  const [step, setStep] = useState(0);

  // Shared account fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Jobseeker-only account
  const [mobile, setMobile] = useState("");
  const [facebookLink, setFacebookLink] = useState("");

  // Jobseeker personal
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [barangay, setBarangay] = useState("");
  const [seekerCity, setSeekerCity] = useState("Tacurong City");
  const [seekerProvince, setSeekerProvince] = useState("Sultan Kudarat");

  // Jobseeker skills
  const [occupation1, setOccupation1] = useState("");
  const [occupation2, setOccupation2] = useState("");
  const [occupation3, setOccupation3] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  // Employer establishment
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [employerCity, setEmployerCity] = useState("Tacurong City");

  // Employer trust signals
  const [dtiFile, setDtiFile] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const livePasswordErrors = useMemo(
    () => (password.length ? validatePasswordRules(password).errors : []),
    [password],
  );
  const liveConfirmPasswordError =
    confirmPassword.length && password !== confirmPassword ? "Passwords do not match" : "";

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

  const parsedSkills = useMemo(
    () => skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
    [skillsInput],
  );

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

  const switchRole = (next: SignupRole) => {
    setRole(next);
    setStep(0);
    setError("");
    setFieldErrors({});
  };

  // ---- Per-step validation ---------------------------------------------------
  const validateAccount = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (role === "jobseeker") {
      if (!firstName.trim()) e.firstName = "First name is required";
      if (!lastName.trim()) e.lastName = "Last name is required";
      if (!facebookLink.trim()) e.facebookLink = "Facebook profile link is required";
      else if (!/(facebook\.com|fb\.com|fb\.me)\/.+/i.test(facebookLink.trim()))
        e.facebookLink = "Enter a valid Facebook profile link";
    } else if (!companyName.trim()) {
      e.companyName = "Company name is required";
    }
    if (!email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else {
      const v = validatePasswordRules(password);
      if (!v.isValid) e.password = v.errors[0] || "Invalid password";
    }
    if (!confirmPassword) e.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) e.terms = "You must agree to the terms to continue";
    return e;
  };

  const validateSeekerPersonal = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!birthDate) e.birthDate = "Birth date is required";
    if (!gender) e.gender = "Select your gender";
    if (!civilStatus) e.civilStatus = "Select your civil status";
    if (!barangay.trim()) e.barangay = "Barangay is required";
    if (!seekerCity.trim()) e.seekerCity = "City/municipality is required";
    if (!seekerProvince.trim()) e.seekerProvince = "Province is required";
    return e;
  };

  const validateSeekerSkills = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!occupation1.trim()) e.occupation1 = "Add at least one preferred job";
    return e;
  };

  const validateEmployerEstablishment = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!contactPerson.trim()) e.contactPerson = "Contact person is required";
    if (!employerCity.trim()) e.employerCity = "City/municipality is required";
    if (contactPhone.trim() && !/^[\d\-+() ]+$/.test(contactPhone.trim()))
      e.contactPhone = "Use digits, spaces, +, -, or parentheses only";
    return e;
  };

  const validateEmployerTrust = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (dtiFile && !DTI_ACCEPT.includes(dtiFile.type))
      e.dtiFile = "Upload a PDF or image (PNG/JPG/WebP)";
    if (dtiFile && dtiFile.size > 10 * 1024 * 1024)
      e.dtiFile = "DTI certificate must be 10MB or smaller";
    return e;
  };

  // ---- Submit ----------------------------------------------------------------
  const submitJobseeker = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        facebookLink: facebookLink.trim(),
        password,
        birthDate,
        gender,
        civilStatus,
        barangay: barangay.trim(),
        city: seekerCity.trim(),
        province: seekerProvince.trim(),
        preferredOccupation1: occupation1.trim(),
      };
      if (mobile.trim()) payload.phone = mobile.trim();
      if (occupation2.trim()) payload.preferredOccupation2 = occupation2.trim();
      if (occupation3.trim()) payload.preferredOccupation3 = occupation3.trim();
      if (parsedSkills.length) payload.otherSkills = parsedSkills;

      const response = await fetch("/api/auth/signup/jobseeker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(data.message ?? data.error ?? "Signup failed");
        return;
      }
      setStep(3);
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitEmployer = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("establishmentName", companyName.trim());
      fd.append("email", email.trim());
      fd.append("password", password);
      if (contactPerson.trim()) fd.append("contactPerson", contactPerson.trim());
      if (contactPhone.trim()) fd.append("contactPhone", contactPhone.trim());
      if (industry) fd.append("industry", industry);
      if (employerCity.trim()) fd.append("city", employerCity.trim());
      if (website.trim()) fd.append("website", website.trim());
      const cleaned = socialLinks.map((s) => s.trim()).filter(Boolean);
      if (cleaned.length) fd.append("socialLinks", JSON.stringify(cleaned));
      if (dtiFile) fd.append("dtiRegistrationFile", dtiFile);

      // Multipart — let the browser set the Content-Type boundary.
      const response = await fetch("/api/auth/signup/employer", { method: "POST", body: fd });
      const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) {
        setError(data.message ?? data.error ?? "Signup failed");
        return;
      }
      setStep(3);
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (role === "jobseeker") {
      if (step === 0) {
        const e = validateAccount();
        if (Object.keys(e).length) return setFieldErrors(e);
        setFieldErrors({}); setStep(1);
      } else if (step === 1) {
        const e = validateSeekerPersonal();
        if (Object.keys(e).length) return setFieldErrors(e);
        setFieldErrors({}); setStep(2);
      } else if (step === 2) {
        const e = validateSeekerSkills();
        if (Object.keys(e).length) return setFieldErrors(e);
        setFieldErrors({}); await submitJobseeker();
      }
      return;
    }

    // employer
    if (step === 0) {
      const e = validateAccount();
      if (Object.keys(e).length) return setFieldErrors(e);
      setFieldErrors({}); setStep(1);
    } else if (step === 1) {
      const e = validateEmployerEstablishment();
      if (Object.keys(e).length) return setFieldErrors(e);
      setFieldErrors({}); setStep(2);
    } else if (step === 2) {
      const e = validateEmployerTrust();
      if (Object.keys(e).length) return setFieldErrors(e);
      setFieldErrors({}); await submitEmployer();
    }
  };

  const goBack = () => {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  // ---- Copy ------------------------------------------------------------------
  const eyebrow = role === "jobseeker" ? "Create a jobseeker account" : "Register your establishment";
  const headline =
    role === "jobseeker" ? "Let’s get you set up to find work." : "Let’s get your company set up to hire.";
  const subhead =
    role === "jobseeker"
      ? "It takes about 3 minutes — account, a few personal details, then your preferred work."
      : "It takes about 3 minutes — account, your establishment, then trust signals for jobseekers.";

  const seekerCta = step === 0 ? "Continue to personal details" : step === 1 ? "Continue to skills" : "Create account";
  const employerCta = step === 0 ? "Continue to establishment" : step === 1 ? "Continue to trust signals" : "Create account";
  const ctaLabel = role === "jobseeker" ? seekerCta : employerCta;

  const stepsForRole = role === "jobseeker" ? JOBSEEKER_STEPS : EMPLOYER_STEPS;

  const fieldError = (key: string) =>
    fieldErrors[key] ? (
      <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>{fieldErrors[key]}</div>
    ) : null;

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

        {/* Role toggle */}
        <div className="gw-toggle" style={{ marginBottom: 18 }}>
          <button type="button" className={role === "jobseeker" ? "active" : ""} onClick={() => switchRole("jobseeker")}>
            Jobseeker
          </button>
          <button type="button" className={role === "employer" ? "active" : ""} onClick={() => switchRole("employer")}>
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
          {stepsForRole.map((s, i, arr) => {
            const current = i === step;
            const done = i < step;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12, flex: i < arr.length - 1 ? 1 : "0 0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: current || done ? "var(--ink)" : "var(--surface)",
                      border: current || done ? "none" : "1px solid var(--ink-6)",
                      color: current || done ? "#fff" : "var(--ink-4)",
                      display: "grid",
                      placeItems: "center",
                      font: "500 11px/1 var(--font-mono)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span style={{ font: "500 12.5px/1 var(--font-ui)", color: current || done ? "var(--ink)" : "var(--ink-4)" }}>
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: done ? "var(--ink-4)" : "var(--ink-7)" }} />}
              </div>
            );
          })}
        </div>

        {/* Done screen (shared) */}
        {step === 3 ? (
          <div className="gw-card" style={{ padding: 32, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: "var(--emerald-bg)",
                color: "var(--emerald)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <h2 className="tx-serif" style={{ fontSize: 24, fontWeight: 400 }}>
              {role === "jobseeker"
                ? `You’re all set, ${firstName || "welcome"}!`
                : `${companyName || "Your company"} is ready to hire.`}
            </h2>
            <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-3)" }}>
              {role === "jobseeker"
                ? "Your jobseeker account is ready. Sign in to start applying — you can complete the rest of your NSRP profile (education, work history, and more) anytime from your profile page."
                : "Your employer account is ready. Sign in to post your first job — you can add company details, photos, and more from your profile page."}
            </p>
            <Link
              href={`/login?role=${role}&registered=1`}
              className="gw-btn gw-btn--lg gw-btn--accent gw-btn--block"
              style={{ marginTop: 20, textDecoration: "none" }}
            >
              Sign in to your account <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
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

              {/* STEP 0: Account (both roles) */}
              {step === 0 && (
                <>
                  {role === "jobseeker" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="gw-label">First name</label>
                        <input
                          className="gw-input"
                          value={firstName}
                          onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                          placeholder="Juan Miguel"
                          autoComplete="given-name"
                        />
                        {fieldError("firstName")}
                      </div>
                      <div>
                        <label className="gw-label">Last name</label>
                        <input
                          className="gw-input"
                          value={lastName}
                          onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                          placeholder="Cruz"
                          autoComplete="family-name"
                        />
                        {fieldError("lastName")}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="gw-label">Company name</label>
                      <input
                        className="gw-input"
                        value={companyName}
                        onChange={(e) => { setCompanyName(e.target.value); clearFieldError("companyName"); }}
                        placeholder="Your Company Inc."
                        autoComplete="organization"
                      />
                      {fieldError("companyName")}
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Email address</label>
                    <input
                      type="email"
                      className="gw-input"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                      placeholder={role === "jobseeker" ? "you@example.com" : "company@example.com"}
                      autoComplete="email"
                    />
                    {fieldErrors.email ? fieldError("email") : (
                      <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                        We&apos;ll send a verification code here.
                      </div>
                    )}
                  </div>

                  {role === "jobseeker" && (
                    <div style={{ marginTop: 14 }}>
                      <label className="gw-label">Mobile number</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div className="gw-input" style={{ width: 80, display: "flex", alignItems: "center", gap: 6, cursor: "default" }}>
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

                  {role === "jobseeker" && (
                    <div style={{ marginTop: 14 }}>
                      <label className="gw-label">Facebook profile link</label>
                      <input
                        type="url"
                        name="facebookProfileUrl"
                        id="facebookProfileUrl"
                        className="gw-input"
                        value={facebookLink}
                        onChange={(e) => { setFacebookLink(e.target.value); clearFieldError("facebookLink"); }}
                        placeholder="https://facebook.com/your.profile"
                        inputMode="url"
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore=""
                        data-form-type="other"
                      />
                      {fieldErrors.facebookLink ? fieldError("facebookLink") : (
                        <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                          Helps employers and TaraCurong confirm you&apos;re a real person.
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Password</label>
                    <input
                      type="password"
                      className="gw-input"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
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
                                ? strengthScore >= 3 ? "var(--emerald)" : strengthScore === 2 ? "var(--amber)" : "var(--rose)"
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
                    {fieldError("password")}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Confirm password</label>
                    <input
                      type="password"
                      className="gw-input"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />
                    {(fieldErrors.confirmPassword || liveConfirmPasswordError) && (
                      <div className="tx-micro" style={{ marginTop: 6, color: "var(--rose)" }}>
                        {fieldErrors.confirmPassword || liveConfirmPasswordError}
                      </div>
                    )}
                  </div>

                  <label style={{ marginTop: 18, padding: 14, background: "var(--paper)", borderRadius: "var(--r-2)", display: "flex", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => { setAgreedToTerms(e.target.checked); clearFieldError("terms"); }}
                      style={{ marginTop: 2 }}
                    />
                    <span className="tx-caption" style={{ fontSize: 12.5 }}>
                      I agree to the <Link href="/terms" style={{ color: "var(--teal)" }}>terms of use</Link> and the{" "}
                      <Link href="/privacy" style={{ color: "var(--teal)" }}>data privacy notice</Link> under R.A. 10173.
                      TaraCurong will only use my data for employment matching.
                    </span>
                  </label>
                  {fieldError("terms")}
                </>
              )}

              {/* STEP 1: Personal (jobseeker) */}
              {role === "jobseeker" && step === 1 && (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div className="tx-h4" style={{ fontSize: 15 }}>Personal details</div>
                    <div className="tx-micro" style={{ color: "var(--ink-4)", marginTop: 4 }}>
                      Part of your NSRP record. You can edit all of this later.
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Birth date</label>
                    <input
                      type="date"
                      className="gw-input"
                      value={birthDate}
                      onChange={(e) => { setBirthDate(e.target.value); clearFieldError("birthDate"); }}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                    {fieldError("birthDate")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ marginTop: 14 }}>
                    <div>
                      <label className="gw-label">Gender</label>
                      <select className="gw-input" value={gender} onChange={(e) => { setGender(e.target.value); clearFieldError("gender"); }}>
                        <option value="">Select…</option>
                        {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      {fieldError("gender")}
                    </div>
                    <div>
                      <label className="gw-label">Civil status</label>
                      <select className="gw-input" value={civilStatus} onChange={(e) => { setCivilStatus(e.target.value); clearFieldError("civilStatus"); }}>
                        <option value="">Select…</option>
                        {CIVIL_STATUSES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {fieldError("civilStatus")}
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Barangay</label>
                    <input className="gw-input" value={barangay} onChange={(e) => { setBarangay(e.target.value); clearFieldError("barangay"); }} placeholder="e.g. Poblacion" />
                    {fieldError("barangay")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ marginTop: 14 }}>
                    <div>
                      <label className="gw-label">City / Municipality</label>
                      <input className="gw-input" value={seekerCity} onChange={(e) => { setSeekerCity(e.target.value); clearFieldError("seekerCity"); }} />
                      {fieldError("seekerCity")}
                    </div>
                    <div>
                      <label className="gw-label">Province</label>
                      <input className="gw-input" value={seekerProvince} onChange={(e) => { setSeekerProvince(e.target.value); clearFieldError("seekerProvince"); }} />
                      {fieldError("seekerProvince")}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Skills (jobseeker) */}
              {role === "jobseeker" && step === 2 && (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div className="tx-h4" style={{ fontSize: 15 }}>Preferred work &amp; skills</div>
                    <div className="tx-micro" style={{ color: "var(--ink-4)", marginTop: 4 }}>
                      Helps us match you to the right jobs.
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Preferred job #1</label>
                    <input className="gw-input" value={occupation1} onChange={(e) => { setOccupation1(e.target.value); clearFieldError("occupation1"); }} placeholder="e.g. Cashier" />
                    {fieldError("occupation1")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ marginTop: 14 }}>
                    <div>
                      <label className="gw-label">Preferred job #2 <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                      <input className="gw-input" value={occupation2} onChange={(e) => setOccupation2(e.target.value)} placeholder="e.g. Sales clerk" />
                    </div>
                    <div>
                      <label className="gw-label">Preferred job #3 <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                      <input className="gw-input" value={occupation3} onChange={(e) => setOccupation3(e.target.value)} placeholder="e.g. Encoder" />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Skills <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                    <input className="gw-input" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. Microsoft Excel, Customer service, Driving" />
                    <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                      Separate skills with commas.
                    </div>
                    {parsedSkills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {parsedSkills.map((s, i) => (
                          <span key={`${s}-${i}`} className="gw-pill" style={{ fontSize: 11.5 }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STEP 1: Establishment (employer) */}
              {role === "employer" && step === 1 && (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div className="tx-h4" style={{ fontSize: 15 }}>About your establishment</div>
                    <div className="tx-micro" style={{ color: "var(--ink-4)", marginTop: 4 }}>
                      How jobseekers will identify and reach you. You can refine this later in your profile.
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Contact person</label>
                    <input
                      className="gw-input"
                      value={contactPerson}
                      onChange={(e) => { setContactPerson(e.target.value); clearFieldError("contactPerson"); }}
                      placeholder="Full name of the hiring contact"
                      autoComplete="name"
                    />
                    {fieldError("contactPerson")}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ marginTop: 14 }}>
                    <div>
                      <label className="gw-label">Contact phone <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                      <input
                        className="gw-input"
                        value={contactPhone}
                        onChange={(e) => { setContactPhone(e.target.value); clearFieldError("contactPhone"); }}
                        placeholder="+63 928 401 8842"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                      {fieldError("contactPhone")}
                    </div>
                    <div>
                      <label className="gw-label">Industry <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                      <select className="gw-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                        <option value="">Select…</option>
                        {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">City / Municipality</label>
                    <input
                      className="gw-input"
                      value={employerCity}
                      onChange={(e) => { setEmployerCity(e.target.value); clearFieldError("employerCity"); }}
                    />
                    {fieldError("employerCity")}
                  </div>
                </>
              )}

              {/* STEP 2: Trust signals (employer) */}
              {role === "employer" && step === 2 && (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div className="tx-h4" style={{ fontSize: 15 }}>Trust signals</div>
                    <div className="tx-micro" style={{ color: "var(--ink-4)", marginTop: 4 }}>
                      All optional. Add what you have — they help jobseekers feel confident applying.
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">DTI Business Registration Certificate <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        border: "1px dashed var(--ink-6)",
                        borderRadius: "var(--r-2)",
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={16} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
                      <span className="tx-body" style={{ fontSize: 13, color: "var(--ink-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dtiFile ? dtiFile.name : "Upload PDF or image (max 10MB)"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          setDtiFile(e.target.files?.[0] ?? null);
                          clearFieldError("dtiFile");
                        }}
                      />
                    </label>
                    {fieldErrors.dtiFile ? fieldError("dtiFile") : (
                      <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                        DTI-registered businesses earn a verified badge. Small or informal businesses can skip this.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Company website <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                    <div style={{ position: "relative" }}>
                      <Globe size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
                      <input
                        type="url"
                        className="gw-input"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourcompany.com"
                        inputMode="url"
                        style={{ paddingLeft: 30 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="gw-label">Social links <span style={{ color: "var(--ink-4)" }}>(optional)</span></label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {socialLinks.map((link, i) => (
                        <div key={i} style={{ display: "flex", gap: 8 }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <Link2 size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
                            <input
                              type="url"
                              className="gw-input"
                              value={link}
                              onChange={(e) => setSocialLinks((prev) => prev.map((l, j) => (j === i ? e.target.value : l)))}
                              placeholder="https://facebook.com/yourpage"
                              style={{ paddingLeft: 30 }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setSocialLinks((prev) => prev.filter((_, j) => j !== i))}
                            className="gw-btn gw-btn--ghost"
                            aria-label="Remove link"
                            style={{ padding: "0 10px" }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {socialLinks.length < 10 && (
                        <button
                          type="button"
                          onClick={() => setSocialLinks((prev) => [...prev, ""])}
                          className="gw-btn gw-btn--ghost gw-btn--sm"
                          style={{ alignSelf: "flex-start" }}
                        >
                          <Plus size={12} /> Add social link
                        </button>
                      )}
                    </div>
                    <div className="tx-micro" style={{ marginTop: 6, color: "var(--ink-4)" }}>
                      Facebook page, LinkedIn, etc. — helps people find your company online.
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {step > 0 && (
                  <button type="button" onClick={goBack} className="gw-btn gw-btn--lg gw-btn--ghost" disabled={loading}>
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || livePasswordErrors.length > 0 || Boolean(liveConfirmPasswordError)}
                  className="gw-btn gw-btn--lg gw-btn--accent gw-btn--block"
                  style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Creating account…" : ctaLabel} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </form>
        )}

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
      style={{ minHeight: "100vh", background: "var(--paper)", display: "grid", placeItems: "center", color: "var(--ink-4)" }}
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
