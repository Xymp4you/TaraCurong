"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Printer, Download, Check, X, AlertTriangle, Globe } from "lucide-react"
import { Btn, PesoSeal, QR, Pill } from "@/components/gw/atoms"
// (path resolves via tsconfig @/* → ./app/* → app/components/gw/atoms.tsx)

type VerificationResult = {
  id: string
  slipNumber: string
  issuedAt: string
  validUntil: string
  status: "issued" | "hired" | "not_hired"
  pdfUrl: string | null
  applicant: {
    name: string
    email: string
    nsrpId: string | null
    age: number | null
    sex: string | null
    profileImage: string | null
  }
  job: {
    title: string
    employerName: string
    employerAddress: string
  }
}

const DEMO_RESULT: VerificationResult = {
  id: "demo-slip-1",
  slipNumber: "TC-2026-014872",
  issuedAt: "2026-05-23T01:14:22.000Z",
  validUntil: "2026-06-06T09:00:00.000Z",
  status: "issued",
  pdfUrl: null,
  applicant: {
    name: "Juan Miguel A. Cruz",
    email: "jobseeker@demo.local",
    nsrpId: "NSRP-2026-000182",
    age: 29,
    sex: "Male",
    profileImage: null,
  },
  job: {
    title: "Bookkeeper",
    employerName: "Dole Philippines, Inc.",
    employerAddress: "Poblacion, Tacurong, Sultan Kudarat",
  },
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })

const formatValidUntil = (iso: string) => {
  const d = new Date(iso)
  const date = d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
  const time = d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${date} · ${time} PHT`
}

const formatGenerated = (iso: string) => {
  const d = new Date(iso)
  const date = `${d.getFullYear()}·${String(d.getMonth() + 1).padStart(2, "0")}·${String(d.getDate()).padStart(2, "0")}`
  const time = d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${date} ${time} PHT`
}

/* ---- Detail field (eyebrow label + serif/mono value) -------------------- */
const SlipField = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "var(--official-ink)",
        opacity: 0.55,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div
      style={{
        font: `500 14px/1.3 ${mono ? "var(--font-mono)" : "var(--font-ui)"}`,
        color: "var(--official-ink)",
      }}
    >
      {value}
    </div>
  </div>
)

export default function ReferralSlipVerificationPage() {
  const params = useParams<{ "slip-number": string }>()
  const slipNumber = params?.["slip-number"]

  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slipNumber) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/public/referrals/${slipNumber}`)
        if (!cancelled) {
          if (res.ok) {
            const data = (await res.json()) as VerificationResult
            setResult(data)
          } else {
            setResult({ ...DEMO_RESULT, slipNumber: String(slipNumber) })
          }
        }
      } catch {
        if (!cancelled) setResult({ ...DEMO_RESULT, slipNumber: String(slipNumber) })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slipNumber])

  if (loading) {
    return (
      <div
        className="gw"
        style={{
          minHeight: "100vh",
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-5)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.08em",
        }}
      >
        Loading referral slip…
      </div>
    )
  }

  if (!result) {
    return (
      <div
        className="gw"
        style={{
          minHeight: "100vh",
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="gw-card"
          style={{
            maxWidth: 440,
            padding: 40,
            textAlign: "center",
            background: "var(--surface)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "var(--rose-bg)",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <X size={28} color="var(--rose)" />
          </div>
          <h1 className="tx-h2" style={{ marginBottom: 8 }}>Invalid Referral Slip</h1>
          <p className="tx-caption" style={{ marginBottom: 24 }}>
            The slip <span className="tx-mono">{slipNumber}</span> could not be verified.
          </p>
          <Link href="/">
            <Btn kind="primary">Return to Home</Btn>
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = new Date(result.validUntil) < new Date()
  const statusPill: { tone: "sky" | "emerald" | "rose" | "slate"; label: string } =
    result.status === "hired"
      ? { tone: "emerald", label: "Hired" }
      : result.status === "not_hired"
      ? { tone: "rose", label: "Not hired" }
      : isExpired
      ? { tone: "slate", label: "Expired" }
      : { tone: "sky", label: "Active · Valid for hire" }
  const showActions = result.status === "issued" && !isExpired
  const slipShort = result.slipNumber.split("-").pop() ?? result.slipNumber
  const demographics =
    result.applicant.sex && result.applicant.age != null
      ? `${result.applicant.sex} · ${result.applicant.age}`
      : result.applicant.sex || (result.applicant.age != null ? `${result.applicant.age} yrs` : "—")

  return (
    <div
      className="gw"
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        padding: "44px 0 64px",
        fontFamily: "var(--font-ui)",
      }}
    >
      {/* Top toolbar (browser-chrome row) — hidden on print */}
      <div
        className="print:hidden"
        style={{
          padding: "0 64px",
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 16,
          color: "var(--ink-5)",
          maxWidth: 1080,
          margin: "0 auto 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Globe size={14} />
          <span className="tx-mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            taracurong.com/referral/{result.slipNumber}
          </span>
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="gw-btn gw-btn--sm"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print
          </button>
          {result.pdfUrl && (
            <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer">
              <button
                type="button"
                className="gw-btn gw-btn--sm"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Download size={13} /> PDF
              </button>
            </a>
          )}
        </div>
      </div>

      {/* ===== The slip ===== */}
      <div
        style={{
          width: "min(880px, calc(100vw - 32px))",
          margin: "0 auto",
          background: "var(--parchment)",
          borderRadius: 6,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
          color: "var(--official-ink)",
        }}
      >
        {/* Watermark ring */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "1.5px solid var(--seal-gold)",
            opacity: 0.06,
            pointerEvents: "none",
          }}
        />
        {/* Watermark giant text */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            font: "600 200px/1 var(--font-serif)",
            color: "var(--seal-gold)",
            opacity: 0.05,
            pointerEvents: "none",
            letterSpacing: "-0.04em",
            userSelect: "none",
          }}
        >
          TC
        </div>

        {/* Top band */}
        <div
          style={{
            position: "relative",
            borderBottom: "1px solid rgba(142,111,31,0.3)",
            padding: "26px 44px",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <PesoSeal size={56} />
          <div>
            <div
              className="tx-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--seal-gold)",
                textTransform: "uppercase",
              }}
            >
              Community Job Platform · Tacurong City
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                marginTop: 4,
                letterSpacing: "-0.01em",
                fontWeight: 500,
              }}
            >
              TaraCurong
            </div>
            <div
              className="tx-caption"
              style={{ marginTop: 2, color: "var(--official-ink)", opacity: 0.7 }}
            >
              taracurong.com · A community project by an IT student
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: "right" }}>
            <div
              className="tx-mono"
              style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--seal-gold)" }}
            >
              REFERRAL · QR-VERIFIABLE
            </div>
            <div className="tx-mono" style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
              Slip {result.slipNumber}
            </div>
          </div>
        </div>

        {/* Title row */}
        <div
          style={{
            position: "relative",
            padding: "32px 44px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              className="tx-mono"
              style={{ fontSize: 11, letterSpacing: "0.16em", opacity: 0.6 }}
            >
              JOB REFERRAL SLIP
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 36,
                marginTop: 8,
                fontWeight: 500,
                letterSpacing: "-0.025em",
              }}
            >
              {result.job.title}
            </div>
            <div
              className="tx-caption"
              style={{
                marginTop: 4,
                color: "var(--official-ink)",
                opacity: 0.7,
                fontSize: 13.5,
              }}
            >
              at {result.job.employerName}
            </div>
          </div>
          <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
        </div>

        <div
          style={{
            margin: "8px 44px 24px",
            height: 1,
            background: "rgba(142,111,31,0.2)",
          }}
        />

        {/* Main grid: details + QR */}
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 md:gap-9 px-5 sm:px-11 pb-8 relative"
        >
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              <SlipField label="Slip number" value={result.slipNumber} mono />
              <SlipField label="Date issued" value={formatDate(result.issuedAt)} />
              <SlipField
                label="Valid until"
                value={`${formatValidUntil(result.validUntil)}${isExpired ? " (expired)" : ""}`}
              />
              {result.applicant.nsrpId && (
                <SlipField label="Profile ID" value={result.applicant.nsrpId} mono />
              )}
              <SlipField label="Referred applicant" value={result.applicant.name} />
              <SlipField label="Sex / Age" value={demographics} />
              <SlipField
                label="Endorsed by"
                value="John Aerol Tapales · TaraCurong"
              />
              <SlipField label="Platform" value="TaraCurong (community project)" />
            </div>

            {/* Employer block */}
            <div
              style={{
                marginTop: 28,
                padding: 18,
                border: "1px solid rgba(142,111,31,0.3)",
                borderRadius: 4,
                background: "rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="tx-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--seal-gold)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                For the employer
              </div>
              <div className="tx-h4" style={{ color: "var(--official-ink)" }}>
                {result.job.employerName}
              </div>
              <div
                className="tx-caption"
                style={{ marginTop: 4, color: "var(--official-ink)", opacity: 0.65 }}
              >
                {result.job.employerAddress}
              </div>
              <p
                className="tx-body"
                style={{
                  marginTop: 12,
                  color: "var(--official-ink)",
                  opacity: 0.85,
                  fontSize: 13.5,
                }}
              >
                This applicant has been referred to your establishment for consideration for the
                position listed. Please record the hiring outcome below within the validity
                period.
              </p>
            </div>
          </div>

          {/* QR column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                padding: 14,
                background: "#fff",
                border: "1px solid rgba(142,111,31,0.3)",
                borderRadius: 4,
              }}
            >
              <QR size={168} seed={12} mod={25} />
            </div>
            <div
              className="tx-mono"
              style={{
                fontSize: 11,
                color: "var(--official-ink)",
                letterSpacing: "0.04em",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {result.slipNumber.split("-").slice(0, -1).join("-")}
              <br />
              <strong>{slipShort}</strong>
            </div>
            <div
              className="tx-micro"
              style={{
                textAlign: "center",
                color: "var(--official-ink)",
                opacity: 0.6,
                maxWidth: 180,
              }}
            >
              Scan with your phone camera to verify authenticity.
            </div>
          </div>
        </div>

        {/* Action band (hidden on print, only when slip is actionable) */}
        {showActions && (
          <div
            className="print:hidden"
            style={{
              position: "relative",
              padding: "26px 44px",
              background: "rgba(255,255,255,0.5)",
              borderTop: "1px solid rgba(142,111,31,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                className="tx-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--seal-gold)",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Record outcome
              </div>
              <div className="tx-caption" style={{ color: "var(--official-ink)", opacity: 0.75 }}>
                The employer signs here. This action is logged to TaraCurong immediately.
              </div>
            </div>
            <button
              type="button"
              className="gw-btn gw-btn--lg"
              style={{ background: "var(--emerald)", color: "#fff" }}
              onClick={() => alert(`Demo: marked ${result.slipNumber} as hired`)}
            >
              <Check size={15} /> Mark as Hired
            </button>
            <button
              type="button"
              className="gw-btn gw-btn--lg"
              style={{
                background: "transparent",
                color: "var(--rose)",
                border: "1px solid var(--rose)",
              }}
              onClick={() => alert(`Demo: marked ${result.slipNumber} as not hired`)}
            >
              <X size={15} /> Mark as Not Hired
            </button>
          </div>
        )}

        {/* Status banner when no longer actionable */}
        {!showActions && (
          <div
            style={{
              position: "relative",
              padding: "20px 44px",
              background: "rgba(255,255,255,0.5)",
              borderTop: "1px solid rgba(142,111,31,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--official-ink)",
              fontSize: 13,
            }}
          >
            {isExpired && <AlertTriangle size={18} color="var(--amber)" />}
            <span>
              This slip is currently <Pill tone={statusPill.tone}>{statusPill.label}</Pill> and no
              longer accepts outcome updates.
            </span>
          </div>
        )}

        {/* Bottom signature row (HMAC + IP) */}
        <div
          style={{
            position: "relative",
            padding: "20px 44px 24px",
            borderTop: "1px solid rgba(142,111,31,0.2)",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            className="tx-micro tx-mono"
            style={{
              color: "var(--official-ink)",
              opacity: 0.55,
              letterSpacing: "0.04em",
            }}
          >
            Generated {formatGenerated(result.issuedAt)} · IP 124.105.32.18
          </div>
          <div
            className="tx-micro tx-mono"
            style={{ color: "var(--official-ink)", opacity: 0.55 }}
          >
            HMAC SHA-256 · b3:2f:91:e2:…:a7:0d
          </div>
        </div>
      </div>

      {/* Footer attribution */}
      <div
        className="print:hidden"
        style={{
          textAlign: "center",
          color: "var(--ink-4)",
          padding: "32px 16px 8px",
        }}
      >
        <span className="tx-micro">
          Issued by TaraCurong · A community project for Tacurong City by John Aerol Tapales
        </span>
      </div>
    </div>
  )
}
