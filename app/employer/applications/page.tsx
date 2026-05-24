"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Sparkles, Shield as ShieldIcon, X } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type AppStatus = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected" | "withdrawn";
const APP_STATUS: Record<AppStatus, { tone: PillTone; label: string }> = {
  submitted: { tone: "slate", label: "Submitted" },
  under_review: { tone: "sky", label: "Under review" },
  shortlisted: { tone: "violet", label: "Shortlisted" },
  interview: { tone: "amber", label: "Interview" },
  hired: { tone: "emerald", label: "Hired" },
  rejected: { tone: "rose", label: "Rejected" },
  withdrawn: { tone: "slate", label: "Withdrawn" },
};

type Row = { ini: string; n: string; w: string; m: number; d: string; s: AppStatus; selected?: boolean };

const ROWS: Row[] = [
  { ini: "JC", n: "Juan M. Cruz", w: "5y · Tacurong", m: 94, d: "12 May", s: "interview", selected: true },
  { ini: "AS", n: "Andrea L. Sanchez", w: "3y · Koronadal", m: 91, d: "10 May", s: "shortlisted" },
  { ini: "MR", n: "Mark T. Reyes", w: "4y · Tacurong", m: 89, d: "08 May", s: "shortlisted" },
  { ini: "CD", n: "Cristina P. Dela Cruz", w: "6y · Tacurong", m: 85, d: "07 May", s: "under_review" },
  { ini: "RG", n: "Rene G. Galicia", w: "2y · Sarangani", m: 82, d: "06 May", s: "under_review" },
  { ini: "LM", n: "Lourdes M. Mendoza", w: "4y · Tacurong", m: 78, d: "05 May", s: "under_review" },
  { ini: "PC", n: "Patrick C. Yu", w: "1y · Tacurong", m: 71, d: "03 May", s: "submitted" },
  { ini: "VB", n: "Victoria B. Lee", w: "8y · Davao", m: 68, d: "01 May", s: "rejected" },
];

const FILTERS = [
  { l: "All", n: 47, active: true },
  { l: "New", n: 12 },
  { l: "Under review", n: 18 },
  { l: "Shortlisted", n: 11 },
  { l: "Interview", n: 3 },
  { l: "Hired", n: 1 },
];

export default function EmployerApplicationsPage() {
  const [activeRow, setActiveRow] = useState(0);
  const sel = ROWS[activeRow];

  return (
    <div className="gw" style={{ display: "flex", gap: 0, height: "calc(100vh - 56px)", maxWidth: "100%", marginInline: "-24px" }}>
      {/* Table area */}
      <div style={{ flex: 1, padding: "20px 24px 24px", overflow: "auto" }}>
        <div style={{ marginBottom: 14 }}>
          <h1 className="tx-h1" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.025em" }}>
            Bookkeeper · 47 applicants
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>
            Tacurong · Full-time · Posted 2 days ago
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <button type="button" className="gw-btn gw-btn--ghost">
            <Sparkles size={13} /> Run AI matching
          </button>
          <button type="button" className="gw-btn gw-btn--primary">
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Applicant data usage reminder */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 14px",
            background: "var(--sky-50, #F0F9FF)",
            border: "1px solid var(--sky-200, #BAE6FD)",
            borderRadius: 10,
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "var(--ink-2)",
            marginBottom: 14,
          }}
        >
          <ShieldIcon size={14} style={{ color: "var(--sky-700, #0369A1)", marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong>Applicant data handling.</strong> Contact details and uploaded documents are
            visible only because these jobseekers applied to this specific role. Don&apos;t reuse them
            for other postings, share them externally, or contact applicants outside this role.
            Misuse may result in your account being removed.{" "}
            <a href="/terms" style={{ color: "var(--sky-700, #0369A1)", textDecoration: "underline" }}>
              See Terms
            </a>
            .
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <span key={f.l} className={`gw-chip${f.active ? " active" : ""}`}>
              {f.l} <span className="tx-mono" style={{ marginLeft: 4 }}>{f.n}</span>
            </span>
          ))}
          <span style={{ flex: 1 }} />
          <span className="tx-micro" style={{ color: "var(--ink-3)" }}>Sort:</span>
          <span className="gw-chip">Match score <ChevronDown size={12} /></span>
        </div>

        {/* Table */}
        <div className="gw-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--ink-7)" }}>
                {["Applicant", "Experience", "Match", "Applied", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      font: "500 11.5px/1 var(--font-ui)",
                      color: "var(--ink-3)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const isActive = i === activeRow;
                return (
                  <tr
                    key={r.n}
                    onClick={() => setActiveRow(i)}
                    style={{
                      borderBottom: i < ROWS.length - 1 ? "1px solid var(--ink-7)" : "none",
                      background: isActive ? "var(--teal-4)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: isActive ? "var(--teal)" : "var(--paper-2)",
                            color: isActive ? "#fff" : "var(--ink-2)",
                            display: "grid",
                            placeItems: "center",
                            font: "600 11px/1 var(--font-ui)",
                            border: "1px solid var(--ink-7)",
                          }}
                        >
                          {r.ini}
                        </div>
                        <div>
                          <div className="tx-h4" style={{ fontSize: 13.5 }}>{r.n}</div>
                          <div className="tx-micro">NSRP-2026-000{(182 + i).toString().padStart(3, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-2)" }}>{r.w}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            background: "var(--ink-7)",
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${r.m}%`,
                              background:
                                r.m >= 85
                                  ? "var(--violet)"
                                  : r.m >= 75
                                  ? "var(--teal)"
                                  : "var(--ink-4)",
                            }}
                          />
                        </div>
                        <span
                          className="tx-mono"
                          style={{
                            fontSize: 12,
                            color: r.m >= 85 ? "var(--violet)" : "var(--ink-2)",
                          }}
                        >
                          {r.m}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-3)", fontSize: 12.5 }}>{r.d}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Pill tone={APP_STATUS[r.s].tone}>{APP_STATUS[r.s].label}</Pill>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <ChevronRight size={14} style={{ color: "var(--ink-4)" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, alignItems: "center" }}>
          <span className="tx-micro" style={{ color: "var(--ink-3)" }}>Showing 8 of 47 applicants</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost"><ChevronLeft size={12} /></button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--primary">1</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">2</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">3</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">…</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">6</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>

      {/* Side drawer */}
      <aside
        style={{
          width: 420,
          borderLeft: "1px solid var(--ink-7)",
          background: "var(--surface)",
          overflow: "auto",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "20px 22px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="gw-btn gw-btn--quiet gw-btn--sm" style={{ padding: "0 6px" }}>
            <X size={14} />
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="gw-btn gw-btn--quiet gw-btn--sm"
            onClick={() => setActiveRow((i) => Math.max(0, i - 1))}
          >
            Prev
          </button>
          <span className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>
            {activeRow + 1} / {ROWS.length}
          </span>
          <button
            type="button"
            className="gw-btn gw-btn--quiet gw-btn--sm"
            onClick={() => setActiveRow((i) => Math.min(ROWS.length - 1, i + 1))}
          >
            Next
          </button>
        </div>

        <div style={{ padding: "16px 22px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {sel.ini}
            </div>
            <div style={{ flex: 1 }}>
              <div className="tx-h2">{sel.n}</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>29 yrs · Male · Tacurong</div>
              <div className="tx-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                NSRP-2026-000{(182 + activeRow).toString().padStart(3, "0")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Pill tone={APP_STATUS[sel.s].tone}>{APP_STATUS[sel.s].label}</Pill>
            <Pill tone="violet" dot={false}>
              <Sparkles size={9} /> {sel.m}% match
            </Pill>
            <Pill tone="teal" dot={false}>
              <ShieldIcon size={9} /> NSRP-verified
            </Pill>
          </div>
        </div>

        {/* AI rationale */}
        <div style={{ padding: "0 22px 22px" }}>
          <div
            style={{
              padding: 14,
              background: "var(--violet-bg)",
              borderRadius: "var(--r-3)",
              border: "1px solid var(--violet-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Sparkles size={13} color="var(--violet)" />
              <span
                className="tx-mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--violet)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Why this matches
              </span>
            </div>
            <p className="tx-body" style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
              {sel.n.split(" ")[0]} has {sel.w}, hands-on QuickBooks and Excel, and lives within 25 km of the
              Tacurong cannery. The payroll and BIR-filing background lines up cleanly with this role&apos;s
              reconciliation requirements.
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { l: "Skills overlap", v: "9/10" },
                { l: "Experience", v: "5y / 3y req" },
                { l: "Location", v: "12 km" },
              ].map((c) => (
                <span
                  key={c.l}
                  style={{
                    padding: "3px 8px",
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: 999,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: "var(--ink-3)" }}>{c.l} </span>
                  <span className="tx-mono" style={{ color: "var(--violet)" }}>{c.v}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "0 22px 22px", display: "flex", gap: 8 }}>
          <button type="button" className="gw-btn gw-btn--primary" style={{ flex: 1 }}>
            Move to shortlist
          </button>
          <button type="button" className="gw-btn gw-btn--ghost">Message</button>
        </div>
      </aside>
    </div>
  );
}
