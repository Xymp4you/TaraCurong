"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bookmark, Briefcase, Clock, Globe, Link2, MapPin, Sparkles } from "lucide-react";

type EmployerReviews = {
  average: number;
  count: number;
  reviews: Array<{ id: string; rating: number; comment: string | null; reviewer: string }>;
};
import { toast } from "sonner";
import { ScamWarning } from "@/components/transparency/scam-warning";
import { ReportButton } from "@/components/transparency/report-button";
import type { JobDetailResponse } from "@/lib/job-detail";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NEXT_STEPS = [
  ["Application sent to employer", "Instant"],
  ["Initial screening", "Usually within 3 days"],
  ["Shortlist or feedback", "Within 1–2 weeks"],
  ["Referral slip with QR", "If shortlisted"],
] as const;

function formatPosted(iso: string | null): string {
  if (!iso) return "Recently posted";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  if (days < 60) return "Posted last month";
  return `Posted ${Math.floor(days / 30)} months ago`;
}

export default function JobseekerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = params?.id ? decodeURIComponent(params.id) : "";
  const isValidId = UUID_RE.test(rawId);

  const jobQuery = useQuery<JobDetailResponse>({
    queryKey: ["job", rawId],
    enabled: isValidId,
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${rawId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load job");
      }
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/jobs/${rawId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to submit application");
      return body;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      queryClient.invalidateQueries({ queryKey: ["job", rawId] });
      router.push("/jobseeker/applications");
    },
    onError: (err: Error) => {
      const msg = err.message;
      if (msg.includes("Unauthorized")) {
        toast.error("Please sign in to apply.");
        router.push(`/login?role=jobseeker&next=${encodeURIComponent(`/jobseeker/jobs/${rawId}`)}`);
        return;
      }
      toast.error(msg);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (currentlySaved: boolean) => {
      const url = currentlySaved
        ? `/api/jobseeker/saved-jobs?jobId=${rawId}`
        : `/api/jobseeker/saved-jobs`;
      const res = await fetch(url, {
        method: currentlySaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: currentlySaved ? undefined : JSON.stringify({ jobId: rawId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update saved jobs");
      }
      return !currentlySaved;
    },
    onSuccess: (nowSaved) => {
      toast.success(nowSaved ? "Saved for later." : "Removed from saved.");
      queryClient.invalidateQueries({ queryKey: ["job", rawId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const employerId = jobQuery.data?.employerId ?? null;
  const reviewsQuery = useQuery<EmployerReviews>({
    queryKey: ["employer-reviews", employerId],
    enabled: Boolean(employerId),
    queryFn: async () => {
      const res = await fetch(`/api/employers/${employerId}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
  });

  // Demo / invalid URL — show a friendly placeholder rather than a broken page.
  if (!isValidId) {
    return (
      <div className="gw" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="gw-card" style={{ padding: 28 }}>
          <div className="tx-eyebrow" style={{ color: "var(--amber)" }}>Demo URL</div>
          <h1 className="tx-serif" style={{ marginTop: 10, fontSize: 26, fontWeight: 400, lineHeight: 1.1 }}>
            This isn&apos;t a real job listing.
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Job detail pages load from a job ID. Browse openings to view a real listing you can apply to.
          </p>
          <button
            type="button"
            className="gw-btn gw-btn--accent"
            style={{ marginTop: 18 }}
            onClick={() => router.push("/jobseeker/jobs")}
          >
            Browse jobs
          </button>
        </div>
      </div>
    );
  }

  if (jobQuery.isLoading) {
    return (
      <div className="gw" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="gw-card" style={{ padding: 28 }}>
          <div className="tx-caption">Loading job…</div>
        </div>
      </div>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="gw" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="gw-card" style={{ padding: 28 }}>
          <div className="tx-eyebrow" style={{ color: "var(--rose)" }}>Unavailable</div>
          <h1 className="tx-serif" style={{ marginTop: 10, fontSize: 24, fontWeight: 400 }}>
            We couldn&apos;t load this job.
          </h1>
          <p className="tx-body" style={{ marginTop: 10, color: "var(--ink-3)" }}>
            {(jobQuery.error as Error | undefined)?.message ?? "It may have been removed or is no longer open."}
          </p>
          <button
            type="button"
            className="gw-btn gw-btn--accent"
            style={{ marginTop: 18 }}
            onClick={() => router.push("/jobseeker/jobs")}
          >
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  const job = jobQuery.data;
  const isClosed = job.jobStatus !== "Open" || (job.slotsRemaining !== null && job.slotsRemaining <= 0);
  const submitDisabled =
    applyMutation.isPending || jobQuery.isFetching || isClosed || Boolean(job.hasApplied);

  const submitLabel = applyMutation.isPending
    ? "Submitting…"
    : job.hasApplied
    ? "Already applied"
    : isClosed
    ? "No longer accepting applications"
    : "Submit application";

  const facts: ReadonlyArray<readonly [string, string]> = [
    ["Experience", job.yearsOfExperienceRequired ? `${job.yearsOfExperienceRequired} yrs` : "Not specified"],
    ["Education", job.minimumEducationRequired ?? "Not specified"],
    ["Slots", job.slotsRemaining !== null ? `${job.slotsRemaining} open` : `${job.vacancies ?? "—"} open`],
    ["Status", job.jobStatus ?? "—"],
  ];

  const skills: string[] = job.mainSkillOrSpecialization
    ? job.mainSkillOrSpecialization.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="gw grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
      style={{ maxWidth: 1100 }}
    >
      <div>
        <div className="gw-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--r-3)",
                background: "var(--paper-2)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Briefcase size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="tx-caption"
                style={{ marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
              >
                <span>{job.employerName ?? "Employer"}</span>
                <span>·</span>
                <span
                  style={{ color: "var(--emerald)", cursor: "help", borderBottom: "1px dotted var(--emerald)" }}
                  title="Verified means the maintainer manually reviewed the employer's submitted documents. It is not a government background check — exercise your own judgment before accepting offers or sharing sensitive documents."
                >
                  ● Verified employer
                </span>
                {job.dtiRegistered ? (
                  <>
                    <span>·</span>
                    <span style={{ color: "var(--emerald)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <BadgeCheck size={12} /> DTI-registered
                    </span>
                  </>
                ) : null}
              </div>
              <div
                className="tx-serif"
                style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.028em" }}
              >
                {job.positionTitle}
              </div>
              <div
                style={{ display: "flex", gap: 18, marginTop: 12, color: "var(--ink-3)", flexWrap: "wrap" }}
              >
                {job.location && (
                  <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} />
                    {job.location}
                  </span>
                )}
                {job.employmentType && (
                  <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Briefcase size={13} />
                    {job.employmentType}
                  </span>
                )}
                {job.startingSalary && (
                  <span
                    className="tx-caption tx-mono"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}
                  >
                    {job.startingSalary}
                  </span>
                )}
                <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Clock size={13} />
                  {formatPosted(job.publishedAt)}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0" }} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {facts.map(([k, v]) => (
              <div key={k}>
                <div
                  className="tx-micro"
                  style={{ color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {k}
                </div>
                <div className="tx-h4" style={{ marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="gw-card" style={{ padding: 28, marginTop: 16 }}>
            <div className="tx-h3" style={{ marginBottom: 12 }}>Required skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {skills.map((s) => (
                <span key={s} className="gw-chip" style={{ height: 26 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* About the employer — trust signals + reviews */}
        <div className="gw-card" style={{ padding: 28, marginTop: 16 }}>
          <div className="tx-h3" style={{ marginBottom: 12 }}>About the employer</div>

          {job.dtiRegistered ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--emerald-bg)",
                color: "var(--emerald)",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <BadgeCheck size={14} /> DTI-registered business
            </div>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {reviewsQuery.data && reviewsQuery.data.count > 0 ? (
              <>
                <span style={{ color: "var(--amber)", fontSize: 15, letterSpacing: 1 }}>
                  {"★".repeat(Math.round(reviewsQuery.data.average))}
                  {"☆".repeat(5 - Math.round(reviewsQuery.data.average))}
                </span>
                <span className="tx-body" style={{ fontWeight: 600 }}>{reviewsQuery.data.average.toFixed(1)}</span>
                <span className="tx-caption">
                  ({reviewsQuery.data.count} {reviewsQuery.data.count === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="tx-caption" style={{ color: "var(--ink-4)" }}>No reviews yet</span>
            )}
          </div>

          {job.website || (job.socialLinks && job.socialLinks.length > 0) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {job.website ? (
                <a
                  href={job.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-caption"
                  style={{ color: "var(--teal)", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", wordBreak: "break-all" }}
                >
                  <Globe size={13} /> {job.website}
                </a>
              ) : null}
              {(job.socialLinks ?? []).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-caption"
                  style={{ color: "var(--teal)", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", wordBreak: "break-all" }}
                >
                  <Link2 size={13} /> {url}
                </a>
              ))}
            </div>
          ) : null}

          {reviewsQuery.data && reviewsQuery.data.reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 4 }}>
              {reviewsQuery.data.reviews.slice(0, 5).map((r) => (
                <div key={r.id} style={{ borderTop: "1px solid var(--ink-7)", padding: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span className="tx-h4" style={{ fontSize: 13 }}>{r.reviewer}</span>
                    <span style={{ color: "var(--amber)", fontSize: 12 }}>
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment ? <p className="tx-caption" style={{ marginTop: 4 }}>{r.comment}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          <p className="tx-micro" style={{ color: "var(--ink-4)", marginTop: 12, lineHeight: 1.5 }}>
            These signals help you judge an employer — they aren&apos;t guarantees. Use your own judgment before sharing personal info.
          </p>
        </div>
      </div>

      <aside>
        <div className="gw-card" style={{ padding: 20, position: "sticky", top: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="tx-eyebrow">Your application</div>
            <button
              type="button"
              onClick={() => saveMutation.mutate(Boolean(job.isSaved))}
              disabled={saveMutation.isPending}
              aria-label={job.isSaved ? "Remove from saved" : "Save for later"}
              style={{
                background: "transparent",
                border: 0,
                padding: 0,
                cursor: saveMutation.isPending ? "wait" : "pointer",
                color: job.isSaved ? "var(--teal)" : "var(--ink-4)",
              }}
            >
              <Bookmark size={14} fill={job.isSaved ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="tx-h3">
            {job.hasApplied ? "You've applied" : isClosed ? "Closed" : "Ready to apply?"}
          </div>
          <div className="tx-caption" style={{ marginTop: 4 }}>
            {job.hasApplied
              ? `Status: ${job.applicationStatus ?? "under review"}`
              : isClosed
              ? "This listing is no longer accepting applications."
              : `${job.applicationsCount ?? 0} ${job.applicationsCount === 1 ? "person has" : "people have"} applied so far.`}
          </div>

          {!job.hasApplied && !isClosed && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "var(--teal-4)",
                borderRadius: "var(--r-2)",
                display: "flex",
                gap: 10,
              }}
            >
              <Sparkles size={14} style={{ color: "var(--teal)", marginTop: 1, flexShrink: 0 }} />
              <div className="tx-caption" style={{ color: "var(--teal)", fontSize: 12.5 }}>
                Match scores are software estimates, not decisions — the employer reviews every applicant.
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <ScamWarning context="application" />
          </div>

          <div className="tx-micro" style={{ marginTop: 10, color: "var(--ink-4)", lineHeight: 1.5 }}>
            By applying, you agree your contact details, profile, and any attached documents become
            visible to <strong>{job.employerName ?? "this employer"}</strong>. Only the employer you
            apply to and the project maintainer can see your application. See{" "}
            <a href="/privacy" style={{ color: "var(--teal)" }}>Privacy Policy</a> and{" "}
            <a href="/terms" style={{ color: "var(--teal)" }}>Terms of Use</a>.
          </div>

          <button
            type="button"
            className="gw-btn gw-btn--lg gw-btn--accent gw-btn--block"
            style={{ marginTop: 16, opacity: submitDisabled ? 0.6 : 1, cursor: submitDisabled ? "not-allowed" : "pointer" }}
            onClick={() => applyMutation.mutate()}
            disabled={submitDisabled}
          >
            {submitLabel}
          </button>
          {!job.hasApplied && (
            <button
              type="button"
              className="gw-btn gw-btn--ghost gw-btn--block"
              style={{ marginTop: 8 }}
              onClick={() => saveMutation.mutate(Boolean(job.isSaved))}
              disabled={saveMutation.isPending}
            >
              {job.isSaved ? "Saved" : "Save for later"}
            </button>
          )}

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "16px 0" }} />

          <div className="tx-h4" style={{ fontSize: 13, marginBottom: 8 }}>What happens next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NEXT_STEPS.map(([t, w], i) => (
              <div key={t} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    border: "1.5px solid var(--ink-6)",
                    color: "var(--ink-4)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    font: "500 10px/1 var(--font-mono)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="tx-body" style={{ fontSize: 13 }}>{t}</div>
                  <div className="tx-micro" style={{ color: "var(--ink-4)" }}>{w}</div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "16px 0" }} />
          <ReportButton target="job" identifier={rawId} />
        </div>
      </aside>
    </div>
  );
}
