"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

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

const FUNNEL = [
  { l: "Applied", n: 142, w: 100 },
  { l: "Reviewed", n: 87, w: 61 },
  { l: "Shortlisted", n: 34, w: 24 },
  { l: "Interview", n: 12, w: 8.5 },
  { l: "Hired", n: 5, w: 3.5 },
];

const TOP_MATCHES = [
  { n: "Juan M. Cruz", b: "5y · bookkeeping · QuickBooks", m: 94, ini: "JC" },
  { n: "Andrea L. Sanchez", b: "3y · payroll · Tacurong", m: 91, ini: "AS" },
  { n: "Mark T. Reyes", b: "4y · BIR filing · CPA board", m: 89, ini: "MR" },
  { n: "Cristina P. Dela Cruz", b: "6y · finance team lead", m: 85, ini: "CD" },
];

const ACTIVE_JOBS: { t: string; n: number; h: number; p: string; s: JobStatus }[] = [
  { t: "Bookkeeper", n: 47, h: 1, p: "Posted 2d ago", s: "active" },
  { t: "Forklift Operator (×3)", n: 28, h: 2, p: "Posted 1w ago", s: "active" },
  { t: "QA Supervisor", n: 18, h: 0, p: "Closing 30 May", s: "active" },
];

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
  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            Hello, Dole Philippines
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>5 active jobs · 12 new applicants overnight</p>
        </div>
        <Link href="/employer/jobs/new">
          <button type="button" className="gw-btn gw-btn--primary">
            <Plus size={14} /> Post a job
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Active jobs" value="5" delta="+1 this month" helper="2 pending" />
        <Stat label="New applicants" value="12" delta="+12 today" helper="last 24h" />
        <Stat label="Shortlisted" value="34" delta="+6 this week" />
        <Stat label="Hires (May)" value="5" delta="+2 vs Apr" />
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
            {FUNNEL.map((s) => (
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
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Time to hire</div>
              <div className="tx-h3 tx-mono" style={{ marginTop: 4 }}>9.2 days</div>
            </div>
            <div style={{ width: 1, background: "var(--ink-7)", alignSelf: "stretch" }} />
            <div>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Offer accept rate</div>
              <div className="tx-h3 tx-mono" style={{ marginTop: 4 }}>83%</div>
            </div>
            <div style={{ width: 1, background: "var(--ink-7)", alignSelf: "stretch" }} />
            <div>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>Top source</div>
              <div className="tx-h3" style={{ marginTop: 4 }}>TaraCurong referrals</div>
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
          {TOP_MATCHES.map((p, i) => (
            <div
              key={p.n}
              style={{
                padding: "12px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: i === 0 ? "var(--violet-bg)" : "var(--paper-2)",
                  color: i === 0 ? "var(--violet)" : "var(--ink-2)",
                  display: "grid",
                  placeItems: "center",
                  font: "600 11px/1 var(--font-ui)",
                  border: "1px solid var(--ink-7)",
                }}
              >
                {p.ini}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tx-h4" style={{ fontSize: 13.5 }}>{p.n}</div>
                <div className="tx-micro" style={{ marginTop: 2 }}>{p.b}</div>
              </div>
              <div
                className="tx-mono"
                style={{
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "var(--violet-bg)",
                  color: "var(--violet)",
                  fontSize: 11.5,
                }}
              >
                {p.m}%
              </div>
            </div>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACTIVE_JOBS.map((j) => (
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
                  <div className="tx-h3 tx-mono" style={{ marginTop: 2 }}>{j.n}</div>
                </div>
                <div>
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>Hired</div>
                  <div className="tx-h3 tx-mono" style={{ marginTop: 2, color: "var(--emerald)" }}>{j.h}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
