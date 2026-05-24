"use client";

import { useState } from "react";
import { Building, Check, ChevronRight, Clock } from "lucide-react";

type View = "list" | "board" | "timeline";

type GroupKey = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected";
type Card = { t: string; c: string; d: string; warn?: boolean; success?: boolean };

const GROUPS: { key: GroupKey; label: string; count: number; color: string }[] = [
  { key: "submitted", label: "Submitted", count: 1, color: "var(--slate)" },
  { key: "under_review", label: "Under review", count: 3, color: "var(--sky)" },
  { key: "shortlisted", label: "Shortlisted", count: 1, color: "var(--violet)" },
  { key: "interview", label: "Interview", count: 1, color: "var(--amber)" },
  { key: "hired", label: "Hired", count: 1, color: "var(--emerald)" },
  { key: "rejected", label: "Closed", count: 1, color: "var(--rose)" },
];

const ITEMS: Record<GroupKey, Card[]> = {
  submitted: [{ t: "Front Desk Officer", c: "Greenleaf Hotel", d: "2h ago" }],
  under_review: [
    { t: "Office Clerk", c: "City Treasurer's Office", d: "4d ago" },
    { t: "Account Assistant", c: "RD Pawnshop", d: "1d ago" },
    { t: "Junior Accountant", c: "Sultan Kudarat CPA", d: "3d ago" },
  ],
  shortlisted: [{ t: "Cannery Line Lead", c: "General Tuna Corporation", d: "6d ago" }],
  interview: [{ t: "Bookkeeper", c: "Dole Philippines, Inc.", d: "Fri 10:00", warn: true }],
  hired: [{ t: "Records Officer", c: "City Hall Tacurong", d: "Hired 18 Apr", success: true }],
  rejected: [{ t: "Payroll Encoder", c: "Marigold Manpower", d: "Closed 12 May" }],
};

export default function JobseekerApplicationsPage() {
  const [view, setView] = useState<View>("board");

  return (
    <div className="gw" style={{ maxWidth: 1600 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Applications</h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>8 applications across 6 employers</p>
        </div>
        <div className="gw-toggle">
          {(["list", "board", "timeline"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={view === v ? "active" : ""}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 260px)", gap: 14, minWidth: 1620 }}>
          {GROUPS.map((g) => (
            <div key={g.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 8px" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color }} />
                <span className="tx-h4" style={{ fontSize: 13 }}>{g.label}</span>
                <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>{g.count}</span>
              </div>
              {ITEMS[g.key].map((it) => (
                <div key={it.t} className="gw-card gw-card--hover" style={{ padding: 14, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--paper-2)",
                        border: "1px solid var(--ink-7)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Building size={11} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tx-h4" style={{ fontSize: 13 }}>{it.t}</div>
                      <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)" }}>{it.c}</div>
                    </div>
                  </div>
                  <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      className="tx-micro"
                      style={{
                        color: it.warn ? "var(--amber)" : it.success ? "var(--emerald)" : "var(--ink-4)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {it.warn && <Clock size={11} />}
                      {it.success && <Check size={11} />}
                      {it.d}
                    </span>
                    <ChevronRight size={13} style={{ color: "var(--ink-4)" }} />
                  </div>
                </div>
              ))}
              {g.key === "submitted" && (
                <div
                  style={{
                    padding: 14,
                    border: "1px dashed var(--ink-6)",
                    borderRadius: "var(--r-3)",
                    textAlign: "center",
                  }}
                >
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>
                    Drop applications here when you submit them
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
