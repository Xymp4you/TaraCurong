"use client";

import { useParams } from "next/navigation";
import { Bookmark, Briefcase, Clock, MapPin, Sparkles } from "lucide-react";
import { ScamWarning } from "@/components/transparency/scam-warning";
import { ReportButton } from "@/components/transparency/report-button";

const DETAIL = {
  title: "Bookkeeper",
  company: "Dole Philippines, Inc.",
  location: "Tacurong, Sultan Kudarat",
  type: "Full-time · On-site",
  salary: "₱18,000 – ₱24,000 / mo",
  posted: "Posted 2 days ago",
  match: 94,
  facts: [
    ["Experience", "1–3 years"],
    ["Education", "Bachelor's"],
    ["Slots", "2 open"],
    ["Closes", "30 Jun 2026"],
  ] as const,
  about:
    "Maintain accurate financial records for the Tacurong cannery operations. Reconcile daily transactions, prepare monthly reports, and coordinate with the regional finance team. Reports to the Finance Manager.",
  duties: [
    "Record day-to-day financial transactions and complete the posting process",
    "Verify that transactions are recorded in the correct day-book, suppliers ledger, and general ledger",
    "Bring the books to the trial-balance stage and assist in monthly closings",
    "Perform partial checks of the posting process and submit reports to senior accountants",
  ],
  skills: ["Bookkeeping", "QuickBooks", "Excel", "BIR forms", "Reconciliation", "Trial balance", "Payroll"],
  nextSteps: [
    ["Application sent to Dole HR", "Instant"],
    ["Initial screening", "Usually within 3 days"],
    ["Shortlist or feedback", "By 30 May"],
    ["Referral slip with QR", "If shortlisted"],
  ] as const,
};

export default function JobseekerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobTitle = params?.id ? decodeURIComponent(params.id) : DETAIL.title;

  return (
    <div
      className="gw"
      style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, maxWidth: 1100 }}
    >
      <div>
        <div className="gw-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--r-3)",
                background: "var(--paper-2)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Briefcase size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="tx-caption" style={{ marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>{DETAIL.company}</span>
                <span>·</span>
                <span
                  style={{ color: "var(--emerald)", cursor: "help", borderBottom: "1px dotted var(--emerald)" }}
                  title="Verified means the maintainer manually reviewed the employer's submitted documents. It is not a government background check — exercise your own judgment before accepting offers or sharing sensitive documents."
                >
                  ● Verified employer
                </span>
              </div>
              <div
                className="tx-serif"
                style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.028em" }}
              >
                {jobTitle}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 12, color: "var(--ink-3)", flexWrap: "wrap" }}>
                <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={13} />{DETAIL.location}
                </span>
                <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Briefcase size={13} />{DETAIL.type}
                </span>
                <span
                  className="tx-caption tx-mono"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}
                >
                  {DETAIL.salary}
                </span>
                <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Clock size={13} />{DETAIL.posted}
                </span>
              </div>
            </div>
            <div
              className="tx-mono"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                background: "var(--teal-4)",
                color: "var(--teal)",
                fontSize: 12,
                letterSpacing: "0.04em",
              }}
            >
              {DETAIL.match}% match
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {DETAIL.facts.map(([k, v]) => (
              <div key={k}>
                <div
                  className="tx-micro"
                  style={{ color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {k}
                </div>
                <div className="tx-h4" style={{ marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gw-card" style={{ padding: 28, marginTop: 16 }}>
          <div className="tx-h3" style={{ marginBottom: 12 }}>About the role</div>
          <p className="tx-body-lg" style={{ maxWidth: 640 }}>{DETAIL.about}</p>

          <div className="tx-h3" style={{ marginTop: 28, marginBottom: 12 }}>What you&apos;ll do</div>
          <ul style={{ paddingLeft: 18, margin: 0, color: "var(--ink-2)", fontSize: 14, lineHeight: 1.65 }}>
            {DETAIL.duties.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <div className="tx-h3" style={{ marginTop: 28, marginBottom: 12 }}>Required skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DETAIL.skills.map((s) => (
              <span key={s} className="gw-chip" style={{ height: 26 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <aside>
        <div className="gw-card" style={{ padding: 20, position: "sticky", top: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="tx-eyebrow">Your application</div>
            <Bookmark size={14} style={{ color: "var(--ink-4)", cursor: "pointer" }} />
          </div>
          <div className="tx-h3">Ready to apply?</div>
          <div className="tx-caption" style={{ marginTop: 4 }}>
            Your profile is 72% complete and meets the requirements.
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "var(--teal-4)",
              borderRadius: "var(--r-2)",
              display: "flex",
              gap: 10,
            }}
          >
            <Sparkles size={14} style={{ color: "var(--teal)", marginTop: 1, flexShrink: 0 }} />
            <div className="tx-caption" style={{ color: "var(--teal)", fontSize: 12.5 }}>
              Your bookkeeping and Excel skills look like a fit. Match scores are software estimates, not decisions — the employer reviews every applicant.
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <ScamWarning context="application" />
          </div>

          <div className="tx-micro" style={{ marginTop: 10, color: "var(--ink-4)", lineHeight: 1.5 }}>
            By applying, you agree your contact details, profile, and any attached documents become
            visible to <strong>{DETAIL.company}</strong>. Only the employer you apply to and the
            project maintainer can see your application. See{" "}
            <a href="/privacy" style={{ color: "var(--teal)" }}>Privacy Policy</a> and{" "}
            <a href="/terms" style={{ color: "var(--teal)" }}>Terms of Use</a>.
          </div>

          <button
            type="button"
            className="gw-btn gw-btn--lg gw-btn--accent gw-btn--block"
            style={{ marginTop: 16 }}
          >
            Submit application
          </button>
          <button
            type="button"
            className="gw-btn gw-btn--ghost gw-btn--block"
            style={{ marginTop: 8 }}
          >
            Save for later
          </button>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "16px 0" }} />

          <div className="tx-h4" style={{ fontSize: 13, marginBottom: 8 }}>What happens next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DETAIL.nextSteps.map(([t, w], i) => (
              <div key={t} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    border: "1.5px solid var(--ink-6)",
                    color: "var(--ink-4)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    font: "500 10px/1 var(--font-mono)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="tx-body" style={{ fontSize: 13 }}>{t}</div>
                  <div className="tx-micro" style={{ color: "var(--ink-4)" }}>{w}</div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "16px 0" }} />
          <ReportButton target="job" identifier={params?.id ?? undefined} />
        </div>
      </aside>
    </div>
  );
}
