import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";

const ROLES = [
  {
    id: "jobseeker" as const,
    label: "Jobseeker",
    description:
      "Find verified jobs, track your applications, and build your career around Tacurong.",
    icon: BriefcaseBusiness,
    href: "/login?role=jobseeker",
    color: "var(--role-jobseeker)",
    tint: "var(--role-jobseeker-100)",
  },
  {
    id: "employer" as const,
    label: "Employer",
    description:
      "Post vacancies, review applicants, and hire qualified talent through TaraCurong.",
    icon: Building2,
    href: "/login?role=employer",
    color: "var(--role-employer)",
    tint: "var(--role-employer-100)",
  },
];

export default function GetStartedPage() {
  return (
    <div
      className="gw"
      style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}
    >
      <SiteHeader />

      {/* Main */}
      <main className="px-4 sm:px-8 lg:px-14 py-12 lg:py-[72px]">
        <div className="mx-auto text-center" style={{ maxWidth: 640 }}>
          <div className="tx-eyebrow">Get started</div>
          <h1
            className="tx-h1 text-[28px] sm:text-[34px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Choose how you&apos;ll use TaraCurong
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Whether you&apos;re looking for work or hiring, pick your role to begin.
          </p>
        </div>

        <div className="mx-auto mt-10 grid gap-4 sm:grid-cols-2" style={{ maxWidth: 760 }}>
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Link key={role.id} href={role.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  className="gw-card gw-card--hover h-full flex flex-col items-center text-center"
                  style={{ padding: 28, cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      background: role.tint,
                      color: role.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <div className="tx-h4" style={{ marginTop: 16 }}>{role.label}</div>
                  <p className="tx-caption" style={{ marginTop: 8, color: "var(--ink-4)", maxWidth: 280 }}>
                    {role.description}
                  </p>
                  <span
                    className="gw-btn"
                    style={{ marginTop: 20, background: role.color, color: "#fff" }}
                  >
                    Sign in as {role.label} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="tx-body text-center" style={{ marginTop: 32, color: "var(--ink-3)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
