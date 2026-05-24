"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, MapPin, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type Match = {
  ini: string;
  n: string;
  age: number;
  loc: string;
  exp: string;
  score: number;
  factors: { skills: number; exp: number; loc: number };
  status?: "interview" | "shortlisted" | "under_review";
};

const MATCHES: Match[] = [
  { ini: "JC", n: "Juan M. Cruz", age: 29, loc: "Tacurong · 12 km", exp: "5y bookkeeping", score: 94, factors: { skills: 90, exp: 95, loc: 100 }, status: "interview" },
  { ini: "AS", n: "Andrea L. Sanchez", age: 31, loc: "Koronadal · 28 km", exp: "3y payroll", score: 91, factors: { skills: 90, exp: 85, loc: 80 }, status: "shortlisted" },
  { ini: "MR", n: "Mark T. Reyes", age: 27, loc: "Tacurong · 8 km", exp: "4y BIR filing", score: 89, factors: { skills: 88, exp: 90, loc: 100 }, status: "shortlisted" },
  { ini: "CD", n: "Cristina P. Dela Cruz", age: 34, loc: "Tacurong · 3 km", exp: "6y team lead", score: 85, factors: { skills: 80, exp: 85, loc: 100 }, status: "under_review" },
  { ini: "RG", n: "Rene G. Galicia", age: 25, loc: "Sarangani · 35 km", exp: "2y junior accountant", score: 82, factors: { skills: 80, exp: 70, loc: 60 } },
  { ini: "LM", n: "Lourdes M. Mendoza", age: 30, loc: "Tacurong · 14 km", exp: "4y reconciliation", score: 78, factors: { skills: 75, exp: 80, loc: 90 } },
];

const STATUS_PILL: Record<NonNullable<Match["status"]>, { tone: PillTone; label: string }> = {
  interview: { tone: "amber", label: "Interview" },
  shortlisted: { tone: "violet", label: "Shortlisted" },
  under_review: { tone: "sky", label: "Under review" },
};

function FactorBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="tx-micro" style={{ color: "var(--ink-3)" }}>{label}</span>
        <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "var(--ink-7)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: value >= 85 ? "var(--violet)" : value >= 70 ? "var(--teal)" : "var(--ink-4)",
          }}
        />
      </div>
    </div>
  );
}

export default function EmployerMatchingPage() {
  const params = useParams<{ job_id: string }>();
  const jobId = params?.job_id ?? "bookkeeper";
  const [selected, setSelected] = useState(0);
  const top = MATCHES[selected];

  return (
    <div className="gw" style={{ maxWidth: 1400 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="tx-eyebrow" style={{ color: "var(--violet)" }}>AI matching console</div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em", marginTop: 8 }}>
            Bookkeeper · Tacurong
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>
            Job ID <span className="tx-mono">{jobId}</span> · 47 candidates ranked by best fit
          </p>
          <p
            className="tx-micro"
            style={{ marginTop: 6, color: "var(--ink-3)", maxWidth: 520, lineHeight: 1.5 }}
          >
            Scores are software estimates from a large-language-model prompt plus skill/location
            overlap. They are <strong>not</strong> hiring decisions and should not be the only
            factor in your shortlist. Review profiles directly.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="gw-btn gw-btn--ghost">
            Weights <ChevronDown size={13} />
          </button>
          <button type="button" className="gw-btn gw-btn--primary">
            <Sparkles size={13} /> Re-run matching
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
        {/* Candidates list */}
        <div className="gw-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 18px",
              borderBottom: "1px solid var(--ink-7)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface-2)",
            }}
          >
            <span className="tx-h4" style={{ fontSize: 13 }}>Ranked candidates</span>
            <span style={{ flex: 1 }} />
            <span className="tx-micro" style={{ color: "var(--ink-3)" }}>{MATCHES.length} shown · 47 total</span>
          </div>
          {MATCHES.map((m, i) => {
            const isActive = i === selected;
            return (
              <button
                type="button"
                key={m.n}
                onClick={() => setSelected(i)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  background: isActive ? "var(--violet-bg)" : "transparent",
                  borderBottom: i < MATCHES.length - 1 ? "1px solid var(--ink-7)" : "none",
                  border: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: isActive ? "var(--violet)" : "var(--paper-2)",
                    color: isActive ? "#fff" : "var(--ink-2)",
                    display: "grid",
                    placeItems: "center",
                    font: "600 12px/1 var(--font-ui)",
                    flexShrink: 0,
                  }}
                >
                  {m.ini}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="tx-h4" style={{ fontSize: 13.5 }}>{m.n}</div>
                    {m.status && (
                      <Pill tone={STATUS_PILL[m.status].tone}>{STATUS_PILL[m.status].label}</Pill>
                    )}
                  </div>
                  <div className="tx-micro" style={{ marginTop: 2 }}>
                    {m.exp} · {m.age} yrs ·{" "}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={10} /> {m.loc}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 72 }}>
                    <div
                      style={{
                        height: 4,
                        background: "var(--ink-7)",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${m.score}%`,
                          background: m.score >= 85 ? "var(--violet)" : "var(--teal)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="tx-mono"
                    style={{
                      minWidth: 42,
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: 600,
                      color: m.score >= 85 ? "var(--violet)" : "var(--ink-2)",
                    }}
                  >
                    {m.score}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Rationale panel */}
        <aside className="gw-card" style={{ padding: 0, overflow: "hidden", position: "sticky", top: 80, alignSelf: "flex-start" }}>
          <div style={{ padding: 20, background: "var(--violet-bg)", borderBottom: "1px solid var(--ink-7)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Sparkles size={14} color="var(--violet)" />
              <span
                className="tx-mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--violet)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                AI rationale
              </span>
            </div>
            <div className="tx-h2">{top.n}</div>
            <div className="tx-caption" style={{ marginTop: 4 }}>
              {top.age} yrs · {top.loc} · {top.exp}
            </div>
            <div
              className="tx-mono"
              style={{
                marginTop: 12,
                fontSize: 28,
                fontWeight: 600,
                color: "var(--violet)",
                letterSpacing: "-0.02em",
              }}
            >
              {top.score}% match
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <div className="tx-h4" style={{ fontSize: 13, marginBottom: 12 }}>How the score breaks down</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FactorBar label="Skills overlap" value={top.factors.skills} />
              <FactorBar label="Experience match" value={top.factors.exp} />
              <FactorBar label="Location proximity" value={top.factors.loc} />
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0" }} />

            <div className="tx-h4" style={{ fontSize: 13, marginBottom: 8 }}>Why this matches</div>
            <p className="tx-body" style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
              Hands-on QuickBooks and Excel from {top.exp}. Distance and shift compatibility line up with the
              Tacurong cannery role. Past payroll and BIR-filing background fits the reconciliation requirements
              of this position.
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button type="button" className="gw-btn gw-btn--primary" style={{ flex: 1 }}>
                Move to shortlist
              </button>
              <button type="button" className="gw-btn gw-btn--ghost">View profile</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
