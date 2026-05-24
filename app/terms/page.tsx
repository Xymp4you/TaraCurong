import Link from "next/link";
import { AlertTriangle, ShieldOff, Heart, Mail } from "lucide-react";

export const metadata = {
  title: "Terms of Use | TaraCurong",
  description:
    "Terms of Use for TaraCurong — a free community job platform for Tacurong City, built by an IT student. Not a government service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Plain-language terms for using TaraCurong, a free community job platform for Tacurong City.
            Last updated 24 May 2026.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* The big honest disclosure */}
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Please read this first</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
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

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">1. What TaraCurong does</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            TaraCurong helps jobseekers in Tacurong City find local employers, and helps local
            employers receive applications. It includes an optional QR-coded referral slip used as
            an informal endorsement — not as a government-issued document.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">2. Who can use it</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-700 sm:text-base">
            <li>You must be of legal working age in the Philippines (15+, with conditions).</li>
            <li>You must provide truthful information on your profile, applications, and postings.</li>
            <li>One account per real person (for jobseekers) or per real establishment (for employers).</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">3. What you may not do</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-slate-700 sm:text-base">
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

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">4. How verification works</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            When this site calls an employer &quot;verified&quot;, it means the maintainer manually reviewed
            the establishment&apos;s submitted documents and decided they looked legitimate. It does{" "}
            <strong>not</strong> mean we performed a government background check, validated SEC/DTI
            registration with the agency itself, or guarantee the employer&apos;s conduct. Use your own
            judgment, especially before sharing sensitive documents or accepting offers.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">5. AI-assisted features</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            &quot;Top matches&quot; and similar features are generated by software (sometimes using a large
            language model) based on your profile and the job&apos;s requirements. The scores are
            estimates, not decisions. A high score is not a job offer, and a low score is not
            rejection. Employers make the actual hiring decision.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">6. Limits of liability</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            To the maximum extent allowed by Philippine law, the maintainer is not liable for: lost
            wages, missed opportunities, employer misconduct, applicant misrepresentation, data
            loss, downtime, or any indirect or consequential damages arising from using or relying
            on TaraCurong. You use the platform at your own risk.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">7. Account termination</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            You can close your account anytime from <Link href="/jobseeker/settings" className="text-blue-700 hover:underline">jobseeker settings</Link>{" "}
            or <Link href="/employer/settings" className="text-blue-700 hover:underline">employer settings</Link>. The
            maintainer may remove accounts or postings that violate these terms, at their sole
            discretion, usually after a warning.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">8. Privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            How data is collected and used is covered in the{" "}
            <Link href="/privacy" className="text-blue-700 hover:underline">Privacy Policy</Link>. In
            short: only the maintainer and the employers you actively apply to see your application
            data. Nothing is sold to advertisers.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">9. Changes to these terms</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            Material changes will be announced on the homepage and emailed to active users at least
            7 days before taking effect.
          </p>
        </article>

        {/* Contact */}
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-200 text-blue-800">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Questions or concerns?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            Reach the maintainer at{" "}
            <a href="mailto:helpdesk@taracurong.com" className="font-semibold text-blue-700">
              helpdesk@taracurong.com
            </a>
            . Replies usually within 3 working days. To report a scam, misleading job post, or
            harassment, please use the same address with subject line starting{" "}
            <span className="font-mono">[REPORT]</span>.
          </p>
        </article>

        <div className="flex items-center justify-center gap-3 pt-4 text-xs text-slate-500">
          <ShieldOff className="h-3.5 w-3.5" />
          <span>Not a government service</span>
          <span>·</span>
          <Heart className="h-3.5 w-3.5" />
          <span>Built for Tacurong City</span>
        </div>
      </section>
    </main>
  );
}
