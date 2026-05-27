"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ChevronDown, Download, Plus, QrCode, Sparkles } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";
import { queryFetcher } from "@/lib/query-fetcher";

type RefStatus = "issued" | "hired" | "not_hired" | "expired";
const REF_STATUS: Record<RefStatus, { tone: PillTone; label: string }> = {
  issued: { tone: "sky", label: "Issued" },
  hired: { tone: "emerald", label: "Hired" },
  not_hired: { tone: "rose", label: "Not hired" },
  expired: { tone: "slate", label: "Expired" },
};

// Shape returned by GET /api/referrals (subset of fields actually consumed here).
interface ApiReferral {
  id: string;
  applicant: string;
  vacancy: string;
  employer: string;
  dateReferred: string | null;
  status: "Pending" | "For Interview" | "Hired" | "Rejected" | "Withdrawn";
  referralSlipNumber: string | null;
}

// Row shape consumed by the table JSX (unchanged from the original mock).
interface SlipRow {
  s: string;
  j: string;
  job: string;
  i: string;
  st: RefStatus;
}

function mapApiStatus(status: ApiReferral["status"]): RefStatus {
  switch (status) {
    case "Hired":
      return "hired";
    case "Rejected":
    case "Withdrawn":
      return "not_hired";
    default:
      return "issued";
  }
}

const issuedDateFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });

function formatIssued(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return issuedDateFormatter.format(date);
}

function adaptReferral(r: ApiReferral): SlipRow {
  const slipNumber = r.referralSlipNumber ?? r.id;
  const job = [r.vacancy, r.employer].filter(Boolean).join(" · ");
  return {
    s: slipNumber,
    j: r.applicant,
    job,
    i: formatIssued(r.dateReferred),
    st: mapApiStatus(r.status),
  };
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

export default function AdminReferralsPage() {
  const [validity, setValidity] = useState(1); // index 0..2
  const [filter, setFilter] = useState(0);

  const { data: referralsData, isLoading } = useQuery<ApiReferral[]>({
    queryKey: ["admin", "referrals", "list"],
    queryFn: () => queryFetcher<ApiReferral[]>("/api/referrals"),
  });
  const referrals = referralsData ?? [];
  const slips: SlipRow[] = referrals.map(adaptReferral);

  // Derived stat tiles (from the real referral data).
  const now = new Date();
  const issuedThisMonth = referrals.filter((r) => {
    if (!r.dateReferred) return false;
    const d = new Date(r.dateReferred);
    return !Number.isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const inProgressCount = referrals.filter((r) => r.status === "Pending" || r.status === "For Interview").length;
  const hiredCount = referrals.filter((r) => r.status === "Hired").length;
  const notHiredCount = referrals.filter((r) => r.status === "Rejected" || r.status === "Withdrawn").length;
  const conversion = referrals.length > 0 ? Math.round((hiredCount / referrals.length) * 100) : 0;

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
        <Stat label="Issued this month" value={String(issuedThisMonth)} />
        <Stat label="In progress" value={String(inProgressCount)} />
        <Stat label="Hires confirmed" value={String(hiredCount)} delta={referrals.length > 0 ? `${conversion}% conversion` : undefined} />
        <Stat label="Not hired" value={String(notHiredCount)} down />
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "12px 16px", color: "var(--ink-3)", fontSize: 12.5 }}>
                    Loading…
                  </td>
                </tr>
              ) : slips.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "12px 16px", color: "var(--ink-3)", fontSize: 12.5 }}>
                    No referral slips yet
                  </td>
                </tr>
              ) : (
                slips.map((r, i) => (
                  <tr
                    key={r.s}
                    style={{ borderBottom: i < slips.length - 1 ? "1px solid var(--ink-7)" : "none", cursor: "pointer" }}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
