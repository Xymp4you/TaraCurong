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

const CATEGORIES = [
  { t: "Food processing", c: "284 jobs", h: "Dole, Alsons Aquaculture, Marigold" },
  { t: "Healthcare", c: "112 jobs", h: "Howard Hubbard, Tacurong Doctors" },
  { t: "Customer support", c: "97 jobs", h: "Sykes, Concentrix" },
  { t: "Trades & construction", c: "146 jobs", h: "Megaworld, AMA Resorts" },
  { t: "Logistics & driving", c: "73 jobs", h: "Cebu Pacific Cargo, Toll" },
  { t: "Accounting & finance", c: "44 jobs", h: "BDO, RCBC, local firms" },
  { t: "Education", c: "38 jobs", h: "DepEd, MSU, Notre Dame" },
  { t: "Hospitality", c: "59 jobs", h: "Greenleaf, KCC, Family Country" },
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

  useEffect(() => {
    document.title = `${generalSettings.siteName} — ${generalSettings.siteDescription}`;
    ensureMetaTag("description", generalSettings.siteDescription);
    ensureMetaTag("keywords", generalSettings.seoKeywords);
  }, [generalSettings]);

  const stats = [
    { k: summaryData ? formatNumber(summaryData.totalApplicants.value) : "12,840", l: "Active jobseekers" },
    { k: summaryData ? formatNumber(summaryData.activeEmployers.value) : "486", l: "Verified employers" },
    { k: summaryData ? formatNumber(summaryData.successfulReferrals.value) : "3,217", l: "Successful placements" },
  ];

  return (
    <div className="gw" style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}>
      {/* Top utility bar */}
      <div
        style={{
          height: 32,
          background: "var(--ink)",
          color: "var(--ink-5)",
          display: "flex",
          alignItems: "center",
          padding: "0 56px",
          gap: 16,
          font: "500 11.5px/1 var(--font-ui)",
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--emerald)" }} />
          TaraCurong · Community job platform · Tacurong City
        </span>
        <BetaBadge tone="dark" />
        <span style={{ flex: 1 }} />
        <span>EN</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span>Tagalog</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span>Bisaya</span>
      </div>

      {/* Header */}
      <header
        style={{
          height: 72,
          padding: "0 56px",
          display: "flex",
          alignItems: "center",
          gap: 28,
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
        <div style={{ flex: 1 }} />
        <nav style={{ display: "flex", gap: 28, color: "var(--ink-2)", font: "500 13.5px/1 var(--font-ui)" }}>
          <Link href="/jobseeker/jobs" style={{ color: "inherit", textDecoration: "none" }}>Find work</Link>
          <Link href="/signup?role=employer" style={{ color: "inherit", textDecoration: "none" }}>For employers</Link>
          <Link href="/training" style={{ color: "inherit", textDecoration: "none" }}>Training</Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
          <Link href="/help" style={{ color: "inherit", textDecoration: "none" }}>Help</Link>
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login">
            <button type="button" className="gw-btn gw-btn--ghost">Sign in</button>
          </Link>
          <Link href="/get-started">
            <button type="button" className="gw-btn gw-btn--primary">
              Get started <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "72px 56px 56px", display: "grid", gridTemplateColumns: "1fr 460px", gap: 64 }}>
        <div>
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
            className="tx-serif"
            style={{
              margin: 0,
              fontWeight: 400,
              fontSize: 48,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            Real work, found <em style={{ fontStyle: "italic", color: "var(--teal)" }}>quietly</em>,<br />
            in Tacurong City.
          </h1>
          <p className="tx-body-lg" style={{ marginTop: 22, maxWidth: 540 }}>
            The official TaraCurong platform that connects jobseekers with verified employers — and turns the paper
            referral slip into a QR code your phone already knows how to show.
          </p>

          {/* Inline search */}
          <form
            action="/jobseeker/jobs"
            method="get"
            className="gw-card"
            style={{
              marginTop: 32,
              padding: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--ink-6)",
              boxShadow: "var(--sh-1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", flex: 1 }}>
              <Search size={16} style={{ color: "var(--ink-4)" }} />
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
                }}
                placeholder="Job title, skill, or company"
              />
            </div>
            <div style={{ width: 1, height: 22, background: "var(--ink-7)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", minWidth: 200 }}>
              <MapPin size={16} style={{ color: "var(--ink-4)" }} />
              <span className="tx-body" style={{ color: "var(--ink-3)" }}>Tacurong City</span>
              <ChevronDown size={14} style={{ color: "var(--ink-4)" }} />
            </div>
            <button type="submit" className="gw-btn gw-btn--accent" style={{ height: 44 }}>
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
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              borderTop: "1px solid var(--ink-7)",
              borderBottom: "1px solid var(--ink-7)",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.l}
                style={{
                  padding: "22px 24px",
                  borderRight: i < 2 ? "1px solid var(--ink-7)" : "none",
                }}
              >
                <div className="tx-num" style={{ font: "500 30px/1 var(--font-ui)", letterSpacing: "-0.025em" }}>
                  {s.k}
                </div>
                <div className="tx-caption" style={{ marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — three role entry cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        style={{
          padding: "56px 56px 72px",
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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
      <section style={{ padding: "72px 56px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div className="tx-eyebrow">Hiring now</div>
            <h2
              className="tx-h1"
              style={{ marginTop: 8, fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
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
            Browse all 24 categories <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {CATEGORIES.map((c) => (
            <Link
              key={c.t}
              href={`/jobseeker/jobs?category=${encodeURIComponent(c.t)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="gw-card gw-card--hover" style={{ padding: 18, cursor: "pointer" }}>
                <div className="tx-h4">{c.t}</div>
                <div className="tx-num tx-mono tx-micro" style={{ marginTop: 6, color: "var(--teal)" }}>
                  {c.c}
                </div>
                <div className="tx-caption" style={{ marginTop: 10, color: "var(--ink-4)" }}>{c.h}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Referral feature strip */}
      <section style={{ padding: "0 56px 80px" }}>
        <div
          className="gw-card"
          style={{
            padding: 40,
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 40,
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
              className="tx-serif"
              style={{
                marginTop: 12,
                color: "#fff",
                fontWeight: 400,
                fontSize: 32,
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
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <Link href="/referral/TC-2026-014872">
                <button type="button" className="gw-btn gw-btn--accent">
                  View a sample slip <ExternalLink size={13} />
                </button>
              </Link>
              <Link href="/help">
                <button
                  type="button"
                  className="gw-btn"
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
          <div style={{ display: "grid", placeItems: "center" }}>
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
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--ink-7)",
          padding: "48px 56px 28px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Seal size={36} />
              <div style={{ font: "600 16px/1 var(--font-ui)" }}>TaraCurong</div>
            </div>
            <p className="tx-caption" style={{ marginTop: 14, maxWidth: 280 }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-4)" }}>
          <span className="tx-micro">© 2026 TaraCurong · A community project by John Aerol Tapales</span>
          <span className="tx-micro tx-mono">v4.2.0 · System status: operational</span>
        </div>
      </footer>
    </div>
  );
}
