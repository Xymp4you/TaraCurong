import Link from "next/link";
import { GraduationCap, Wrench, Briefcase, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

const programs = [
  {
    title: "Resume and interview bootcamp",
    detail: "Practical job readiness sessions for first-time applicants.",
    icon: Briefcase,
  },
  {
    title: "Digital and office skills track",
    detail: "Upskilling path for admin, support, and tech-adjacent roles.",
    icon: GraduationCap,
  },
  {
    title: "Technical trades workshop",
    detail: "Hands-on preparation aligned with local industry hiring demand.",
    icon: Wrench,
  },
];

export default function TrainingPage() {
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
          <div className="tx-eyebrow">Training</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Career Training Programs
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Curated programs that help jobseekers build in-demand capabilities.
          </p>
        </div>
      </section>

      {/* Programs */}
      <section className="px-4 sm:px-8 lg:px-14 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <div key={program.title} className="gw-card" style={{ padding: 24 }}>
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
                  <Icon size={20} />
                </div>
                <div className="tx-h4" style={{ marginTop: 16 }}>{program.title}</div>
                <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)" }}>
                  {program.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Join CTA */}
      <section className="px-4 sm:px-8 lg:px-14 pb-16">
        <div className="gw-card" style={{ padding: 28 }}>
          <div className="tx-h4">Join as a jobseeker</div>
          <p className="tx-body" style={{ marginTop: 8, color: "var(--ink-3)", maxWidth: 520 }}>
            Create your account and start receiving recommendations for training and vacancies.
          </p>
          <Link href="/signup?role=jobseeker" style={{ display: "inline-block", marginTop: 20 }}>
            <button type="button" className="gw-btn gw-btn--accent">
              Create Jobseeker Account <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
