"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building, ChevronDown, ExternalLink, MapPin, Search, Shield, User } from "lucide-react";
import { Seal } from "@/components/gw/atoms";
import { BetaBadge } from "@/components/transparency/beta-badge";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  seoKeywords: string;
  heroBackgroundImage: string;
}

interface SummaryMetric {
  value: number;
}
interface SummaryData {
  totalApplicants: SummaryMetric;
  activeEmployers: SummaryMetric;
  successfulReferrals: SummaryMetric;
}

interface LandingCategory {
  name: string;
  category: string;
  jobs: string;
}

const defaultGeneralSettings: GeneralSettings = {
  siteName: "TaraCurong",
  siteDescription: "A community job platform for Tacurong City — built by an IT student",
  seoKeywords: "tacurong jobs, job portal tacurong, taracurong referrals",
  heroBackgroundImage: "",
};

const ensureMetaTag = (name: string, content: string) => {
  if (!content) return;
  const existing = document.querySelector(`meta[name="${name}"]`);
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const tag = document.createElement("meta");
  tag.setAttribute("name", name);
  tag.setAttribute("content", content);
  document.head.appendChild(tag);
};

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const ROLE_ENTRIES = [
  {
    role: "I'm looking for work",
    sub: "Apply to jobs, track applications, receive referral slips.",
    color: "var(--role-jobseeker)",
    bg: "var(--teal-4)",
    icon: <User size={18} />,
    cta: "Create jobseeker profile",
    href: "/signup?role=jobseeker",
  },
  {
    role: "I'm hiring",
    sub: "Post vacancies, review applicants, get AI-matched candidates.",
    color: "var(--role-employer)",
    bg: "var(--violet-bg)",
    icon: <Building size={18} />,
    cta: "Register as employer",
    href: "/signup?role=employer",
  },
  {
    role: "I'm an admin officer",
    sub: "Approve employers, issue referral slips, run reports.",
    color: "var(--role-admin)",
    bg: "var(--rose-bg)",
    icon: <Shield size={18} />,
    cta: "Request admin access",
    href: "/signup/admin-request",
  },
];

const HOW_IT_WORKS = [
  { n: "01", t: "Create your profile", d: "Tell us your skills, education, and work history. Plain forms, no jargon." },
  { n: "02", t: "Find a verified job", d: "Filter by location, salary, work setup. Every employer is verified." },
  { n: "03", t: "Submit your application", d: "One-click apply. See where you stand in the hiring pipeline at all times." },
  { n: "04", t: "Show your referral QR", d: "Get a QR slip on your phone. Show it at the employer's office. Done." },
];

const POPULAR_TAGS = ["Cannery operator", "Bookkeeper", "Customer service", "Driver", "Healthcare aide", "Welder"];

const FOOTER_COLUMNS = [
  { h: "Jobseekers", l: [["Browse jobs", "/jobseeker/jobs"], ["Training programs", "/training"], ["Career guides", "/help"], ["Referral slips", "/jobseeker/referrals"]] },
  { h: "Employers", l: [["Register company", "/signup?role=employer"], ["Post a vacancy", "/employer/dashboard"], ["Compliance docs", "/help"], ["SRS Form 2", "/help"]] },
  { h: "TaraCurong", l: [["About", "/about"], ["Office hours", "/contact"], ["Contact", "/contact"], ["Reports", "/about"]] },
  { h: "Legal", l: [["Privacy", "/privacy"], ["Terms", "/privacy"], ["Data Privacy Act", "/privacy"], ["Accessibility", "/help"]] },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: generalSettingsData } = useQuery<GeneralSettings>({
    queryKey: ["settings", "general", "public"],
    queryFn: async () => {
      const response = await fetch("/api/settings/general/public");
      if (!response.ok) throw new Error("Failed to fetch general settings");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
  const generalSettings = generalSettingsData ?? defaultGeneralSettings;

  const { data: summaryData } = useQuery<SummaryData>({
    queryKey: ["landing", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/summary");
      if (!response.ok) throw new Error("Failed to fetch summary data");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: categoriesData } = useQuery<{ categories: LandingCategory[] }>({
    queryKey: ["landing", "categories"],
    queryFn: async () => {
      const response = await fetch("/api/landing/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
  const categories = categoriesData?.categories ?? [];

  useEffect(() => {
    document.title = `${generalSettings.siteName} — ${generalSettings.siteDescription}`;
    ensureMetaTag("description", generalSettings.siteDescription);
    ensureMetaTag("keywords", generalSettings.seoKeywords);
  }, [generalSettings]);

  const stats = [
    { k: summaryData ? formatNumber(summaryData.totalApplicants.value) : "—", l: "Active jobseekers" },
    { k: summaryData ? formatNumber(summaryData.activeEmployers.value) : "—", l: "Verified employers" },
    { k: summaryData ? formatNumber(summaryData.successfulReferrals.value) : "—", l: "Successful placements" },
  ];

  return (
    <div className="gw" style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}>
      {/* Top utility bar */}
      <div
        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 lg:px-14 overflow-x-auto whitespace-nowrap"
        style={{
          minHeight: 32,
          background: "var(--ink)",
          color: "var(--ink-5)",
          font: "500 11.5px/1 var(--font-ui)",
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--emerald)" }} />
          <span className="hidden sm:inline">TaraCurong · Community job platform · Tacurong City</span>
          <span className="sm:hidden">TaraCurong · Tacurong</span>
        </span>
        <BetaBadge tone="dark" />
        <span style={{ flex: 1 }} />
        <span className="hidden xs:inline">EN</span>
        <span className="hidden sm:inline" style={{ color: "var(--ink-4)" }}>·</span>
        <span className="hidden sm:inline">Tagalog</span>
        <span className="hidden sm:inline" style={{ color: "var(--ink-4)" }}>·</span>
        <span className="hidden sm:inline">Bisaya</span>
      </div>

      {/* Header */}
      <header
        className="flex items-center gap-3 sm:gap-7 px-4 sm:px-8 lg:px-14 py-3 lg:py-0 lg:h-[72px] flex-wrap lg:flex-nowrap"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--ink-7)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
          <Seal size={38} role="teal" />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <div style={{ font: "600 18px/1 var(--font-ui)", letterSpacing: "-0.02em" }}>TaraCurong</div>
            <div className="tx-micro" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Tacurong City
            </div>
          </div>
        </Link>
        <div className="hidden lg:block" style={{ flex: 1 }} />
        <nav
          className="hidden lg:flex"
          style={{ gap: 28, color: "var(--ink-2)", font: "500 13.5px/1 var(--font-ui)" }}
        >
          <Link href="/jobseeker/jobs" style={{ color: "inherit", textDecoration: "none" }}>Find work</Link>
          <Link href="/signup?role=employer" style={{ color: "inherit", textDecoration: "none" }}>For employers</Link>
          <Link href="/training" style={{ color: "inherit", textDecoration: "none" }}>Training</Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
          <Link href="/help" style={{ color: "inherit", textDecoration: "none" }}>Help</Link>
        </nav>
        <div className="flex gap-2 ml-auto lg:ml-0">
          <Link href="/login">
            <button type="button" className="gw-btn gw-btn--ghost">Sign in</button>
          </Link>
          <Link href="/get-started" className="hidden sm:inline-flex">
            <button type="button" className="gw-btn gw-btn--primary">
              Get started <ArrowRight size={14} />
            </button>
          </Link>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border"
          style={{ borderColor: "var(--ink-6)", color: "var(--ink-2)", background: "var(--surface)" }}
        >
          <span aria-hidden style={{ display: "inline-block", width: 16 }}>
            <span style={{ display: "block", height: 2, background: "currentColor", marginBottom: 3, borderRadius: 2 }} />
            <span style={{ display: "block", height: 2, background: "currentColor", marginBottom: 3, borderRadius: 2 }} />
            <span style={{ display: "block", height: 2, background: "currentColor", borderRadius: 2 }} />
          </span>
        </button>
        {mobileNavOpen && (
          <nav
            className="lg:hidden w-full flex flex-col gap-1 mt-2 pt-2"
            style={{
              borderTop: "1px solid var(--ink-7)",
              color: "var(--ink-2)",
              font: "500 14px/1 var(--font-ui)",
            }}
          >
            <Link href="/jobseeker/jobs" className="py-2" style={{ color: "inherit", textDecoration: "none" }}>Find work</Link>
            <Link href="/signup?role=employer" className="py-2" style={{ color: "inherit", textDecoration: "none" }}>For employers</Link>
            <Link href="/training" className="py-2" style={{ color: "inherit", textDecoration: "none" }}>Training</Link>
            <Link href="/about" className="py-2" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
            <Link href="/help" className="py-2" style={{ color: "inherit", textDecoration: "none" }}>Help</Link>
            <Link href="/get-started" className="sm:hidden py-2 mt-1">
              <button type="button" className="gw-btn gw-btn--primary w-full">
                Get started <ArrowRight size={14} />
              </button>
            </Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="grid gap-10 lg:gap-16 px-4 sm:px-8 lg:px-14 pt-10 sm:pt-16 lg:pt-[72px] pb-10 lg:pb-14 lg:grid-cols-[1fr_460px]">
        <div className="min-w-0">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              background: "var(--surface)",
              border: "1px solid var(--ink-7)",
              borderRadius: 999,
              marginBottom: 22,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--teal)" }} />
            <span className="tx-micro" style={{ color: "var(--ink-2)", letterSpacing: "0.04em" }}>
              Verified Tacurong employers · No fees, ever
            </span>
          </div>
          <h1
            className="tx-serif text-[34px] sm:text-[42px] lg:text-[48px]"
            style={{
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            We help <em style={{ fontStyle: "italic", color: "var(--teal)" }}>you</em> find jobs<br className="hidden sm:block" />
            in Tacurong City.
          </h1>
          <p className="tx-body-lg" style={{ marginTop: 22, maxWidth: 540 }}>
            Apply to local employers we&apos;ve checked. Get your referral slip as a QR code on your
            phone — easy to show, no paper to lose.
          </p>

          {/* Inline search */}
          <form
            action="/jobseeker/jobs"
            method="get"
            className="gw-card mt-8 p-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1"
            style={{
              border: "1px solid var(--ink-6)",
              boxShadow: "var(--sh-1)",
            }}
          >
            <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
              <Search size={16} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
              <input
                name="q"
                className="tx-body"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  flex: 1,
                  padding: "10px 0",
                  color: "var(--ink)",
                  width: "100%",
                  minWidth: 0,
                }}
                placeholder="Job title, skill, or company"
              />
            </div>
            <div className="hidden sm:block" style={{ width: 1, height: 22, background: "var(--ink-7)" }} />
            <div className="flex items-center gap-2 px-3 sm:min-w-[180px]">
              <MapPin size={16} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
              <span className="tx-body" style={{ color: "var(--ink-3)" }}>Tacurong City</span>
              <ChevronDown size={14} style={{ color: "var(--ink-4)" }} />
            </div>
            <button type="submit" className="gw-btn gw-btn--accent w-full sm:w-auto" style={{ height: 44 }}>
              Search jobs
            </button>
          </form>

          {/* Popular tags */}
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tx-micro" style={{ color: "var(--ink-3)", alignSelf: "center", marginRight: 4 }}>
              Popular:
            </span>
            {POPULAR_TAGS.map((c) => (
              <Link key={c} href={`/jobseeker/jobs?q=${encodeURIComponent(c)}`} style={{ textDecoration: "none" }}>
                <span className="gw-chip">{c}</span>
              </Link>
            ))}
          </div>

          {/* Stats strip */}
          <div
            className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x"
            style={{
              borderTop: "1px solid var(--ink-7)",
              borderBottom: "1px solid var(--ink-7)",
              borderColor: "var(--ink-7)",
            }}
          >
            {stats.map((s) => (
              <div key={s.l} className="py-5 px-6" style={{ borderColor: "var(--ink-7)" }}>
                <div className="tx-num" style={{ font: "500 30px/1 var(--font-ui)", letterSpacing: "-0.025em" }}>
                  {s.k}
                </div>
                <div className="tx-caption" style={{ marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — three role entry cards */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="tx-eyebrow" style={{ marginBottom: 4 }}>Choose your path</div>
          {ROLE_ENTRIES.map((r) => (
            <Link key={r.role} href={r.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                className="gw-card gw-card--hover"
                style={{ padding: 20, display: "flex", gap: 14, cursor: "pointer", borderLeft: `3px solid ${r.color}` }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: r.bg,
                    color: r.color,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tx-h4">{r.role}</div>
                  <div className="tx-caption" style={{ marginTop: 4 }}>{r.sub}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 10,
                      color: r.color,
                      font: "500 12.5px/1 var(--font-ui)",
                    }}
                  >
                    {r.cta} <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-4 sm:px-8 lg:px-14 py-12 lg:pt-14 lg:pb-[72px]"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--ink-7)",
          borderBottom: "1px solid var(--ink-7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 36 }}>
          <span className="tx-eyebrow">How it works</span>
          <span className="tx-caption">For jobseekers</span>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            gap: 1,
            background: "var(--ink-7)",
            border: "1px solid var(--ink-7)",
            borderRadius: "var(--r-3)",
            overflow: "hidden",
          }}
        >
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.n}
              style={{
                padding: 24,
                background: "var(--surface)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                className="tx-mono"
                style={{
                  font: "500 11px/1 var(--font-mono)",
                  color: "var(--teal)",
                  letterSpacing: "0.1em",
                }}
              >
                {s.n}
              </div>
              <div className="tx-h3" style={{ marginTop: 6 }}>{s.t}</div>
              <div className="tx-caption">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-8 lg:px-14 py-12 lg:py-[72px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <div className="tx-eyebrow">Hiring now</div>
            <h2
              className="tx-h1 text-[26px] sm:text-[32px]"
              style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
            >
              Categories in demand around Tacurong
            </h2>
          </div>
          <Link
            href="/jobseeker/jobs"
            className="tx-body"
            style={{
              color: "var(--teal)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            {categories.length > 0
              ? `Browse all ${categories.length} categories`
              : "Browse all jobs"}{" "}
            <ArrowRight size={14} />
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/jobseeker/jobs?category=${encodeURIComponent(c.name)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="gw-card gw-card--hover" style={{ padding: 18, cursor: "pointer" }}>
                  <div className="tx-h4">{c.name}</div>
                  <div className="tx-num tx-mono tx-micro" style={{ marginTop: 6, color: "var(--teal)" }}>
                    {c.jobs}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="gw-card tx-body"
            style={{ padding: 24, color: "var(--ink-4)", textAlign: "center" }}
          >
            No open roles posted yet — check back soon.
          </div>
        )}
      </section>

      {/* Referral feature strip */}
      <section className="px-4 sm:px-8 lg:px-14 pb-16 lg:pb-20">
        <div
          className="gw-card p-6 sm:p-10 grid gap-8 lg:gap-10 lg:grid-cols-[1fr_280px]"
          style={{
            background: "var(--official-ink)",
            color: "#fff",
            borderColor: "var(--official-ink)",
          }}
        >
          <div>
            <div className="tx-eyebrow" style={{ color: "var(--ink-5)" }}>
              The referral slip — modernized
            </div>
            <h2
              className="tx-serif text-[26px] sm:text-[32px]"
              style={{
                marginTop: 12,
                color: "#fff",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.028em",
              }}
            >
              Paper slips, made portable.<br />
              <span style={{ color: "var(--teal-3)" }}>One QR, one tap, signed.</span>
            </h2>
            <p className="tx-body" style={{ marginTop: 16, color: "var(--ink-5)", maxWidth: 540 }}>
              When TaraCurong refers you to an employer, you get a tamper-evident slip with a QR code. The employer scans
              it at their office and marks the outcome — no faxes, no lost paperwork, no waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              <Link href="/referral/TC-2026-014872">
                <button type="button" className="gw-btn gw-btn--accent w-full sm:w-auto">
                  View a sample slip <ExternalLink size={13} />
                </button>
              </Link>
              <Link href="/help">
                <button
                  type="button"
                  className="gw-btn w-full sm:w-auto"
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  How it works for employers
                </button>
              </Link>
            </div>
          </div>
          <div className="grid place-items-center">
            <div
              style={{
                background: "var(--parchment)",
                padding: 16,
                borderRadius: 10,
                transform: "rotate(-3deg)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              }}
            >
              <div className="gw-qr" style={{ width: 140, height: 140 }}>
                <span className="br" />
              </div>
              <div
                className="tx-mono"
                style={{
                  marginTop: 10,
                  color: "var(--official-ink)",
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                TC-2026-014872
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 sm:px-8 lg:px-14 pt-12 pb-7"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--ink-7)",
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Seal size={36} />
              <div style={{ font: "600 16px/1 var(--font-ui)" }}>TaraCurong</div>
            </div>
            <p className="tx-caption" style={{ marginTop: 14, maxWidth: 360 }}>
              TaraCurong is a free community job platform for Tacurong City, built by an IT student.
              Not a government service.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.h}>
              <div className="tx-eyebrow" style={{ fontSize: 10.5 }}>{col.h}</div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                {col.l.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="tx-body"
                    style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hr" style={{ margin: "36px 0 18px", height: 1, background: "var(--ink-7)" }} />
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2" style={{ color: "var(--ink-4)" }}>
          <span className="tx-micro">© 2026 TaraCurong · A community project by John Aerol Tapales</span>
          <span className="tx-micro tx-mono">v4.2.0 · System status: operational</span>
        </div>
      </footer>
    </div>
  );
}
