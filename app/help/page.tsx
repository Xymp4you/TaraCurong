import Link from "next/link";
import { ShieldAlert, Clock, User, Mail } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

const helpTopics = [
  {
    title: "Account setup",
    detail: "Create your profile, verify your details, and prepare your job preferences.",
  },
  {
    title: "Applications",
    detail: "Track status updates, review interview notes, and keep your resume up to date.",
  },
  {
    title: "Employer onboarding",
    detail: "Submit business documents and publish vacancies. The maintainer reviews each new employer manually before listings go live.",
  },
  {
    title: "Technical support",
    detail: "Report access issues, account errors, or anything broken. One person checks the inbox — expect a reply within 1–3 working days.",
  },
];

export default function HelpPage() {
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
        <div style={{ maxWidth: 760 }}>
          <div className="tx-eyebrow">Help and Support</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            How can we help?
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)", maxWidth: 560 }}>
            Guidance for jobseekers and employers using TaraCurong — a free community job platform
            for Tacurong City.
          </p>
        </div>
      </section>

      {/* Maintainer + SLA */}
      <section className="px-4 sm:px-8 lg:px-14 pt-12">
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="gw-card flex items-start gap-3" style={{ padding: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-2)",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="tx-h4">Maintained by one person</h3>
              <p className="tx-caption" style={{ marginTop: 4, color: "var(--ink-3)" }}>
                <strong>John Aerol Tapales</strong> — an IT student from Tacurong City — reviews
                listings, replies to email, and ships fixes. Be patient; this is not a 24/7
                helpdesk.
              </p>
            </div>
          </article>
          <article className="gw-card flex items-start gap-3" style={{ padding: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-2)",
                background: "var(--amber-bg)",
                color: "var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="tx-h4">Response times</h3>
              <ul className="tx-caption" style={{ marginTop: 4, color: "var(--ink-3)" }}>
                <li>• Email replies: 1–3 working days</li>
                <li>• New employer review: 24–48 hours</li>
                <li>• Scam / abuse reports: prioritized within 24 hours</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      {/* Help topics */}
      <section className="px-4 sm:px-8 lg:px-14 py-12">
        <div className="grid gap-4 lg:grid-cols-2">
          {helpTopics.map((topic) => (
            <article key={topic.title} className="gw-card" style={{ padding: 24 }}>
              <h2 className="tx-h4">{topic.title}</h2>
              <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-3)" }}>
                {topic.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Report / scam line */}
      <section className="px-4 sm:px-8 lg:px-14 pb-4">
        <div
          className="gw-card"
          style={{ padding: 24, background: "var(--rose-bg)", borderColor: "var(--rose)" }}
        >
          <div className="flex items-start gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-2)",
                background: "var(--rose)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="tx-h4">
                Report a scam, fake job, or harassment
              </h2>
              <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-2)" }}>
                If anyone here asks you for money to apply, to &quot;process&quot; an offer, or for ID
                scans / OTPs / bank details outside an interview, that is not a legitimate
                employer. Email{" "}
                <a
                  href="mailto:helpdesk@taracurong.com?subject=%5BREPORT%5D%20TaraCurong"
                  style={{ color: "var(--rose)", fontWeight: 600 }}
                >
                  helpdesk@taracurong.com
                </a>{" "}
                with subject starting{" "}
                <code
                  className="tx-mono"
                  style={{
                    borderRadius: "var(--r-1)",
                    background: "var(--surface)",
                    padding: "1px 4px",
                    fontSize: 12,
                  }}
                >
                  [REPORT]
                </code>{" "}
                and include the listing or user. Reports are reviewed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility statement */}
      <section className="px-4 sm:px-8 lg:px-14 pb-16">
        <div className="gw-card" style={{ padding: 24 }}>
          <h2 className="tx-h4">Accessibility statement</h2>
          <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-3)" }}>
            TaraCurong aims to be accessible on desktop and mobile. If you experience any
            accessibility barriers, contact the maintainer at{" "}
            <a
              href="mailto:helpdesk@taracurong.com"
              style={{ color: "var(--teal)", fontWeight: 600 }}
            >
              helpdesk@taracurong.com
            </a>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" style={{ textDecoration: "none" }}>
              <button type="button" className="gw-btn gw-btn--accent">
                <Mail className="h-4 w-4" /> Contact form
              </button>
            </Link>
            <Link href="/terms" style={{ textDecoration: "none" }}>
              <button type="button" className="gw-btn gw-btn--ghost">
                Read the Terms of Use
              </button>
            </Link>
            <Link href="/privacy" style={{ textDecoration: "none" }}>
              <button type="button" className="gw-btn gw-btn--ghost">
                Privacy Policy
              </button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
