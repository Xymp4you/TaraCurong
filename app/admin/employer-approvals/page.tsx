"use client";

import { useState } from "react";
import { Building, Check, Clock, Eye, FileText, Sliders, X } from "lucide-react";
import { Pill } from "@/components/gw/atoms";

export const dynamic = "force-dynamic";

type Row = {
  n: string;
  t: string;
  a: string;
  s: string;
  contact: string;
  flag?: string;
  docs?: string[];
};

const ROWS: Row[] = [
  { n: "Marigold Manpower Inc.", t: "TIN 234-567-890-000", a: "Tacurong · Logistics", s: "Submitted 2h ago", contact: "ronie@marigold.ph", docs: ["SRS Form 2", "BIR 2303", "DOLE D.O. 174"] },
  { n: "Sarangani Aqua Ventures", t: "TIN 102-558-941-000", a: "Alabel · Aquaculture", s: "Submitted yesterday", contact: "hr@sav.ph" },
  { n: "Tacurong Trading Corp.", t: "TIN 887-204-119-000", a: "Tina · Retail", s: "Submitted 2d ago", contact: "admin@gtc.ph" },
  { n: "Tacurong Plumbing Co.", t: "TIN 998-244-301-000", a: "Tacurong · Trades", s: "Submitted 3d ago", contact: "office@ppc.ph", flag: "Resubmitted (DOLE doc missing)" },
  { n: "BBA Marketing", t: "TIN 645-122-997-000", a: "Tacurong · Marketing", s: "Submitted 4d ago", contact: "sandra@bba.ph" },
  { n: "Howard Hubbard Clinic", t: "TIN 339-887-210-000", a: "Tacurong · Healthcare", s: "Submitted 4d ago", contact: "ops@hhclinic.ph" },
  { n: "AMA Construction Co.", t: "TIN 002-558-770-000", a: "Sarangani · Construction", s: "Submitted 5d ago", contact: "team@ama.ph" },
];

const TABS = [
  { l: "Pending", c: 7 },
  { l: "Approved", c: 486 },
  { l: "Suspended", c: 12 },
  { l: "Archived", c: 38 },
];

const FACTS: ReadonlyArray<readonly [string, string]> = [
  ["TIN", "234-567-890-000"],
  ["Industry", "Logistics / Manpower"],
  ["Address", "Block 2, Industrial Compound, Tacurong"],
  ["Contact", "Ronie Tomas, HR Manager · +63 928 401 8842"],
];

const CHECKS: ReadonlyArray<readonly [string, true | "warn"]> = [
  ["Business permit / BIR 2303 submitted", true],
  ["Authorized rep ID submitted", true],
  ["Selfie with ID submitted", true],
  ["Rep declared authorization", true],
  ["Address matches permit", true],
  ["DOLE D.O. 174 compliance", "warn"],
];

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="gw" style={{ maxWidth: 1280 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16 }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            Employer approvals
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>7 establishments pending verification</p>
        </div>
        <button type="button" className="gw-btn gw-btn--ghost">
          <Sliders size={13} /> Filter
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--ink-7)", marginBottom: 18 }}>
        {TABS.map((t) => {
          const isActive = activeTab === t.l;
          return (
            <button
              type="button"
              key={t.l}
              onClick={() => setActiveTab(t.l)}
              style={{
                padding: "10px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: isActive ? "2px solid var(--role-admin)" : "2px solid transparent",
                marginBottom: -1,
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              <span style={{ font: "500 13.5px/1 var(--font-ui)", color: isActive ? "var(--ink)" : "var(--ink-3)" }}>
                {t.l}
              </span>
              <span
                className="tx-mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-4)",
                  padding: "2px 6px",
                  background: "var(--paper-2)",
                  borderRadius: 999,
                }}
              >
                {t.c}
              </span>
            </button>
          );
        })}
      </div>

      <div className="gw-card" style={{ padding: 0, overflow: "hidden" }}>
        {ROWS.map((r, i) => {
          const isExpanded = expanded === i;
          return (
            <div
              key={r.n}
              style={{
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                background: isExpanded ? "var(--surface-2)" : "var(--surface)",
              }}
            >
              <div
                onClick={() => setExpanded(isExpanded ? -1 : i)}
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isExpanded ? "var(--rose-bg)" : "var(--paper-2)",
                    color: isExpanded ? "var(--role-admin)" : "var(--ink-2)",
                    border: "1px solid var(--ink-7)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Building size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div className="tx-h3" style={{ fontSize: 15 }}>{r.n}</div>
                    {r.flag && (
                      <Pill tone="amber" dot={false}>
                        <Clock size={9} /> {r.flag}
                      </Pill>
                    )}
                  </div>
                  <div className="tx-caption" style={{ marginTop: 4 }}>
                    {r.t} · {r.a} · <span className="tx-mono">{r.contact}</span>
                  </div>
                </div>
                <div className="tx-micro" style={{ color: "var(--ink-3)", minWidth: 140, textAlign: "right" }}>
                  {r.s}
                </div>
                <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">
                    <Eye size={12} /> View
                  </button>
                  <button type="button" className="gw-btn gw-btn--sm" style={{ background: "var(--emerald)", color: "#fff" }}>
                    <Check size={12} /> Approve
                  </button>
                  <button
                    type="button"
                    className="gw-btn gw-btn--sm"
                    style={{
                      background: "transparent",
                      color: "var(--rose)",
                      border: "1px solid var(--rose)",
                    }}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>

              {isExpanded && r.docs && (
                <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--ink-7)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 24, paddingTop: 18 }}>
                    <div>
                      <div className="tx-eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>
                        About the establishment
                      </div>
                      <p className="tx-body" style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
                        Manpower-pooling and logistics support for the cannery and aquaculture sectors in
                        SOCCSKSARGEN. 142 employees, with intent to hire 38 contractual workers over the next
                        quarter.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
                        {FACTS.map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 12 }}>
                            <div className="tx-micro" style={{ width: 84, color: "var(--ink-3)" }}>{k}</div>
                            <div className="tx-body" style={{ fontSize: 13, color: "var(--ink)" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="tx-eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>
                        Submitted documents
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {r.docs.map((d) => (
                          <div
                            key={d}
                            style={{
                              padding: 10,
                              border: "1px solid var(--ink-7)",
                              borderRadius: "var(--r-2)",
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 32,
                                background: "var(--paper-2)",
                                border: "1px solid var(--ink-7)",
                                borderRadius: 3,
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <FileText size={12} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="tx-body" style={{ fontSize: 12.5 }}>{d}</div>
                              <div className="tx-micro" style={{ color: "var(--ink-4)" }}>PDF · 142 KB</div>
                            </div>
                            <Eye size={13} style={{ color: "var(--ink-3)" }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="tx-eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>
                        Verification checks
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {CHECKS.map(([l, s]) => (
                          <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                background: s === true ? "var(--emerald-bg)" : "var(--amber-bg)",
                                color: s === true ? "var(--emerald)" : "var(--amber)",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              {s === true ? (
                                <Check size={11} />
                              ) : (
                                <span style={{ fontSize: 10, fontWeight: 700 }}>!</span>
                              )}
                            </div>
                            <span className="tx-body" style={{ fontSize: 12.5 }}>{l}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 16, padding: 10, background: "var(--amber-bg)", borderRadius: "var(--r-2)" }}>
                        <div
                          className="tx-micro"
                          style={{
                            color: "var(--amber)",
                            fontSize: 11.5,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          One soft warning
                        </div>
                        <div className="tx-body" style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4 }}>
                          DOLE compliance certificate expires in 41 days. Approval is allowed; a reminder will be
                          sent.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
