"use client";

import Link from "next/link";
import {
  Building,
  Calendar,
  ChevronRight,
  Download,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  QrCode,
} from "lucide-react";
import { Pill } from "@/components/gw/atoms";

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

const ACTIVE_APPS: { title: string; company: string; at: string; status: AppStatus; days: string }[] = [
  { title: "Bookkeeper", company: "Dole Philippines, Inc.", at: "Tacurong", status: "interview", days: "Applied 12 days ago" },
  { title: "Cannery Line Lead", company: "General Tuna Corporation", at: "Tacurong", status: "shortlisted", days: "Applied 6 days ago" },
  { title: "Office Clerk", company: "City Treasurer's Office", at: "City Hall", status: "under_review", days: "Applied 4 days ago" },
];

const RECOMMENDED = [
  { t: "Account Assistant", c: "RD Pawnshop", m: 94 },
  { t: "Junior Accountant", c: "Sultan Kudarat CPA", m: 88 },
  { t: "Records Officer", c: "City Hall Tacurong", m: 81 },
];

const ACTIVITY: { t: string; s: string; w: string; c: string; icon: React.ReactNode }[] = [
  { t: "Interview confirmed with Dole Philippines, Inc.", s: "Friday 26 May · 10:00 AM · Tacurong cannery", w: "1h ago", c: "var(--amber)", icon: <Calendar size={13} /> },
  { t: "Status updated: Cannery Line Lead → Shortlisted", s: "General Tuna Corporation", w: "Yesterday", c: "var(--violet)", icon: <TrendingUp size={13} /> },
  { t: "Referral slip issued for Bookkeeper", s: "TaraCurong · valid until 06 Jun", w: "2 days ago", c: "var(--sky)", icon: <QrCode size={13} /> },
  { t: "Profile is 72% complete", s: "Add work experience to reach 90% and unlock priority matching.", w: "3 days ago", c: "var(--ink-3)", icon: <User size={13} /> },
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

export default function JobseekerDashboardPage() {
  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
          Welcome back, Juan
        </h1>
        <p className="tx-caption" style={{ marginTop: 4 }}>
          Tuesday, 23 May · 8 new matches since yesterday
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Stat label="Applications" value="8" delta="+2 this week" helper="3 active" />
        <Stat label="In review" value="4" delta="+1" helper="avg. 3.2 days" />
        <Stat label="Interviews" value="2" delta="next: Fri" helper="Dole HR · 10:00" />
        <Stat label="Referral slips" value="2" delta="1 valid" helper="1 hired" />
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="tx-h3">Active applications</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>Track where you stand in the hiring pipeline.</div>
            </div>
            <Link href="/jobseeker/applications" className="tx-body" style={{ color: "var(--teal)", fontSize: 13, textDecoration: "none" }}>
              View all (8)
            </Link>
          </div>
          {ACTIVE_APPS.map((a, i) => (
            <div
              key={a.title}
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
          ))}
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
            <div style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
              <div className="gw-qr sm" style={{ width: 80, height: 80, flexShrink: 0 }}>
                <span className="br" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-h4" style={{ color: "#fff" }}>Bookkeeper</div>
                <div className="tx-caption" style={{ color: "var(--ink-5)", marginTop: 2 }}>Dole Philippines, Inc.</div>
                <div className="tx-mono" style={{ fontSize: 10, color: "var(--seal-gold-2)", marginTop: 8, letterSpacing: "0.06em" }}>
                  TC-2026-014872
                </div>
                <div className="tx-micro" style={{ color: "var(--ink-5)", marginTop: 4 }}>
                  Valid until 06 Jun · 09:00 PHT
                </div>
              </div>
            </div>
            <div style={{ padding: "0 18px 18px", display: "flex", gap: 8 }}>
              <Link href="/referral/TC-2026-014872" style={{ flex: 1 }}>
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
          </div>

          <div className="gw-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="tx-h3">Recommended for you</div>
                <div className="tx-caption" style={{ marginTop: 2 }}>Based on your skills</div>
              </div>
              <Sparkles size={14} style={{ color: "var(--teal)" }} />
            </div>
            {RECOMMENDED.map((r, i) => (
              <div
                key={r.t}
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
                <div
                  className="tx-mono"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "var(--teal-4)",
                    color: "var(--teal)",
                    fontSize: 11.5,
                    letterSpacing: "0.04em",
                  }}
                >
                  {r.m}%
                </div>
                <ChevronRight size={14} style={{ color: "var(--ink-4)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gw-card" style={{ padding: 22, marginTop: 20 }}>
        <div className="tx-h3" style={{ marginBottom: 18 }}>Activity</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ACTIVITY.map((a, i) => (
            <div
              key={a.t}
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
          ))}
        </div>
      </div>
    </div>
  );
}
