import Link from "next/link";
import { Building2, Briefcase, ShieldCheck, Users, Target, BookOpen, Lightbulb, TrendingUp } from "lucide-react";

export const metadata = {
  title: "About TaraCurong",
  description: "Learn more about TaraCurong, the job assistance platform of Tacurong City.",
};

const coreServices = [
  {
    title: "Job Matching and Referral",
    description: "We connect qualified jobseekers directly to employers needing their specific skill sets.",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Career Guidance",
    description: "Professional coaching and employment guidance to help shape your career path.",
    icon: Lightbulb,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Labor Market Information",
    description: "Up-to-date resources and data dissemination on the latest employment trends and opportunities.",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Local Recruitment & Fairs",
    description: "Organized job fairs and recruitment activities that bring local opportunities closer to you.",
    icon: Users,
    color: "bg-orange-100 text-orange-700",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
              About TaraCurong
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
              A community job platform, built for Tacurong City
            </h1>
            <p className="text-lg leading-8 text-slate-600 mb-8">
              TaraCurong is a free, non-commercial community project created by <strong>John Aerol Tapales</strong>, an IT student from Tacurong City. It is not a government service and is not affiliated with any LGU or national agency. The goal is simple: help local jobseekers and employers find each other more easily.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Browse Opportunities
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mandate & Mission Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Why this project exists
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our goal is to connect Tacurong City jobseekers with decent work opportunities and to make hiring easier for local employers. TaraCurong is built and maintained by a single IT student as a community contribution — there are no fees, no ads, and no government affiliation.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">What you should know</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start">
                <ShieldCheck className="h-6 w-6 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <span className="text-slate-600"><strong className="text-slate-900">Student-built, not official:</strong> A learning + community project. Not a government program; not partnered with any LGU or agency.</span>
              </li>
              <li className="flex items-start">
                <Building2 className="h-6 w-6 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <span className="text-slate-600"><strong className="text-slate-900">Local employers welcome:</strong> Tacurong-area employers can post vacancies for free; the maintainer manually reviews listings.</span>
              </li>
              <li className="flex items-start">
                <TrendingUp className="h-6 w-6 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <span className="text-slate-600"><strong className="text-slate-900">Free for the community:</strong> No fees for jobseekers or employers — the project exists to help, not to earn.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Core Services</h2>
          <p className="mt-4 text-lg text-slate-600">
            Comprehensive employment assistance designed to support both individuals and local businesses.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreServices.map((service) => (
            <article key={service.title} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.color}`}>
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
