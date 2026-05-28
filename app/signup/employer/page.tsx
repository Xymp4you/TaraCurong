"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, FileText, Globe, Link2, Lock, Mail, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { validatePasswordRules } from "@/lib/password-rules";
import { handleApiError, getFieldErrors } from "@/lib/error-utils";

export default function EmployerSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dtiFile, setDtiFile] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const livePasswordErrors = formData.password.length
    ? validatePasswordRules(formData.password).errors
    : [];
  const liveConfirmPasswordError =
    formData.confirmPassword.length && formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : "";

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.companyName.trim()) nextErrors.companyName = "Company name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = "Enter a valid email";

    if (!formData.password) nextErrors.password = "Password is required";
    else {
      const validation = validatePasswordRules(formData.password);
      if (!validation.isValid) nextErrors.password = validation.errors[0] || "Invalid password";
    }

    if (!formData.confirmPassword) nextErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    if (dtiFile && !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(dtiFile.type))
      nextErrors.dtiFile = "Upload a PDF or image (PNG/JPG)";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("establishmentName", formData.companyName.trim());
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      if (dtiFile) fd.append("dtiRegistrationFile", dtiFile);
      if (website.trim()) fd.append("website", website.trim());
      const cleanedSocials = socialLinks.map((s) => s.trim()).filter(Boolean);
      if (cleanedSocials.length) fd.append("socialLinks", JSON.stringify(cleanedSocials));

      // Multipart — let the browser set the boundary; do not set Content-Type.
      const response = await fetch("/api/auth/signup/employer", {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        const handled = await handleApiError(response);
        setError(handled.message);
        if (handled.code === "VALIDATION_ERROR") {
          setFieldErrors(getFieldErrors(handled.details));
        }
        return;
      }

      router.push("/login?role=employer&registered=1");
    } catch (err: any) {
      setError("Unable to create account. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join as an employer and start hiring."
      roleLabel="Employer Portal"
      roleId="employer"
      primaryPortalBaseHref="/signup"
      sideTitle="Hire with clarity"
      sideBullets={[
        "Verified employer onboarding",
        "Structured applicant workflows",
        "Government-aligned hiring support",
      ]}
      footer={
        <p className="text-sm text-slate-600">
          Already have an account? <Link href="/login?role=employer" className="font-semibold text-sky-700 hover:text-sky-800">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-300 focus:ring-2"
                value={formData.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Your Company Inc."
                aria-invalid={!!fieldErrors.companyName}
                autoComplete="organization"
              />
            </div>
            {fieldErrors.companyName ? <p className="mt-1 text-xs text-red-600">{fieldErrors.companyName}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-300 focus:ring-2"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="company@example.com"
                aria-invalid={!!fieldErrors.email}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none ring-sky-300 focus:ring-2"
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!fieldErrors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {livePasswordErrors.length ? (
              <div className="mt-1 space-y-1">
                {livePasswordErrors.map((msg) => (
                  <p key={msg} className="text-xs text-red-600">{msg}</p>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Use 8+ chars with upper/lowercase, number, and symbol.</p>
            )}
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none ring-sky-300 focus:ring-2"
                value={formData.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!fieldErrors.confirmPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!fieldErrors.confirmPassword && liveConfirmPasswordError ? <p className="mt-1 text-xs text-red-600">{liveConfirmPasswordError}</p> : null}
            {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            DTI Business Registration Certificate <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 cursor-pointer hover:border-slate-400 transition-colors">
            <FileText className="h-5 w-5 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600 truncate">
              {dtiFile ? dtiFile.name : "Upload PDF or image (max 10MB)"}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                setDtiFile(e.target.files?.[0] ?? null);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.dtiFile;
                  return next;
                });
              }}
            />
          </label>
          {fieldErrors.dtiFile ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.dtiFile}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Optional — upload it if your business is DTI-registered to earn a verified badge. Small or unregistered businesses can skip this.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Company website <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-300 focus:ring-2"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Social links <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-300 focus:ring-2"
                    value={link}
                    onChange={(e) => setSocialLinks((prev) => prev.map((l, j) => (j === i ? e.target.value : l)))}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSocialLinks((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-lg border border-slate-300 px-3 text-slate-400 hover:text-slate-700"
                  aria-label="Remove link"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {socialLinks.length < 10 ? (
              <button
                type="button"
                onClick={() => setSocialLinks((prev) => [...prev, ""])}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800"
              >
                <Plus className="h-4 w-4" /> Add social link
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">Facebook page, LinkedIn, etc. — helps people find your company online.</p>
        </div>

        <Button
          type="submit"
          disabled={loading || livePasswordErrors.length > 0 || Boolean(liveConfirmPasswordError)}
          className="w-full"
          size="lg"
        >
          {loading ? "Creating account..." : "Create employer account"}
        </Button>
      </form>
    </AuthShell>
  );
}
