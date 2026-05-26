import Link from "next/link";
import { Building2, Briefcase, ShieldCheck, Users, Target, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

export const metadata = {
  title: "About TaraCurong",
  description: "Learn more about TaraCurong, the job assistance platform of Tacurong City.",
};

const coreServices = [
  {
    title: "Job Matching and Referral",
    description: "We connect qualified jobseekers directly to employers needing their specific skill sets.",
    icon: Briefcase,
    tint: "var(--teal-4)",
    color: "var(--teal)",
  },
  {
    title: "Career Guidance",
    description: "Professional coaching and employment guidance to help shape your career path.",
    icon: Lightbulb,
    tint: "var(--emerald-100)",
    color: "var(--emerald-600)",
  },
  {
    title: "Labor Market Information",
    description: "Up-to-date resources and data dissemination on the latest employment trends and opportunities.",
    icon: BookOpen,
    tint: "var(--violet-100)",
    color: "var(--violet-600)",
  },
  {
    title: "Local Recruitment & Fairs",
    description: "Organized job fairs and recruitment activities that bring local opportunities closer to you.",
    icon: Users,
    tint: "var(--amber-100)",
    color: "var(--amber-600)",
  },
];

const knowItems = [
  {
    icon: ShieldCheck,
    strong: "Student-built, not official:",
    text: " A learning + community project. Not a government program; not partnered with any LGU or agency.",
  },
  {
    icon: Building2,
    strong: "Local employers welcome:",
    text: " Tacurong-area employers can post vacancies for free; the maintainer manually reviews listings.",
  },
  {
    icon: TrendingUp,
    strong: "Free for the community:",
    text: " No fees for jobseekers or employers — the project exists to help, not to earn.",
  },
];

export default function AboutPage() {
  return (
    <div
      className="gw"
      style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}
    >
      <SiteHeader />

      {/* Hero Section */}
      <section
        className="px-4 sm:px-8 lg:px-14 py-12 lg:py-[72px]"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--ink-7)" }}
      >
        <div style={{ maxWidth: 760 }}>
          <div className="tx-eyebrow">About TaraCurong</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            A community job platform, built for Tacurong City
          </h1>
          <p className="tx-body-lg" style={{ marginTop: 14, color: "var(--ink-3)" }}>
            TaraCurong is a free, non-commercial community project created by <strong style={{ color: "var(--ink)" }}>John Aerol Tapales</strong>, an IT student from Tacurong City. It is not a government service and is not affiliated with any LGU or national agency. The goal is simple: help local jobseekers and employers find each other more easily.
          </p>
          <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
            <Link href="/jobs" style={{ textDecoration: "none" }}>
              <button type="button" className="gw-btn gw-btn--accent">
                Browse Opportunities
              </button>
            </Link>
            <Link href="/contact" style={{ textDecoration: "none" }}>
              <button type="button" className="gw-btn gw-btn--ghost">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mandate & Mission Section */}
      <section className="px-4 sm:px-8 lg:px-14 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--r-3)",
                background: "var(--teal)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={22} />
            </div>
            <h2 className="tx-h2" style={{ marginTop: 20 }}>
              Why this project exists
            </h2>
            <p className="tx-body-lg" style={{ marginTop: 12, color: "var(--ink-3)" }}>
              Our goal is to connect Tacurong City jobseekers with decent work opportunities and to make hiring easier for local employers. TaraCurong is built and maintained by a single IT student as a community contribution — there are no fees, no ads, and no government affiliation.
            </p>
          </div>
          <div className="gw-card" style={{ padding: 28 }}>
            <h3 className="tx-h4">What you should know</h3>
            <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {knowItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.strong} style={{ display: "flex", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--teal)", marginTop: 2, marginRight: 12, flexShrink: 0, display: "inline-flex" }}>
                      <Icon size={20} />
                    </span>
                    <span className="tx-body" style={{ color: "var(--ink-3)" }}>
                      <strong style={{ color: "var(--ink)" }}>{item.strong}</strong>{item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="px-4 sm:px-8 lg:px-14 pb-16">
        <div className="text-center mx-auto" style={{ maxWidth: 560, marginBottom: 40 }}>
          <h2 className="tx-h2">Core Services</h2>
          <p className="tx-body-lg" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Comprehensive employment assistance designed to support both individuals and local businesses.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreServices.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="gw-card gw-card--hover" style={{ padding: 24 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--r-2)",
                    background: service.tint,
                    color: service.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="tx-h4" style={{ marginTop: 16 }}>{service.title}</h3>
                <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)" }}>{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
