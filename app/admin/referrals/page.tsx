"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, Download, Plus, QrCode, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type RefStatus = "issued" | "hired" | "not_hired" | "expired";
const REF_STATUS: Record<RefStatus, { tone: PillTone; label: string }> = {
  issued: { tone: "sky", label: "Issued" },
  hired: { tone: "emerald", label: "Hired" },
  not_hired: { tone: "rose", label: "Not hired" },
  expired: { tone: "slate", label: "Expired" },
};

const SLIPS: { s: string; j: string; job: string; i: string; st: RefStatus }[] = [
  { s: "TC-2026-014872", j: "Juan M. Cruz", job: "Bookkeeper · Dole", i: "23 May", st: "issued" },
  { s: "TC-2026-014871", j: "Andrea L. Sanchez", job: "Payroll Clerk · Sultan Kudarat Foods", i: "23 May", st: "issued" },
  { s: "TC-2026-014866", j: "Mark T. Reyes", job: "QA Supervisor · Dole", i: "22 May", st: "hired" },
  { s: "TC-2026-014812", j: "Lourdes M. Mendoza", job: "Records · City Hall", i: "20 May", st: "hired" },
  { s: "TC-2026-014744", j: "Patrick C. Yu", job: "CSR · Sykes", i: "18 May", st: "not_hired" },
  { s: "TC-2026-014680", j: "Rene G. Galicia", job: "Driver · Cebu Pacific", i: "15 May", st: "expired" },
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

export default function AdminReferralsPage() {
  const [validity, setValidity] = useState(1); // index 0..2
  const [filter, setFilter] = useState(0);

  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            Referral slips
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>Issue, track, and audit endorsements</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="gw-btn gw-btn--ghost">
            <Download size={13} /> Export
          </button>
          <button type="button" className="gw-btn gw-btn--primary">
            <Plus size={14} /> Issue new slip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Issued this month" value="184" delta="+12% vs Apr" />
        <Stat label="Active right now" value="62" delta="avg. 8.4 days valid" />
        <Stat label="Hires confirmed" value="78" delta="42% conversion" />
        <Stat label="Expired without action" value="14" delta="needs follow-up" down />
      </div>

      <div className="mt-[18px] grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4">
        {/* Issue card (dark) */}
        <div
          className="gw-card"
          style={{
            padding: 22,
            background: "var(--official-ink)",
            color: "#fff",
            borderColor: "var(--official-ink)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                border: "1px solid var(--seal-gold-2)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <span className="tx-mono" style={{ fontSize: 10, color: "var(--seal-gold-2)" }}>+</span>
            </div>
            <div
              className="tx-mono"
              style={{
                fontSize: 10,
                color: "var(--seal-gold-2)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Issue a new slip
            </div>
          </div>
          <div
            className="tx-serif"
            style={{
              marginTop: 14,
              color: "#fff",
              fontWeight: 400,
              fontSize: 22,
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
            }}
          >
            Endorse a jobseeker
          </div>
          <div className="tx-body" style={{ color: "var(--ink-5)", marginTop: 6, fontSize: 13 }}>
            Slips are valid for 14 days and signed with HMAC-SHA256.
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="tx-micro" style={{ color: "var(--ink-5)", marginBottom: 5 }}>Jobseeker</div>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--seal-gold)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  JC
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "500 13px/1 var(--font-ui)", color: "#fff" }}>Juan Miguel A. Cruz</div>
                  <div className="tx-mono" style={{ fontSize: 10, color: "var(--ink-5)", marginTop: 2 }}>
                    NSRP-2026-000182
                  </div>
                </div>
                <ChevronDown size={13} style={{ color: "var(--ink-5)" }} />
              </div>
            </div>

            <div>
              <div className="tx-micro" style={{ color: "var(--ink-5)", marginBottom: 5 }}>Job</div>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.06)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Briefcase size={11} color="var(--ink-5)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "500 13px/1 var(--font-ui)", color: "#fff" }}>Bookkeeper</div>
                  <div className="tx-micro" style={{ color: "var(--ink-5)", marginTop: 2 }}>
                    Dole Philippines, Inc.
                  </div>
                </div>
                <ChevronDown size={13} style={{ color: "var(--ink-5)" }} />
              </div>
            </div>

            <div>
              <div className="tx-micro" style={{ color: "var(--ink-5)", marginBottom: 5 }}>Validity</div>
              <div className="gw-toggle" style={{ background: "rgba(255,255,255,0.05)" }}>
                {["7 days", "14 days", "30 days"].map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValidity(i)}
                    className={validity === i ? "active" : ""}
                    style={
                      validity === i
                        ? { background: "var(--seal-gold)", color: "#fff" }
                        : { color: "var(--ink-5)" }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 12,
              background: "rgba(255,255,255,0.04)",
              borderRadius: "var(--r-2)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--seal-gold)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} />
            </div>
            <div className="tx-caption" style={{ color: "var(--ink-5)", fontSize: 12.5 }}>
              Match score for this pairing is{" "}
              <span className="tx-mono" style={{ color: "var(--seal-gold-2)" }}>94%</span>. Recommended.
            </div>
          </div>

          <button
            type="button"
            className="gw-btn gw-btn--lg gw-btn--block"
            style={{ marginTop: 18, background: "var(--seal-gold)", color: "#fff" }}
          >
            <QrCode size={14} /> Generate slip
          </button>
        </div>

        {/* Track table */}
        <div className="gw-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--ink-7)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div className="tx-h3">Recent slips</div>
            <span style={{ flex: 1 }} />
            <div className="gw-toggle">
              {["All", "Issued", "Hired", "Not hired", "Expired"].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={filter === i ? "active" : ""}
                  onClick={() => setFilter(i)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--ink-7)" }}>
                {["Slip #", "Jobseeker", "Job · Employer", "Issued", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      font: "500 11px/1 var(--font-ui)",
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
              {SLIPS.map((r, i) => (
                <tr
                  key={r.s}
                  style={{ borderBottom: i < SLIPS.length - 1 ? "1px solid var(--ink-7)" : "none", cursor: "pointer" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/referral/${r.s}`} style={{ color: "inherit", textDecoration: "none" }}>
                      <span className="tx-mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{r.s}</span>
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{r.j}</td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-2)" }}>{r.job}</td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-3)", fontSize: 12.5 }}>{r.i}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Pill tone={REF_STATUS[r.st].tone}>{REF_STATUS[r.st].label}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
