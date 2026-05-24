"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, FileText, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/image-utils";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

const ID_TYPES = [
  "PhilID (National ID)",
  "UMID",
  "Driver's License",
  "Passport",
  "Postal ID",
  "Voter's ID",
  "PhilHealth ID",
  "SSS ID",
  "TIN ID",
  "PRC ID",
  "Student ID (with photo)",
] as const;

function DocumentCard({
  id,
  label,
  hint,
  currentUrl,
  uploading,
  onUpload,
}: {
  id: string;
  label: string;
  hint: string;
  currentUrl?: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-slate-400 transition-colors">
      {currentUrl ? (
        <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
      ) : (
        <FileText className="h-6 w-6 text-slate-400 mx-auto" />
      )}
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">{hint}</p>
      {currentUrl ? (
        <div className="flex flex-col gap-2">
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline">
            View uploaded file
          </a>
          <label className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
            Change file
            <input type="file" className="hidden" accept=".pdf,image/*" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      ) : (
        <label
          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-slate-200 bg-white shadow-sm hover:bg-slate-100 h-8 px-3 ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
          {uploading ? "Uploading..." : "Upload PDF / Image"}
          <input type="file" className="hidden" accept=".pdf,image/*" onChange={onUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export default function JobseekerVerifyIdentityPage() {
  const [status, setStatus] = useState<VerificationStatus>("unverified");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullLegalName: "",
    dateOfBirth: "",
    idType: "",
    idFileUrl: "",
    selfieFileUrl: "",
    consentToProcess: false,
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Best-effort: hydrate from a verification status endpoint if it exists.
    // The page works even if the endpoint isn't wired yet.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/jobseeker/identity-verification", { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setStatus(data.status ?? "unverified");
          if (data.profile) {
            setForm((prev) => ({
              ...prev,
              fullLegalName: data.profile.fullLegalName ?? "",
              dateOfBirth: data.profile.dateOfBirth ?? "",
              idType: data.profile.idType ?? "",
              idFileUrl: data.profile.idFileUrl ?? "",
              selfieFileUrl: data.profile.selfieFileUrl ?? "",
            }));
          }
        }
      } catch {
        // Endpoint not deployed yet — render the form anyway.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ageOk = (() => {
    if (!form.dateOfBirth) return null;
    const dob = new Date(form.dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    return age >= 18;
  })();

  const handleUpload = (slot: "idFileUrl" | "selfieFileUrl") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setUploading((prev) => ({ ...prev, [slot]: true }));
    // Compress before upload — keeps ID + selfie uploads well under Supabase 1 GB free-tier storage.
    const file = raw.type.startsWith("image/") ? await compressImage(raw) : raw;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("documentType", slot);
    try {
      const res = await fetch("/api/upload/employer-document", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, [slot]: data.url }));
      } else {
        setError(data.error ?? "Upload failed.");
      }
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [slot]: false }));
    }
  };

  const canSubmit =
    form.fullLegalName.trim().length > 1 &&
    form.dateOfBirth &&
    ageOk &&
    form.idType &&
    form.idFileUrl &&
    form.selfieFileUrl &&
    form.consentToProcess;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobseeker/identity-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("pending");
        setSuccess("Submitted for review. You'll get a notification once reviewed (usually 1–3 working days).");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Submission failed.");
      }
    } catch {
      setError("Submission failed. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Identity verification</h1>
        <p className="mt-1 text-sm text-slate-600">
          Optional. Submitting valid ID earns you a <strong>Verified jobseeker</strong> badge that employers
          can see, increasing your chances of getting interviewed. You can apply to jobs without this.
        </p>
      </div>

      {/* Status banner */}
      {status === "pending" && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Review in progress</p>
              <p className="text-xs text-slate-700">
                Your submission is queued. The project maintainer reviews submissions within 1–3 working days.
              </p>
            </div>
          </div>
        </Card>
      )}
      {status === "verified" && (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold text-slate-900">You&apos;re a verified jobseeker</p>
              <p className="text-xs text-slate-700">
                Employers will see a ✓ badge on your applications. If your ID expires or changes, re-submit.
              </p>
            </div>
          </div>
        </Card>
      )}
      {status === "rejected" && (
        <Card className="border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Submission rejected</p>
          <p className="mt-1 text-xs text-slate-700">
            Common reasons: blurry photo, ID expired, name doesn&apos;t match profile, selfie doesn&apos;t match ID.
            You can re-submit below.
          </p>
        </Card>
      )}

      {/* Privacy preface */}
      <Card className="border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-800 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1">How your documents are handled</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stored privately. Only the project maintainer can view them.</li>
              <li>Used only to confirm your identity, never shared with employers.</li>
              <li>Auto-deleted 30 days after you close your account, or 12 months after rejection.</li>
              <li>This is not a government background check. We only confirm the documents look genuine.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullLegalName">Full legal name *</Label>
              <Input
                id="fullLegalName"
                value={form.fullLegalName}
                onChange={(e) => setForm((p) => ({ ...p, fullLegalName: e.target.value }))}
                placeholder="As shown on your ID"
                disabled={status === "pending"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                disabled={status === "pending"}
              />
              {form.dateOfBirth && ageOk === false && (
                <p className="text-xs text-rose-600">
                  You must be 18 or older to verify. Under-18 jobseekers can still browse and apply, but cannot
                  receive a verified badge.
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="idType">Government ID type *</Label>
              <select
                id="idType"
                value={form.idType}
                onChange={(e) => setForm((p) => ({ ...p, idType: e.target.value }))}
                disabled={status === "pending"}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
              >
                <option value="">Select an ID…</option>
                {ID_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DocumentCard
              id="idFileUrl"
              label="Government ID (front)"
              hint="Clear photo, all corners visible, no glare"
              currentUrl={form.idFileUrl}
              uploading={!!uploading.idFileUrl}
              onUpload={handleUpload("idFileUrl")}
            />
            <DocumentCard
              id="selfieFileUrl"
              label="Selfie with ID"
              hint="Hold the ID next to your face — both must be readable"
              currentUrl={form.selfieFileUrl}
              uploading={!!uploading.selfieFileUrl}
              onUpload={handleUpload("selfieFileUrl")}
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consentToProcess}
                onChange={(e) => setForm((p) => ({ ...p, consentToProcess: e.target.checked }))}
                disabled={status === "pending"}
                className="mt-1 h-4 w-4 rounded accent-slate-900"
              />
              <span className="text-sm text-slate-800 leading-relaxed">
                I confirm the documents I&apos;m uploading are mine and that I consent to TaraCurong using them
                only to verify my identity, in line with the{" "}
                <Link href="/privacy" className="text-teal-700 hover:underline">Privacy Policy</Link>.
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-2">
            <Link
              href="/jobseeker/settings"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to settings
            </Link>
            <Button type="submit" disabled={!canSubmit || submitting || status === "pending"}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {status === "pending" ? "Already submitted" : "Submit for review"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
