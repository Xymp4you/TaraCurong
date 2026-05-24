import Link from "next/link";
import { ShieldAlert, Clock, User, Mail } from "lucide-react";

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
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">Help and Support</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">How can we help?</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600">
            Guidance for jobseekers and employers using TaraCurong — a free community job platform
            for Tacurong City.
          </p>
        </div>
      </section>

      {/* Maintainer + SLA */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Maintained by one person</h3>
              <p className="mt-1 text-sm text-slate-600">
                <strong>John Aerol Tapales</strong> — an IT student from Tacurong City — reviews
                listings, replies to email, and ships fixes. Be patient; this is not a 24/7
                helpdesk.
              </p>
            </div>
          </article>
          <article className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Response times</h3>
              <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                <li>• Email replies: 1–3 working days</li>
                <li>• New employer review: 24–48 hours</li>
                <li>• Scam / abuse reports: prioritized within 24 hours</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {helpTopics.map((topic) => (
          <article key={topic.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">{topic.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{topic.detail}</p>
          </article>
        ))}
      </section>

      {/* Report / scam line */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-200 p-2 text-rose-800">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Report a scam, fake job, or harassment
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                If anyone here asks you for money to apply, to &quot;process&quot; an offer, or for ID
                scans / OTPs / bank details outside an interview, that is not a legitimate
                employer. Email{" "}
                <a
                  href="mailto:helpdesk@taracurong.com?subject=%5BREPORT%5D%20TaraCurong"
                  className="font-semibold text-rose-700"
                >
                  helpdesk@taracurong.com
                </a>{" "}
                with subject starting <code className="rounded bg-white px-1 text-xs">[REPORT]</code> and
                include the listing or user. Reports are reviewed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Accessibility statement</h2>
          <p className="mt-2 text-sm text-slate-600">
            TaraCurong aims to be accessible on desktop and mobile. If you experience any
            accessibility barriers, contact the maintainer at{" "}
            <a href="mailto:helpdesk@taracurong.com" className="font-semibold text-blue-700">
              helpdesk@taracurong.com
            </a>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Mail className="mr-1 inline h-4 w-4" /> Contact form
            </Link>
            <Link
              href="/terms"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Read the Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
