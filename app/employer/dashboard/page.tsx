"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";
import { createClient } from "@/lib/supabase-client";

type EmployerSummary = {
  jobsCount: number;
  activeJobsCount: number;
  applicationsCount: number;
  pendingApplicationsCount: number;
  hiredCount: number;
  rejectedCount: number;
};

type JobStatus = "draft" | "pending" | "active" | "closed" | "archived" | "rejected" | "suspended";
const JOB_STATUS: Record<JobStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "slate", label: "Draft" },
  pending: { tone: "amber", label: "Pending review" },
  active: { tone: "emerald", label: "Active" },
  closed: { tone: "slate", label: "Closed" },
  archived: { tone: "outline", label: "Archived" },
  rejected: { tone: "rose", label: "Rejected" },
  suspended: { tone: "rose", label: "Suspended" },
};

// ---------------------------------------------------------------------------
// API types + adapters (data source only — no UI shape changes)
// ---------------------------------------------------------------------------

type ApiEnvelope<T> = { success: boolean; data: T };

// Application statuses that map onto the hiring funnel stages.
const FUNNEL_STAGES: { status: string; label: string }[] = [
  { status: "pending", label: "Applied" },
  { status: "reviewed", label: "Reviewed" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "interview", label: "Interview" },
  { status: "hired", label: "Hired" },
];

type FunnelRow = { l: string; n: number; w: number };

async function fetchFunnel(): Promise<FunnelRow[]> {
  // The applications endpoint has no dedicated funnel route, so we derive
  // stage counts by reading pagination.total for each status filter.
  const counts = await Promise.all(
    FUNNEL_STAGES.map(async (stage) => {
      const res = await fetch(
        `/api/employer/applications?status=${stage.status}&limit=1&offset=0`
      );
      if (!res.ok) throw new Error("Failed to fetch applications funnel");
      const json: ApiEnvelope<{ pagination: { total: number } }> = await res.json();
      return json.data?.pagination?.total ?? 0;
    })
  );

  const top = counts[0] ?? 0;
  return FUNNEL_STAGES.map((stage, i) => {
    const n = counts[i] ?? 0;
    return {
      l: stage.label,
      n,
      // Width is relative to the top-of-funnel count; falls back to 0 when empty.
      w: top > 0 ? (n / top) * 100 : 0,
    };
  });
}

type ApiJob = {
  positionTitle?: string;
  position_title?: string;
  status?: string;
  job_status?: string;
  createdAt?: string | null;
  created_at?: string | null;
};

type ActiveJobRow = { t: string; p: string; s: JobStatus };

function postedLabel(createdAt?: string | null): string {
  if (!createdAt) return "Recently posted";
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "Recently posted";
  const days = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1d ago";
  if (days < 7) return `Posted ${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "Posted 1w ago" : `Posted ${weeks}w ago`;
}

function toJobStatus(value?: string): JobStatus {
  return value && value in JOB_STATUS ? (value as JobStatus) : "active";
}

async function fetchActiveJobs(): Promise<ActiveJobRow[]> {
  const res = await fetch("/api/employer/jobs?status=active&limit=100&offset=0");
  if (!res.ok) throw new Error("Failed to fetch jobs");
  const json: ApiEnvelope<{ jobs: ApiJob[] }> = await res.json();
  return (json.data?.jobs ?? []).map((job) => ({
    t: job.positionTitle ?? job.position_title ?? "Untitled role",
    p: postedLabel(job.createdAt ?? job.created_at),
    s: toJobStatus(job.status ?? job.job_status),
  }));
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

export default function EmployerDashboardPage() {
  const { data: funnel, isLoading: funnelLoading } = useQuery<FunnelRow[]>({
    queryKey: ["employer", "dashboard", "funnel"],
    queryFn: fetchFunnel,
    staleTime: 1000 * 60,
  });

  const { data: activeJobs, isLoading: jobsLoading } = useQuery<ActiveJobRow[]>({
    queryKey: ["employer", "dashboard", "active-jobs"],
    queryFn: fetchActiveJobs,
    staleTime: 1000 * 60,
  });

  const { data: summaryEnv } = useQuery<ApiEnvelope<EmployerSummary>>({
    queryKey: ["employer", "dashboard", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/employer/dashboard");
      if (!res.ok) throw new Error("Failed to fetch employer summary");
      return res.json();
    },
    staleTime: 1000 * 60,
  });
  const summary = summaryEnv?.data;
  const kpi = (n?: number) => (typeof n === "number" ? new Intl.NumberFormat("en-US").format(n) : "—");
  const acceptedTotal = (summary?.hiredCount ?? 0) + (summary?.rejectedCount ?? 0);
  const acceptRate = acceptedTotal > 0 ? `${Math.round(((summary?.hiredCount ?? 0) / acceptedTotal) * 100)}%` : "—";

  // Employer name from the auth session (set after mount to avoid hydration mismatch).
  const [employerName, setEmployerName] = useState("");
  useEffect(() => {
    createClient().auth.getClaims().then(({ data }) => {
      const m = (data?.claims?.user_metadata ?? {}) as Record<string, string | undefined>;
      setEmployerName(m.establishment_name || m.full_name || m.name || "");
    });
  }, []);

  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            {employerName ? `Hello, ${employerName}` : "Hello"}
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>
            {kpi(summary?.activeJobsCount)} active jobs · {kpi(summary?.pendingApplicationsCount)} awaiting review
          </p>
        </div>
        <Link href="/employer/jobs/new">
          <button type="button" className="gw-btn gw-btn--primary">
            <Plus size={14} /> Post a job
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Active jobs" value={kpi(summary?.activeJobsCount)} helper={`${kpi(summary?.jobsCount)} total`} />
        <Stat label="New applicants" value={kpi(summary?.pendingApplicationsCount)} helper="awaiting review" />
        <Stat label="Applications" value={kpi(summary?.applicationsCount)} helper="all time" />
        <Stat label="Hires" value={kpi(summary?.hiredCount)} helper="confirmed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 mt-5">
        {/* Funnel */}
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="tx-h3">Hiring funnel</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>Across all 5 active job posts · This month</div>
            </div>
            <div className="gw-toggle">
              <button type="button">Week</button>
              <button type="button" className="active">Month</button>
              <button type="button">Quarter</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelLoading && (
              <div className="tx-caption" style={{ color: "var(--ink-4)" }}>Loading funnel…</div>
            )}
            {!funnelLoading && (funnel ?? []).every((s) => s.n === 0) && (
              <div className="tx-caption" style={{ color: "var(--ink-4)" }}>No applications yet.</div>
            )}
            {(funnel ?? []).map((s) => (
              <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 90 }}>
                  <div className="tx-h4" style={{ fontSize: 13 }}>{s.l}</div>
                  <div className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>{s.w.toFixed(1)}%</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 26,
                    background: "var(--paper)",
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.w}%`,
                      background: "var(--role-employer)",
                      transition: "width 600ms ease",
                    }}
                  />
                  <span
                    className="tx-mono"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 11.5,
                      color: "var(--ink-3)",
                    }}
                  >
                    {s.n}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0 16px" }} />
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Hired</div>
              <div className="tx-h3 tx-mono" style={{ marginTop: 4 }}>{kpi(summary?.hiredCount)}</div>
            </div>
            <div style={{ width: 1, background: "var(--ink-7)", alignSelf: "stretch" }} />
            <div>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Offer accept rate</div>
              <div className="tx-h3 tx-mono" style={{ marginTop: 4 }}>{acceptRate}</div>
            </div>
            <div style={{ width: 1, background: "var(--ink-7)", alignSelf: "stretch" }} />
            <div>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Rejected</div>
              <div className="tx-h3 tx-mono" style={{ marginTop: 4 }}>{kpi(summary?.rejectedCount)}</div>
            </div>
          </div>
        </div>

        {/* Top matches */}
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="tx-h3">AI top matches</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>
                For Bookkeeper · Tacurong ·{" "}
                <span
                  style={{ borderBottom: "1px dotted var(--ink-4)", cursor: "help" }}
                  title="Scores are software estimates (LLM + skill/location overlap). Review profiles directly before deciding."
                >
                  what is this?
                </span>
              </div>
            </div>
            <Pill tone="violet" dot={false}>
              <Sparkles size={10} /> AI
            </Pill>
          </div>
          <div className="tx-caption" style={{ padding: "12px 0", color: "var(--ink-4)" }}>
            Open a specific job in the matching console to see AI-ranked candidates.
          </div>
          <Link href="/employer/matching">
            <button type="button" className="gw-btn gw-btn--ghost gw-btn--block" style={{ marginTop: 14 }}>
              Open AI matching console
            </button>
          </Link>
        </div>
      </div>

      <div className="gw-card" style={{ padding: 22, marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="tx-h3">Active jobs</div>
          <Link
            href="/employer/jobs"
            className="tx-body"
            style={{ color: "var(--role-employer)", fontSize: 13, textDecoration: "none" }}
          >
            Manage all jobs
          </Link>
        </div>
        {jobsLoading && (
          <div className="tx-caption" style={{ color: "var(--ink-4)" }}>Loading jobs…</div>
        )}
        {!jobsLoading && (activeJobs ?? []).length === 0 && (
          <div className="tx-caption" style={{ color: "var(--ink-4)" }}>No active jobs yet.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(activeJobs ?? []).map((j) => (
            <div key={j.t} style={{ padding: 16, border: "1px solid var(--ink-7)", borderRadius: "var(--r-3)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div className="tx-h4">{j.t}</div>
                  <div className="tx-micro" style={{ marginTop: 4 }}>{j.p}</div>
                </div>
                <Pill tone={JOB_STATUS[j.s].tone}>{JOB_STATUS[j.s].label}</Pill>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>Applicants</div>
                  <div className="tx-h3 tx-mono" style={{ marginTop: 2 }}>—</div>
                </div>
                <div>
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>Hired</div>
                  <div className="tx-h3 tx-mono" style={{ marginTop: 2, color: "var(--emerald)" }}>—</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
