import Link from "next/link";
import { AlertTriangle, ShieldOff, Heart, Mail } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

export const metadata = {
  title: "Terms of Use | TaraCurong",
  description:
    "Terms of Use for TaraCurong — a free community job platform for Tacurong City, built by an IT student. Not a government service.",
};

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Plain-language terms for using TaraCurong, a free community job platform for Tacurong City.
            Last updated 24 May 2026.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="px-4 sm:px-8 lg:px-14 py-12">
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* The big honest disclosure */}
          <article
            className="gw-card"
            style={{ padding: 28, background: "var(--amber-bg)", borderColor: "var(--amber)" }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-2)",
                background: "var(--amber)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h2 className="tx-h4">Please read this first</h2>
            <ul
              className="tx-body"
              style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 12, color: "var(--ink-2)" }}
            >
              <li>
                <strong>TaraCurong is not a government service.</strong> It is a free, non-commercial
                community project created by <strong>John Aerol Tapales</strong>, an IT student. It is
                not operated by, affiliated with, or endorsed by the City Government of Tacurong, DOLE,
                PESO, PSA, or any other agency.
              </li>
              <li>
                <strong>It is provided &quot;as is&quot;, with no warranties.</strong> Uptime, data accuracy,
                matching quality, and feature availability are best-effort by a single maintainer.
              </li>
              <li>
                <strong>Posting a job here does not satisfy any DOLE, PESO, SRS, or PhilJobNet
                reporting requirement.</strong> Employers remain responsible for their own
                compliance.
              </li>
            </ul>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">1. What TaraCurong does</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              TaraCurong helps jobseekers in Tacurong City find local employers, and helps local
              employers receive applications. It includes an optional QR-coded referral slip used as
              an informal endorsement — not as a government-issued document.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">2. Who can use it</h2>
            <ul
              className="tx-body"
              style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
            >
              <li>You must be of legal working age in the Philippines (15+, with conditions).</li>
              <li>You must provide truthful information on your profile, applications, and postings.</li>
              <li>One account per real person (for jobseekers) or per real establishment (for employers).</li>
            </ul>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">3. What you may not do</h2>
            <ul
              className="tx-body"
              style={{ marginTop: 16, paddingLeft: 24, listStyleType: "disc", display: "flex", flexDirection: "column", gap: 8, color: "var(--ink-3)" }}
            >
              <li>
                Charge applicants any fee. This includes &quot;training fees&quot;, &quot;uniform deposits&quot;,
                &quot;processing fees&quot;, or recruiter charges of any kind. Anyone doing this will be
                removed without notice.
              </li>
              <li>
                Post jobs that don&apos;t exist, are misleading about salary or location, or are fronts for
                MLM, scams, or human trafficking.
              </li>
              <li>
                Discriminate on the basis of religion, ethnicity, disability, gender, age, or civil
                status beyond what Philippine labor law actually allows.
              </li>
              <li>
                Use the platform to harass, threaten, or contact people outside of the job application
                context.
              </li>
              <li>
                Scrape, automate, or stress the platform. It runs on hobby-tier infrastructure.
              </li>
            </ul>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">4. How verification works</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              When this site calls an employer &quot;verified&quot;, it means the maintainer manually reviewed
              the establishment&apos;s submitted documents and decided they looked legitimate. It does{" "}
              <strong>not</strong> mean we performed a government background check, validated SEC/DTI
              registration with the agency itself, or guarantee the employer&apos;s conduct. Use your own
              judgment, especially before sharing sensitive documents or accepting offers.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">5. AI-assisted features</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              &quot;Top matches&quot; and similar features are generated by software (sometimes using a large
              language model) based on your profile and the job&apos;s requirements. The scores are
              estimates, not decisions. A high score is not a job offer, and a low score is not
              rejection. Employers make the actual hiring decision.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">6. Limits of liability</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              To the maximum extent allowed by Philippine law, the maintainer is not liable for: lost
              wages, missed opportunities, employer misconduct, applicant misrepresentation, data
              loss, downtime, or any indirect or consequential damages arising from using or relying
              on TaraCurong. You use the platform at your own risk.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">7. Account termination</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              You can close your account anytime from <Link href="/jobseeker/settings" style={{ color: "var(--teal)", fontWeight: 600 }}>jobseeker settings</Link>{" "}
              or <Link href="/employer/settings" style={{ color: "var(--teal)", fontWeight: 600 }}>employer settings</Link>. The
              maintainer may remove accounts or postings that violate these terms, at their sole
              discretion, usually after a warning.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">8. Privacy</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              How data is collected and used is covered in the{" "}
              <Link href="/privacy" style={{ color: "var(--teal)", fontWeight: 600 }}>Privacy Policy</Link>. In
              short: only the maintainer and the employers you actively apply to see your application
              data. Nothing is sold to advertisers.
            </p>
          </article>

          <article className="gw-card" style={{ padding: 28 }}>
            <h2 className="tx-h2">9. Changes to these terms</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              Material changes will be announced on the homepage and emailed to active users at least
              7 days before taking effect.
            </p>
          </article>

          {/* Contact */}
          <article
            className="gw-card"
            style={{ padding: 28, background: "var(--teal-4)", borderColor: "var(--teal-3)" }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-2)",
                background: "var(--teal)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Mail size={20} />
            </div>
            <h2 className="tx-h4">Questions or concerns?</h2>
            <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-2)" }}>
              Reach the maintainer at{" "}
              <a href="mailto:helpdesk@taracurong.com" style={{ color: "var(--teal)", fontWeight: 600 }}>
                helpdesk@taracurong.com
              </a>
              . Replies usually within 3 working days. To report a scam, misleading job post, or
              harassment, please use the same address with subject line starting{" "}
              <span className="tx-mono">[REPORT]</span>.
            </p>
          </article>

          <div
            className="tx-caption"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 16, color: "var(--ink-4)" }}
          >
            <ShieldOff size={14} />
            <span>Not a government service</span>
            <span>·</span>
            <Heart size={14} />
            <span>Built for Tacurong City</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
