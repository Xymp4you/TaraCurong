"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building,
  Calendar,
  ChevronRight,
  Download,
  Shield,
  Sparkles,
  TrendingUp,
  QrCode,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Pill } from "@/components/gw/atoms";
import { createClient } from "@/lib/supabase-client";

type AppStatus = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected" | "withdrawn";

const APP_STATUS: Record<AppStatus, { tone: "slate" | "sky" | "violet" | "amber" | "emerald" | "rose"; label: string }> = {
  submitted: { tone: "slate", label: "Submitted" },
  under_review: { tone: "sky", label: "Under review" },
  shortlisted: { tone: "violet", label: "Shortlisted" },
  interview: { tone: "amber", label: "Interview" },
  hired: { tone: "emerald", label: "Hired" },
  rejected: { tone: "rose", label: "Rejected" },
  withdrawn: { tone: "slate", label: "Withdrawn" },
};

const PIPELINE_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "hired", label: "Hired" },
] as const;

function Pipeline({ current }: { current: AppStatus }) {
  const idx = PIPELINE_STEPS.findIndex((s) => s.key === current);
  return (
    <div className="gw-pipeline">
      {PIPELINE_STEPS.map((s, i) => {
        const cls = i < idx ? "done" : i === idx ? "current" : "";
        return (
          <div key={s.key} className={`step ${cls}`}>
            <div className="node">{i < idx ? "✓" : i + 1}</div>
            <div className="label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- API response shapes ----------
// GET /api/jobseeker/applications -> { applications: ApiApplication[] }
type ApiApplication = {
  id: string;
  status: string | null;
  source: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  interviewDate: string | null;
  jobId: string | null;
  positionTitle: string | null;
  location: string | null;
  employerName: string | null;
  qrCodeUrl: string | null;
  slipNumber: string | null;
};

// GET /api/jobseeker/recommendations -> { jobs: ApiRecommendation[] }
type ApiRecommendation = {
  id: string;
  positionTitle: string | null;
  employmentType: string | null;
  startingSalary: string | null;
  createdAt: string | null;
  employerName: string | null;
  city: string | null;
  province: string | null;
};

// GET /api/jobseeker/referrals -> { slips: ApiReferralSlip[] }
type ApiReferralSlip = {
  id: string;
  slipNumber: string | null;
  issuedAt: string | null;
  validUntil: string | null;
  status: string | null;
  qrCodeUrl: string | null;
  jobTitle: string | null;
  employerName: string | null;
  employerAddress: string | null;
};

// e.g. "06 Jun · 09:00 PHT"
function formatValidUntil(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-PH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ---------- adapter view models ----------
type ActiveApp = { title: string; company: string; at: string; status: AppStatus; days: string };
type Recommended = { t: string; c: string };
type ActivityItem = { t: string; s: string; w: string; c: string; icon: React.ReactNode };

// The DB stores free-form status text (default "pending"). Normalize it to an
// AppStatus the pipeline/Pill understand; fall back to "submitted" when unknown.
function normalizeStatus(raw: string | null): AppStatus {
  switch ((raw ?? "").toLowerCase()) {
    case "pending":
    case "submitted":
      return "submitted";
    case "under_review":
    case "reviewing":
      return "under_review";
    case "shortlisted":
      return "shortlisted";
    case "interview":
      return "interview";
    case "hired":
    case "accepted":
      return "hired";
    case "rejected":
      return "rejected";
    case "withdrawn":
      return "withdrawn";
    default:
      return "submitted";
  }
}

function relativeFrom(iso: string | null): string {
  if (!iso) return "Applied recently";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Applied recently";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Applied today";
  if (days === 1) return "Applied 1 day ago";
  return `Applied ${days} days ago`;
}

function relativeShort(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function toActiveApp(a: ApiApplication): ActiveApp {
  return {
    title: a.positionTitle ?? "Untitled role",
    company: a.employerName ?? "Employer",
    at: a.location ?? "—",
    status: normalizeStatus(a.status),
    days: relativeFrom(a.submittedAt),
  };
}

function toRecommended(j: ApiRecommendation): Recommended {
  return {
    t: j.positionTitle ?? "Untitled role",
    c: j.employerName ?? [j.city, j.province].filter(Boolean).join(", ") ?? "Employer",
  };
}

// No jobseeker activity endpoint exists; derive recent activity from applications.
function deriveActivity(apps: ApiApplication[]): ActivityItem[] {
  return apps.slice(0, 4).map((a) => {
    const company = a.employerName ?? "Employer";
    const position = a.positionTitle ?? "a role";
    if (a.interviewDate) {
      return {
        t: `Interview scheduled with ${company}`,
        s: `${position}${a.location ? ` · ${a.location}` : ""}`,
        w: relativeShort(a.interviewDate),
        c: "var(--amber)",
        icon: <Calendar size={13} />,
      };
    }
    if (a.slipNumber) {
      return {
        t: `Referral slip issued for ${position}`,
        s: `${company} · ${a.slipNumber}`,
        w: relativeShort(a.submittedAt),
        c: "var(--sky)",
        icon: <QrCode size={13} />,
      };
    }
    const status = normalizeStatus(a.status);
    return {
      t: `Status updated: ${position} → ${APP_STATUS[status].label}`,
      s: company,
      w: relativeShort(a.reviewedAt ?? a.submittedAt),
      c: "var(--violet)",
      icon: <TrendingUp size={13} />,
    };
  });
}

function Stat({ label, value, delta, helper, down }: { label: string; value: string; delta?: string; helper?: string; down?: boolean }) {
  return (
    <div className="gw-stat">
      <div className="label">{label}</div>
      <div className="value tx-num">{value}</div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`delta${down ? " down" : ""}`}>{delta}</span>
          {helper && <span className="tx-micro" style={{ color: "var(--ink-4)" }}>{helper}</span>}
        </div>
      )}
    </div>
  );
}

export default function JobseekerDashboardPage() {
  const { data: appsData, isLoading: appsLoading } = useQuery<{ applications: ApiApplication[] }>({
    queryKey: ["jobseeker", "applications"],
    queryFn: async () => {
      const res = await fetch("/api/jobseeker/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const { data: recsData, isLoading: recsLoading } = useQuery<{ jobs: ApiRecommendation[] }>({
    queryKey: ["jobseeker", "recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/jobseeker/recommendations");
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const { data: refsData } = useQuery<{ slips: ApiReferralSlip[] }>({
    queryKey: ["jobseeker", "referrals"],
    queryFn: async () => {
      const res = await fetch("/api/jobseeker/referrals");
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  // Greeting name + today's date are derived after mount (from the auth
  // session / Date) to avoid SSR/client hydration mismatches.
  const [firstName, setFirstName] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-PH", { weekday: "long", day: "numeric", month: "long" })
    );
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => {
      const claims = data?.claims as
        | { email?: string; user_metadata?: Record<string, string | undefined> }
        | undefined;
      const m = claims?.user_metadata ?? {};
      const name =
        m.first_name ||
        m.given_name ||
        (typeof m.full_name === "string" && m.full_name.split(" ")[0]) ||
        (typeof m.name === "string" && m.name.split(" ")[0]) ||
        claims?.email?.split("@")[0] ||
        "";
      setFirstName(name);
    });
  }, []);

  const applications = appsData?.applications ?? [];
  const activeApps = applications.map(toActiveApp);
  const recommended = (recsData?.jobs ?? []).map(toRecommended);
  const activity = deriveActivity(applications);
  const slips = refsData?.slips ?? [];

  // ---- Derived stat counts (all from real data; no fabricated deltas) ----
  const ACTIVE_STATUSES: AppStatus[] = ["submitted", "under_review", "shortlisted", "interview"];
  const statusOf = (a: ApiApplication) => normalizeStatus(a.status);
  const activeCount = applications.filter((a) => ACTIVE_STATUSES.includes(statusOf(a))).length;
  const inReviewCount = applications.filter((a) => statusOf(a) === "under_review").length;
  const interviewApps = applications.filter((a) => statusOf(a) === "interview");
  const weekAgo = Date.now() - 7 * 86_400_000;
  const newThisWeek = applications.filter(
    (a) => a.submittedAt && new Date(a.submittedAt).getTime() >= weekAgo
  ).length;
  const nextInterview = interviewApps
    .map((a) => a.interviewDate)
    .filter((d): d is string => !!d && new Date(d).getTime() >= Date.now())
    .sort()[0];
  const nextInterviewLabel = nextInterview
    ? `next: ${new Date(nextInterview).toLocaleDateString("en-PH", { weekday: "short" })}`
    : undefined;
  const validSlips = slips.filter(
    (s) => s.validUntil && new Date(s.validUntil).getTime() >= Date.now()
  ).length;

  // The slip to feature in the "Active referral" card: newest still-valid one,
  // else the newest overall (the API already orders by issued_at desc).
  const activeSlip = slips.find(
    (s) => s.validUntil && new Date(s.validUntil).getTime() >= Date.now()
  ) ?? slips[0];

  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="tx-caption" style={{ marginTop: 4 }}>
          {today}
          {recommended.length > 0 ? ` · ${recommended.length} recommended for you` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Applications"
          value={String(applications.length)}
          delta={newThisWeek > 0 ? `+${newThisWeek} this week` : undefined}
          helper={`${activeCount} active`}
        />
        <Stat label="In review" value={String(inReviewCount)} helper="in pipeline" />
        <Stat
          label="Interviews"
          value={String(interviewApps.length)}
          delta={nextInterviewLabel}
        />
        <Stat
          label="Referral slips"
          value={String(slips.length)}
          helper={`${validSlips} valid`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="tx-h3">Active applications</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>Track where you stand in the hiring pipeline.</div>
            </div>
            <Link href="/jobseeker/applications" className="tx-body" style={{ color: "var(--teal)", fontSize: 13, textDecoration: "none" }}>
              View all ({applications.length})
            </Link>
          </div>
          {appsLoading ? (
            <div className="tx-caption" style={{ padding: "16px 0", color: "var(--ink-4)" }}>Loading applications…</div>
          ) : activeApps.length === 0 ? (
            <div className="tx-caption" style={{ padding: "16px 0", color: "var(--ink-4)" }}>No applications yet</div>
          ) : (
            activeApps.map((a, i) => (
            <div
              key={i}
              style={{ padding: "16px 0", borderTop: i === 0 ? "none" : "1px solid var(--ink-7)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    background: "var(--paper-2)",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid var(--ink-7)",
                  }}
                >
                  <Building size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-h4">{a.title}</div>
                  <div className="tx-caption" style={{ marginTop: 2 }}>{a.company} · {a.at}</div>
                </div>
                <Pill tone={APP_STATUS[a.status].tone}>{APP_STATUS[a.status].label}</Pill>
                <span className="tx-micro" style={{ color: "var(--ink-4)", minWidth: 140, textAlign: "right" }}>{a.days}</span>
              </div>
              <Pipeline current={a.status} />
            </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            className="gw-card"
            style={{
              padding: 0,
              overflow: "hidden",
              background: "var(--official-ink)",
              color: "#fff",
              borderColor: "var(--official-ink)",
            }}
          >
            <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, border: "1px solid var(--seal-gold-2)", display: "grid", placeItems: "center" }}>
                <Shield size={13} color="var(--seal-gold-2)" />
              </div>
              <div>
                <div className="tx-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--seal-gold-2)", textTransform: "uppercase" }}>
                  Active referral
                </div>
                <div className="tx-h4" style={{ color: "#fff", fontSize: 14 }}>Ready to show at employer</div>
              </div>
            </div>
            {activeSlip ? (
              <>
                <div style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                  <div className="gw-qr sm" style={{ width: 80, height: 80, flexShrink: 0 }}>
                    <span className="br" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="tx-h4" style={{ color: "#fff" }}>{activeSlip.jobTitle ?? "Referral"}</div>
                    <div className="tx-caption" style={{ color: "var(--ink-5)", marginTop: 2 }}>{activeSlip.employerName ?? "Employer"}</div>
                    {activeSlip.slipNumber && (
                      <div className="tx-mono" style={{ fontSize: 10, color: "var(--seal-gold-2)", marginTop: 8, letterSpacing: "0.06em" }}>
                        {activeSlip.slipNumber}
                      </div>
                    )}
                    {activeSlip.validUntil && (
                      <div className="tx-micro" style={{ color: "var(--ink-5)", marginTop: 4 }}>
                        Valid until {formatValidUntil(activeSlip.validUntil)} PHT
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: "0 18px 18px", display: "flex", gap: 8 }}>
                  <Link href={`/referral/${activeSlip.slipNumber ?? ""}`} style={{ flex: 1 }}>
                    <button type="button" className="gw-btn gw-btn--sm" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", width: "100%" }}>
                      Show QR
                    </button>
                  </Link>
                  <button
                    type="button"
                    className="gw-btn gw-btn--sm"
                    style={{ background: "transparent", color: "var(--ink-5)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Download size={12} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 18 }}>
                <div className="tx-caption" style={{ color: "var(--ink-5)" }}>
                  No active referral slip yet. When TaraCurong refers you to an employer, your QR slip appears here.
                </div>
              </div>
            )}
          </div>

          <div className="gw-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="tx-h3">Recommended for you</div>
                <div className="tx-caption" style={{ marginTop: 2 }}>Based on your skills</div>
              </div>
              <Sparkles size={14} style={{ color: "var(--teal)" }} />
            </div>
            {recsLoading ? (
              <div className="tx-caption" style={{ padding: "12px 0", color: "var(--ink-4)" }}>Loading recommendations…</div>
            ) : recommended.length === 0 ? (
              <div className="tx-caption" style={{ padding: "12px 0", color: "var(--ink-4)" }}>No recommendations yet</div>
            ) : (
              recommended.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tx-h4">{r.t}</div>
                  <div className="tx-caption" style={{ marginTop: 2 }}>{r.c}</div>
                </div>
                {/* Match-score badge omitted: the recommendations API does not return a match %. */}
                <ChevronRight size={14} style={{ color: "var(--ink-4)" }} />
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="gw-card" style={{ padding: 22, marginTop: 20 }}>
        <div className="tx-h3" style={{ marginBottom: 18 }}>Activity</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {appsLoading ? (
            <div className="tx-caption" style={{ padding: "14px 0", color: "var(--ink-4)" }}>Loading activity…</div>
          ) : activity.length === 0 ? (
            <div className="tx-caption" style={{ padding: "14px 0", color: "var(--ink-4)" }}>No recent activity</div>
          ) : (
            activity.map((a, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--ink-7)" }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "var(--paper)",
                  color: a.c,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  border: "1px solid var(--ink-7)",
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-body" style={{ color: "var(--ink)", fontSize: 13.5 }}>{a.t}</div>
                <div className="tx-caption" style={{ marginTop: 3, fontSize: 12.5 }}>{a.s}</div>
              </div>
              <span className="tx-micro" style={{ color: "var(--ink-4)" }}>{a.w}</span>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
