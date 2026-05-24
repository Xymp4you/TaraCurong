"use client";

import Link from "next/link";
import { Check, MoreHorizontal } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type RefStatus = "issued" | "hired" | "not_hired" | "expired";

const REF_STATUS: Record<RefStatus, { tone: PillTone; label: string }> = {
  issued: { tone: "sky", label: "Issued" },
  hired: { tone: "emerald", label: "Hired" },
  not_hired: { tone: "rose", label: "Not hired" },
  expired: { tone: "slate", label: "Expired" },
};

type Slip = { num: string; job: string; emp: string; valid: string; status: RefStatus };

const SLIPS: Slip[] = [
  { num: "TC-2026-014872", job: "Bookkeeper", emp: "Dole Philippines, Inc.", valid: "06 Jun 2026", status: "issued" },
  { num: "TC-2026-013904", job: "Records Officer", emp: "City Hall Tacurong", valid: "Hired 18 Apr", status: "hired" },
  { num: "TC-2026-012211", job: "Office Clerk", emp: "Marigold Manpower", valid: "Expired 02 Apr", status: "expired" },
];

function Stat({ label, value, delta, helper, down }: { label: string; value: string; delta?: string; helper?: string; down?: boolean }) {
  return (
    <div className="gw-stat" style={{ flex: 1 }}>
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

export default function JobseekerReferralsPage() {
  return (
    <div className="gw" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Referral slips</h1>
        <p className="tx-caption" style={{ marginTop: 4 }}>QR-coded endorsements issued by TaraCurong</p>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <Stat label="Total issued" value="6" />
        <Stat label="Valid right now" value="1" delta="6 days left" helper="exp. 06 Jun" />
        <Stat label="Resulted in hire" value="1" delta="17% rate" />
        <Stat label="Expired" value="3" delta="awaiting reissue" down />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SLIPS.map((s) => (
          <div
            key={s.num}
            className="gw-card gw-card--hover"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              borderColor: s.status === "issued" ? "var(--seal-gold)" : "var(--ink-7)",
            }}
          >
            {/* Left: QR + slip number */}
            <div
              style={{
                width: 132,
                padding: 16,
                background: s.status === "issued" ? "var(--parchment)" : "var(--paper)",
                borderRight: "1px dashed var(--ink-6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div className="gw-qr sm" style={{ width: 92, height: 92 }}>
                <span className="br" />
              </div>
              <div
                className="tx-mono"
                style={{
                  fontSize: 9.5,
                  color: "var(--official-ink)",
                  textAlign: "center",
                  letterSpacing: "0.04em",
                  lineHeight: 1.4,
                }}
              >
                GW-TC<br />
                2026-{s.num.slice(-6)}
              </div>
            </div>

            {/* Right: details */}
            <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Pill tone={REF_STATUS[s.status].tone}>{REF_STATUS[s.status].label}</Pill>
                <span style={{ flex: 1 }} />
                <MoreHorizontal size={14} style={{ color: "var(--ink-4)" }} />
              </div>
              <div className="tx-h3" style={{ marginTop: 12 }}>{s.job}</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>{s.emp}</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <div className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>Valid: {s.valid}</div>
                {s.status === "issued" && (
                  <Link href={`/referral/${s.num}`}>
                    <button type="button" className="gw-btn gw-btn--sm gw-btn--primary">Show QR</button>
                  </Link>
                )}
                {s.status === "hired" && (
                  <span
                    className="tx-micro"
                    style={{ color: "var(--emerald)", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Check size={11} /> Hire confirmed
                  </span>
                )}
                {s.status === "expired" && (
                  <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">Request new slip</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
