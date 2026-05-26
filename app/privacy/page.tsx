import Link from "next/link";
import { ArrowUpRight, Lock, Scale, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";
import { PrivacyToc } from "./privacy-toc";

const infoCollected = [
  "Account details (name, email, contact number)",
  "Profile information for jobseekers and employers",
  "Job postings and application data",
  "Identity verification documents (only if you choose to verify): a government ID photo and a selfie holding that ID. Stored privately, viewable only by the project maintainer.",
  "System logs (IP address, device/browser information) for security and fraud prevention",
  "Communications with support (messages, inquiries, and responses)",
];

const informationUse = [
  "Provide and improve employment facilitation services",
  "Communicate updates, job matches, and service announcements",
  "Verify the identity of authorized employer representatives and (optionally) jobseekers to reduce fake accounts and protect applicants",
  "Ensure platform security and integrity",
  "Conduct aggregated analytics to improve service delivery (non-identifiable)",
];

const rights = [
  "Right to be informed",
  "Right to object",
  "Right to access",
  "Right to rectify",
  "Right to erasure or blocking",
  "Right to data portability",
  "Right to damages",
];

const sectionLinks = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "your-rights", label: "Your Rights" },
  { id: "legal-bases", label: "Legal Bases" },
  { id: "retention-security", label: "Retention and Security" },
  { id: "children-privacy", label: "Children's Privacy" },
  { id: "dpo-contact", label: "DPO Contact" },
];

export default function PrivacyPage() {
  return (
    <div
      className="gw"
      style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}
    >
      <SiteHeader />

      {/* Hero */}
      <section
        className="px-4 sm:px-8 lg:px-14 py-12 lg:py-[72px]"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--ink-7)" }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div className="tx-eyebrow">Legal</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Privacy Policy
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)", fontSize: 15 }}>
            TaraCurong is a non-commercial community project created by <strong>John Aerol Tapales</strong>, an IT student, to help jobseekers and employers in Tacurong City. It is not operated by, affiliated with, or endorsed by any government agency or LGU. This Privacy Policy explains how the project collects, uses, and protects your personal information, with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and its IRR as a guiding standard.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 print:hidden">
            <a
              href="https://privacy.gov.ph/data-privacy-act/"
              target="_blank"
              rel="noopener noreferrer"
              className="gw-btn gw-btn--accent"
            >
              Data Privacy Act
              <ArrowUpRight size={16} />
            </a>
            <a
              href="https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/"
              target="_blank"
              rel="noopener noreferrer"
              className="gw-btn gw-btn--ghost"
            >
              Read IRR
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div
            className="gw-card mt-6 grid gap-3 sm:grid-cols-3"
            style={{ padding: 16 }}
          >
            <p className="tx-caption" style={{ color: "var(--ink-3)" }}>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>Policy version:</span> 2.0
            </p>
            <p className="tx-caption" style={{ color: "var(--ink-3)" }}>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>Last updated:</span> April 20, 2026
            </p>
            <p className="tx-caption" style={{ color: "var(--ink-3)" }}>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>Jurisdiction:</span> Philippines (DPA 2012)
            </p>
          </div>
        </div>
      </section>

      {/* Highlight cards */}
      <section className="px-4 sm:px-8 lg:px-14 pt-8 print:hidden">
        <div className="mx-auto grid gap-4 sm:grid-cols-3" style={{ maxWidth: 1080 }}>
          <article className="gw-card" style={{ padding: 24 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--r-2)",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h2 className="tx-h4" style={{ marginTop: 16 }}>Security Commitment</h2>
            <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)" }}>
              We apply controls designed to protect personal data against unauthorized access,
              alteration, and misuse.
            </p>
          </article>
          <article className="gw-card" style={{ padding: 24 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--r-2)",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Scale size={20} />
            </div>
            <h2 className="tx-h4" style={{ marginTop: 16 }}>Lawful Processing</h2>
            <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)" }}>
              Processing is limited to valid legal bases such as user consent, the project&apos;s
              legitimate community-service purpose, and compliance with applicable laws.
            </p>
          </article>
          <article className="gw-card" style={{ padding: 24 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--r-2)",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={20} />
            </div>
            <h2 className="tx-h4" style={{ marginTop: 16 }}>Your Rights First</h2>
            <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)" }}>
              You can request access, correction, and other lawful controls over your personal data.
            </p>
          </article>
        </div>
      </section>

      {/* TOC + content */}
      <section className="px-4 sm:px-8 lg:px-14 py-8">
        <div
          className="mx-auto grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
          style={{ maxWidth: 1080 }}
        >
          <aside className="hidden lg:block print:hidden">
            <div className="gw-card sticky top-24" style={{ padding: 16 }}>
              <h2 className="tx-eyebrow">On this page</h2>
              <PrivacyToc sections={sectionLinks} />
            </div>
          </aside>

          <div className="space-y-6">
            <article id="information-we-collect" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">Information We Collect</h2>
              <ul
                className="tx-body"
                style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
              >
                {infoCollected.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article id="how-we-use-information" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">How We Use Information</h2>
              <ul
                className="tx-body"
                style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
              >
                {informationUse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article id="data-sharing" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">Data Sharing</h2>
              <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
                We may share data with authorized government agencies and partner employers strictly for
                employment facilitation purposes, subject to applicable laws and data protection
                standards. Any sharing is governed by data sharing agreements, confidentiality clauses,
                and safeguards consistent with NPC Circulars and the DPA 2012 IRR. We do not sell
                personal data.
              </p>
              <a
                href="https://privacy.gov.ph/npc-circular-16-01-security-of-personal-data-in-government-agencies/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
                style={{ marginTop: 16, color: "var(--teal)", fontWeight: 600, fontSize: 14 }}
              >
                View NPC Circular Reference
                <ArrowUpRight size={16} style={{ marginLeft: 4 }} />
              </a>
            </article>

            <article id="your-rights" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">
                Your Rights Under the Data Privacy Act
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rights.map((right) => (
                  <div
                    key={right}
                    style={{
                      borderRadius: "var(--r-3)",
                      border: "1px solid var(--ink-7)",
                      background: "var(--surface-2)",
                      padding: "12px 16px",
                    }}
                  >
                    <p className="tx-caption" style={{ fontWeight: 500, color: "var(--ink-2)" }}>{right}</p>
                  </div>
                ))}
              </div>
            </article>

            <article id="legal-bases" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">Legal Bases for Processing</h2>
              <ul
                className="tx-body"
                style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
              >
                <li>Your explicit consent when you create a profile or apply to a job</li>
                <li>Legitimate interest in helping Tacurong-area jobseekers and employers connect</li>
                <li>Compliance with applicable laws and reasonable requests from rights holders</li>
              </ul>
            </article>

            <article id="retention-security" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">Data Retention and Security Measures</h2>
              <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
                We retain personal data only as long as necessary to fulfill policy purposes, legal
                requirements, and dispute resolution. When no longer needed, data is securely deleted or
                anonymized.
              </p>
              <ul
                className="tx-body"
                style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
              >
                <li>Access controls and role-based permissions</li>
                <li>Encryption in transit (HTTPS) and secure storage practices</li>
                <li>Audit logging, secure development lifecycle, and periodic reviews</li>
                <li>
                  <strong>Identity documents</strong> (government IDs and selfies submitted for the
                  Verified badge) are kept in a private storage bucket viewable only by the project
                  maintainer. They are auto-deleted 30 days after account closure, 12 months after a
                  rejected submission, or on written request — whichever comes first.
                </li>
              </ul>
            </article>

            <article id="children-privacy" className="gw-card print:break-inside-avoid" style={{ padding: 28 }}>
              <h2 className="tx-h2">Children&apos;s Privacy</h2>
              <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
                The platform is intended for individuals of legal working age. If data from minors is
                collected without appropriate consent, we will take steps to delete such information.
              </p>
            </article>

            <article
              id="dpo-contact"
              className="gw-card print:break-inside-avoid"
              style={{ padding: 28, background: "var(--teal-4)", borderColor: "var(--teal-3)" }}
            >
              <h2 className="tx-h2">Contact the maintainer</h2>
              <ul
                className="tx-body"
                style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-2)" }}
              >
                <li>
                  Maintainer: <strong>John Aerol Tapales</strong> (IT student, Tacurong City)
                </li>
                <li>
                  Email: <a href="mailto:helpdesk@taracurong.com" style={{ color: "var(--teal)", fontWeight: 600 }}>helpdesk@taracurong.com</a>
                </li>
                <li>Location: Tacurong City, Sultan Kudarat</li>
                <li>
                  NPC support: <a href="https://privacy.gov.ph/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)", fontWeight: 600 }}>privacy.gov.ph</a>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3 print:hidden">
                <Link href="/contact" className="gw-btn gw-btn--accent">
                  Contact Helpdesk
                </Link>
                <Link href="/" className="gw-btn gw-btn--ghost">
                  Back to Home
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
