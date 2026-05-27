"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building } from "lucide-react";
import { Pill } from "@/components/gw/atoms";

// ---- Activity trend (real data) ----
type TrendPoint = { month: string; applications: number; referrals: number; hires: number };
interface TimelineResponse {
  months: number;
  monthlyTrends: TrendPoint[];
}

// Build an SVG polyline `points` string for one numeric series, scaled into a
// 600x200 viewBox (20px top padding, baseline at 200) against a shared max.
function seriesPoints(values: number[], max: number): string {
  const n = values.length;
  if (n === 0) return "";
  const safeMax = max > 0 ? max : 1;
  const stepX = n > 1 ? 600 / (n - 1) : 0;
  return values
    .map((v, i) => {
      const x = n > 1 ? i * stepX : 300;
      const y = 200 - (v / safeMax) * 180;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const momDelta = (values: number[]): string => {
  if (values.length < 2) return "";
  const last = values[values.length - 1] ?? 0;
  const prev = values[values.length - 2] ?? 0;
  if (prev === 0) return last > 0 ? "+100% MoM" : "";
  const change = Math.round(((last - prev) / prev) * 100);
  return `${change >= 0 ? "+" : ""}${change}% MoM`;
};

type DonutDatum = { v: number; c: string };

function Donut({ data, size = 92, thickness = 14 }: { data: DonutDatum[]; size?: number; thickness?: number }) {
  const total = data.reduce((a, b) => a + b.v, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-7)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.v / total;
        const offset = c * (1 - acc);
        const dash = `${c * frac} ${c}`;
        acc += frac;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.c}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const pct = (count: number, total: number) =>
  total > 0 ? `${Math.round((count / total) * 100)}%` : "0%";

// ---- API response shapes (subset of fields actually returned) ----
interface OverviewResponse {
  kpis: {
    jobSeekers: { total: number };
    employers: { total: number; pending: number };
    jobs: { total: number; active: number; pending: number };
    applications: { total: number };
  };
  jobStatusCounts: { status: string; count: number }[];
}

interface SummaryResponse {
  usersCount: number;
  employersCount: number;
  jobsCount: number;
  applicationsCount: number;
  pendingEmployerCount: number;
  pendingAdminRequests: number;
  pendingJobs: number;
}

interface ReferralAnalyticsResponse {
  totalReferrals: number;
  referralsByStatus: { status: string; count: number }[];
}

interface HiringRateResponse {
  employers: {
    employerId: string;
    employerName: string;
    city: string;
    totalReferrals: number;
    hired: number;
    forInterview: number;
    hiringRate: number;
  }[];
  totalReferrals: number;
}

interface AuditFeedResponse {
  totalEvents: number;
  events: { timestamp: string; type: string; actor: string; detail: string }[];
}

// ---- JSX-shape types (unchanged from original constants) ----
type StatRow = { l: string; v: string; d: string; action?: boolean };
type DonutRow = { l: string; v: number; p: string; c: string };
type EmployerRow = { n: string; h: number; j: number };
type AuditRow = { t: string; w: string; a: string; c: string; time: string };

// ---- Adapters: map API responses -> existing JSX shapes ----
const NEUTRAL = "—";

// Job status: map active/pending/closed/archived from overview.jobStatusCounts
const JOB_STATUS_DEFS: { key: string; l: string; c: string }[] = [
  { key: "active", l: "Active", c: "var(--emerald)" },
  { key: "pending", l: "Pending", c: "var(--amber)" },
  { key: "closed", l: "Closed", c: "var(--slate)" },
  { key: "archived", l: "Archived", c: "var(--ink-4)" },
];

function adaptJobStatus(overview?: OverviewResponse): DonutRow[] {
  const counts = new Map<string, number>();
  (overview?.jobStatusCounts ?? []).forEach((s) => counts.set(s.status, s.count));
  const total = (overview?.jobStatusCounts ?? []).reduce((a, s) => a + s.count, 0);
  return JOB_STATUS_DEFS.map((d) => {
    const v = counts.get(d.key) ?? 0;
    return { l: d.l, v, p: pct(v, total), c: d.c };
  });
}

// Referral outcomes: statuses returned are Pending, For Interview, Hired, Rejected, Withdrawn
const REFERRAL_DEFS: { key: string; l: string; c: string }[] = [
  { key: "Hired", l: "Hired", c: "var(--emerald)" },
  { key: "For Interview", l: "For Interview", c: "var(--sky)" },
  { key: "Pending", l: "Pending", c: "var(--amber)" },
  { key: "Rejected", l: "Rejected", c: "var(--rose)" },
  { key: "Withdrawn", l: "Withdrawn", c: "var(--slate)" },
];

function adaptReferrals(analytics?: ReferralAnalyticsResponse): DonutRow[] {
  const counts = new Map<string, number>();
  (analytics?.referralsByStatus ?? []).forEach((s) => counts.set(s.status, s.count));
  const total = (analytics?.referralsByStatus ?? []).reduce((a, s) => a + s.count, 0);
  return REFERRAL_DEFS.map((d) => {
    const v = counts.get(d.key) ?? 0;
    return { l: d.l, v, p: pct(v, total), c: d.c };
  });
}

function adaptTopEmployers(hiring?: HiringRateResponse): EmployerRow[] {
  return (hiring?.employers ?? [])
    .slice()
    .sort((a, b) => b.hired - a.hired || b.totalReferrals - a.totalReferrals)
    .slice(0, 5)
    // NOTE: no endpoint exposes active-jobs-per-employer; `j` shown as 0 (neutral).
    .map((e) => ({ n: e.employerName, h: e.hired, j: 0 }));
}

const AUDIT_TONES: { match: (type: string) => boolean; c: string; t: string }[] = [
  { match: (t) => t.includes("created") || t.includes("requested"), c: "var(--amber)", t: "Admin access requested" },
  { match: (t) => t.includes("reviewed"), c: "var(--emerald)", t: "Admin request reviewed" },
  { match: (t) => t.includes("cancelled"), c: "var(--slate)", t: "Account deletion cancelled" },
  { match: (t) => t.includes("processed"), c: "var(--rose)", t: "Account deletion processed" },
  { match: (t) => t.includes("deletion"), c: "var(--sky)", t: "Account deletion requested" },
];

function adaptAuditEvents(feed?: AuditFeedResponse): AuditRow[] {
  return (feed?.events ?? []).slice(0, 5).map((e) => {
    const tone = AUDIT_TONES.find((tn) => tn.match(e.type));
    const d = new Date(e.timestamp);
    const time = Number.isNaN(d.getTime())
      ? NEUTRAL
      : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return {
      t: tone?.t ?? e.type,
      w: e.detail,
      a: e.actor || NEUTRAL,
      c: tone?.c ?? "var(--ink-4)",
      time,
    };
  });
}

export default function AdminDashboardPage() {
  const overviewQuery = useQuery<OverviewResponse>({
    queryKey: ["admin", "dashboard", "overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/overview");
      if (!res.ok) throw new Error("Failed to fetch dashboard overview");
      return res.json();
    },
  });

  const summaryQuery = useQuery<SummaryResponse>({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/summary");
      if (!res.ok) throw new Error("Failed to fetch admin summary");
      return res.json();
    },
  });

  const referralsQuery = useQuery<ReferralAnalyticsResponse>({
    queryKey: ["admin", "analytics", "referrals"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/referrals");
      if (!res.ok) throw new Error("Failed to fetch referral analytics");
      return res.json();
    },
  });

  const hiringQuery = useQuery<HiringRateResponse>({
    queryKey: ["admin", "analytics", "employer-hiring-rate"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/employer-hiring-rate");
      if (!res.ok) throw new Error("Failed to fetch employer hiring rate");
      return res.json();
    },
  });

  const auditQuery = useQuery<AuditFeedResponse>({
    queryKey: ["admin", "analytics", "audit-feed"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/audit-feed?limit=5");
      if (!res.ok) throw new Error("Failed to fetch audit feed");
      return res.json();
    },
  });

  // Activity-trend range toggle (months) + real timeline data.
  const [rangeMonths, setRangeMonths] = useState(12);
  const timelineQuery = useQuery<TimelineResponse>({
    queryKey: ["admin", "analytics", "timeline", rangeMonths],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/timeline?months=${rangeMonths}`);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      return res.json();
    },
  });

  // Today's date/time — set after mount to avoid SSR hydration mismatch.
  const [nowLabel, setNowLabel] = useState("");
  useEffect(() => {
    setNowLabel(
      new Date().toLocaleString("en-PH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }) + " PHT"
    );
  }, []);

  const overview = overviewQuery.data;
  const summary = summaryQuery.data;

  const kpiNum = (n?: number) => (typeof n === "number" ? formatNumber(n) : NEUTRAL);

  // STATS cards. Subtitle deltas ("+184 this week" etc.) have NO source endpoint,
  // so they are replaced with neutral, non-fabricated labels.
  const STATS: StatRow[] = [
    { l: "Jobseekers", v: kpiNum(overview?.kpis.jobSeekers.total), d: "Total registered" },
    { l: "Employers", v: kpiNum(overview?.kpis.employers.total), d: "Total registered" },
    { l: "Active jobs", v: kpiNum(overview?.kpis.jobs.active), d: "Currently active" },
    { l: "Applications", v: kpiNum(overview?.kpis.applications.total), d: "Total received" },
    {
      l: "Pending employers",
      v: kpiNum(overview?.kpis.employers.pending),
      d: "Needs review",
      action: true,
    },
    {
      l: "Pending jobs",
      v: kpiNum(overview?.kpis.jobs.pending),
      d: "In moderation",
      action: true,
    },
    {
      l: "Admin requests",
      v: kpiNum(summary?.pendingAdminRequests),
      d: "Officer access",
      action: true,
    },
  ];

  const JOB_STATUS_DATA = adaptJobStatus(overview);
  const REFERRAL_DATA = adaptReferrals(referralsQuery.data);
  const TOP_EMPLOYERS = adaptTopEmployers(hiringQuery.data);
  const AUDIT_EVENTS = adaptAuditEvents(auditQuery.data);

  const jobsTotal = overview?.kpis.jobs.total ?? 0;
  const referralsTotal = referralsQuery.data?.totalReferrals ?? 0;

  // ---- Activity trend derived values ----
  const trends = timelineQuery.data?.monthlyTrends ?? [];
  const appsSeries = trends.map((t) => t.applications);
  const refsSeries = trends.map((t) => t.referrals);
  const hiresSeries = trends.map((t) => t.hires);
  const trendMax = Math.max(1, ...appsSeries, ...refsSeries, ...hiresSeries);
  const trendMonths = trends.map((t) => t.month);
  const trendHasActivity = trendMax > 1 || appsSeries.some((v) => v > 0) || refsSeries.some((v) => v > 0);
  const TREND_LEGEND = [
    { c: "var(--teal)", l: "Applications", v: formatNumber(appsSeries.reduce((a, b) => a + b, 0)), d: momDelta(appsSeries) },
    { c: "var(--violet)", l: "Referrals issued", v: formatNumber(refsSeries.reduce((a, b) => a + b, 0)), d: momDelta(refsSeries), dash: true },
    { c: "var(--ink-2)", l: "Hires confirmed", v: formatNumber(hiresSeries.reduce((a, b) => a + b, 0)), d: momDelta(hiresSeries) },
  ];
  const RANGE_OPTIONS: { label: string; months: number }[] = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "12M", months: 12 },
    { label: "All", months: 24 },
  ];

  return (
    <div className="gw" style={{ maxWidth: 1380 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            TaraCurong operations · Tacurong City
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>{nowLabel}</p>
        </div>
        <Pill tone="emerald">All systems normal</Pill>
      </div>

      {/* 7 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="gw-stat"
            style={{
              borderColor: s.action ? "var(--amber)" : "var(--ink-7)",
              background: s.action ? "var(--amber-bg)" : "var(--surface)",
            }}
          >
            <div className="label">{s.l}</div>
            <div className="value tx-num" style={{ fontSize: 26 }}>{s.v}</div>
            <div
              className="tx-micro"
              style={{
                color: s.action ? "var(--amber)" : "var(--ink-3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {s.action && <ArrowRight size={10} />}
              {s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Trend + donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-[18px]">
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div className="tx-h3">Activity trend</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>
                Applications, hires, referrals · Last 12 months
              </div>
            </div>
            <div className="gw-toggle">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={rangeMonths === opt.months ? "active" : ""}
                  onClick={() => setRangeMonths(opt.months)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 200, position: "relative", padding: "0 8px" }}>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="600"
                  y1={y}
                  y2={y}
                  stroke="var(--ink-7)"
                  strokeWidth="1"
                  strokeDasharray={y === 200 ? "0" : "3 4"}
                />
              ))}
              {trendHasActivity && (
                <>
                  <polyline points={seriesPoints(appsSeries, trendMax)} fill="none" stroke="var(--teal)" strokeWidth="2" />
                  <polyline points={seriesPoints(refsSeries, trendMax)} fill="none" stroke="var(--violet)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <polyline points={seriesPoints(hiresSeries, trendMax)} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" />
                </>
              )}
            </svg>
            {timelineQuery.isLoading ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <span className="tx-caption" style={{ color: "var(--ink-4)" }}>Loading…</span>
              </div>
            ) : !trendHasActivity ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <span className="tx-caption" style={{ color: "var(--ink-4)" }}>No activity in this period yet</span>
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: "var(--ink-4)" }}>
            {trendMonths.map((m, i) => (
              <span key={`${m}-${i}`} className="tx-micro tx-mono">{m}</span>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0 16px" }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {TREND_LEGEND.map((s) => (
              <div key={s.l} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    display: "block",
                    width: 12,
                    height: 2,
                    marginTop: 8,
                    background: s.dash
                      ? `repeating-linear-gradient(90deg, ${s.c} 0 3px, transparent 3px 6px)`
                      : s.c,
                  }}
                />
                <div>
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>{s.l}</div>
                  <div className="tx-mono" style={{ fontSize: 16, color: "var(--ink)", marginTop: 2, letterSpacing: "-0.01em" }}>
                    {s.v}
                  </div>
                  <div className="tx-micro" style={{ color: "var(--emerald)" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="gw-card" style={{ padding: 20 }}>
            <div className="tx-h3">Job status</div>
            <div className="tx-caption" style={{ marginTop: 2, marginBottom: 12 }}>{formatNumber(jobsTotal)} jobs total</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut data={JOB_STATUS_DATA.map((d) => ({ v: parseInt(d.p), c: d.c }))} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {JOB_STATUS_DATA.map((s) => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
                    <span className="tx-body" style={{ fontSize: 12.5, flex: 1 }}>{s.l}</span>
                    <span className="tx-mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.v}</span>
                    <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 32, textAlign: "right" }}>{s.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gw-card" style={{ padding: 20 }}>
            <div className="tx-h3">Referral outcomes</div>
            <div className="tx-caption" style={{ marginTop: 2, marginBottom: 12 }}>{formatNumber(referralsTotal)} slips issued</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut data={REFERRAL_DATA.map((d) => ({ v: parseInt(d.p), c: d.c }))} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {REFERRAL_DATA.map((s) => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
                    <span className="tx-body" style={{ fontSize: 12.5, flex: 1 }}>{s.l}</span>
                    <span className="tx-mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.v}</span>
                    <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 32, textAlign: "right" }}>{s.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top employers + audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-[18px]">
        <div className="gw-card" style={{ padding: 22 }}>
          <div className="tx-h3" style={{ marginBottom: 14 }}>Top hiring employers</div>
          {hiringQuery.isLoading && (
            <div className="tx-caption" style={{ padding: "10px 0", color: "var(--ink-4)" }}>Loading…</div>
          )}
          {!hiringQuery.isLoading && TOP_EMPLOYERS.length === 0 && (
            <div className="tx-caption" style={{ padding: "10px 0", color: "var(--ink-4)" }}>No employer hiring activity yet.</div>
          )}
          {TOP_EMPLOYERS.map((e, i) => (
            <div
              key={e.n}
              style={{
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="tx-mono" style={{ width: 22, color: "var(--ink-4)", fontSize: 11 }}>#{i + 1}</span>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--paper-2)",
                  border: "1px solid var(--ink-7)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Building size={11} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-h4" style={{ fontSize: 13 }}>{e.n}</div>
                <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)" }}>{e.j} active jobs</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tx-mono" style={{ fontSize: 14, color: "var(--emerald)" }}>{e.h}</div>
                <div className="tx-micro" style={{ color: "var(--ink-4)" }}>hires</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="tx-h3">Recent audit events</div>
            <Link
              href="/admin/audit-logs"
              className="tx-micro"
              style={{ color: "var(--role-admin)", textDecoration: "none" }}
            >
              Full log →
            </Link>
          </div>
          {auditQuery.isLoading && (
            <div className="tx-caption" style={{ padding: "10px 0", color: "var(--ink-4)" }}>Loading…</div>
          )}
          {!auditQuery.isLoading && AUDIT_EVENTS.length === 0 && (
            <div className="tx-caption" style={{ padding: "10px 0", color: "var(--ink-4)" }}>No recent audit events.</div>
          )}
          {AUDIT_EVENTS.map((e, i) => (
            <div
              key={`${e.t}-${i}`}
              style={{
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                display: "flex",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: e.c,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div className="tx-body" style={{ fontSize: 13 }}>{e.t}</div>
                <div className="tx-caption" style={{ marginTop: 2, fontSize: 12 }}>{e.w}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>{e.time}</div>
                <div className="tx-micro" style={{ color: "var(--ink-4)" }}>{e.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
