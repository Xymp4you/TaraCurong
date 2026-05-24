"use client";

import React, { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Shield, Zap, Globe, ArrowRight, TrendingUp } from "lucide-react";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCTA: string;
  secondaryCTA: string;
  aboutTitle: string;
  aboutBody: string;
  heroBackgroundImage: string;
  seoKeywords: string;
}

interface HeroSectionProps {
  generalSettings: GeneralSettings;
  isLoading: boolean;
  animatedJobseekers: number;
  animatedEmployers: number;
  animatedMatches: number;
  activeHeroBadge: { title: string; description: string };
  impactLoading?: boolean;
  impactData?: {
    avgTimeToInterview: string;
    avgSalary: string;
    satisfactionRate: string;
    yearsOfService: number;
  };
  summaryData?: any;
}

export function HeroSection({
  generalSettings,
  isLoading,
  animatedMatches,
  activeHeroBadge,
  impactLoading,
  impactData,
  summaryData,
}: HeroSectionProps) {
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [activeHighlight, setActiveHighlight] = useState(0);

  const highlights = [
    {
      title: `${impactData?.avgTimeToInterview || "48h"} Interview Rate`,
      detail: "Candidates hear back within two days",
      icon: Clock,
      iconBg: "var(--teal-100)",
      iconFg: "var(--teal-700)",
    },
    {
      title: "100% Verified",
      detail: "No fake job posts or ghost employers",
      icon: Shield,
      iconBg: "var(--emerald-100)",
      iconFg: "var(--emerald-600)",
    },
    {
      title: "AI + Human",
      detail: "Hybrid review ensures better matches",
      icon: Zap,
      iconBg: "var(--amber-100)",
      iconFg: "var(--amber-600)",
    },
    {
      title: `${impactData?.yearsOfService || 25}+ Years Service`,
      detail: "Nationwide jobs curated for Tacurong",
      icon: Globe,
      iconBg: "var(--violet-100)",
      iconFg: "var(--violet-600)",
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveHighlight((p) => (p + 1) % highlights.length), 7000);
    return () => clearInterval(t);
  }, [highlights.length]);

  const handleHeroMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    setHeroTilt({
      x: (offsetX / rect.width) * 6,
      y: -(offsetY / rect.height) * 6,
    });
  };
  const resetTilt = () => setHeroTilt({ x: 0, y: 0 });

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <section
      className="gw-app relative w-full overflow-hidden"
      style={{ background: "var(--gw-bg)" }}
    >
      {/* Subtle ambient teal/parchment glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-16 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(14,124,123,0.10), transparent 70%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute -bottom-28 -left-20 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(246,241,230,0.7), transparent 70%)", filter: "blur(40px)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ border: "1px solid var(--line)", color: "var(--ink-700)" }}
            >
              <span style={{ color: "var(--teal-700)" }}>
                ●
              </span>
              {generalSettings.siteName} · {activeHeroBadge?.title || "Smart Matching"}
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-[1.05] tracking-tight"
              style={{ color: "var(--ink-900)", letterSpacing: "-0.025em" }}
            >
              {generalSettings.heroHeadline}
            </h1>

            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--ink-600)" }}>
              {generalSettings.heroSubheadline}
            </p>

            {/* Highlight grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {highlights.map((h, index) => (
                <div
                  key={h.title}
                  onMouseEnter={() => setActiveHighlight(index)}
                  className="rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all duration-200 bg-white"
                  style={{
                    border: "1px solid var(--line)",
                    boxShadow: index === activeHighlight ? "var(--sh-2)" : "var(--sh-1)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: h.iconBg, color: h.iconFg }}
                  >
                    <h.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px]" style={{ color: "var(--ink-900)" }}>
                      {h.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-500)" }}>
                      {h.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/jobseeker/jobs"
                className="gw-btn gw-btn-teal gw-btn-lg"
                style={{ justifyContent: "center" }}
              >
                {generalSettings.primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup?role=employer"
                className="gw-btn gw-btn-ghost gw-btn-lg"
                style={{ justifyContent: "center" }}
              >
                {generalSettings.secondaryCTA}
              </Link>
            </div>
          </div>

          {/* Right — stat cards with tilt */}
          <div
            className="relative hidden lg:block"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={resetTilt}
          >
            <div
              className="relative bg-white overflow-hidden"
              style={{
                borderRadius: 28,
                border: "1px solid var(--line)",
                boxShadow: "var(--sh-3)",
                padding: 28,
                transform: `rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)`,
                transition: "transform 0.12s ease-out",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(212,236,234,0.35), transparent 60%, rgba(246,241,230,0.4))" }}
              />
              <div className="relative space-y-4">
                {/* Live matches */}
                <div className="rounded-xl p-4 bg-white" style={{ border: "1px solid var(--line)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--ink-900)" }}>
                      Live matches
                    </p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                      style={{ color: "var(--emerald-600)", background: "var(--emerald-100)" }}
                    >
                      Realtime
                    </span>
                  </div>
                  <div className="text-3xl font-semibold tracking-tight" style={{ color: "var(--ink-900)" }}>
                    {isLoading ? <Skeleton className="h-8 w-24" /> : formatNumber(Math.max(animatedMatches, 0))}
                  </div>
                  <p className="text-xs" style={{ color: "var(--ink-500)" }}>
                    Successful placements tracked
                  </p>
                  <div className="mt-3 flex items-center">
                    <div className="flex -space-x-2">
                      {["AL", "JM", "KR"].map((initials) => (
                        <div
                          key={initials}
                          className="w-8 h-8 rounded-full text-[11px] font-semibold flex items-center justify-center"
                          style={{ background: "var(--teal-100)", color: "var(--teal-700)", border: "2px solid white" }}
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs ml-3" style={{ color: "var(--ink-500)" }}>
                      New hires this week
                    </span>
                  </div>
                </div>

                {/* Satisfaction + salary */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4 text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--ink-900), var(--ink-700))",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] opacity-80 font-semibold">Satisfaction</p>
                    <div className="text-2xl font-semibold mt-1 tracking-tight">
                      {impactLoading ? (
                        <Skeleton className="h-7 w-16 bg-white/20" />
                      ) : (
                        impactData?.satisfactionRate || "94%"
                      )}
                    </div>
                    <p className="text-[11px] opacity-75 mt-0.5">Across all portals</p>
                  </div>
                  <div className="rounded-xl p-4 bg-white" style={{ border: "1px solid var(--line)" }}>
                    <p className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: "var(--ink-500)" }}>
                      Avg salary
                    </p>
                    <div className="text-2xl font-semibold mt-1 tracking-tight" style={{ color: "var(--ink-900)" }}>
                      {impactLoading ? <Skeleton className="h-7 w-16" /> : impactData?.avgSalary || "₱32.5K"}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-500)" }}>
                      Starting offers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating: total jobs */}
            <div className="absolute -left-10 top-12">
              <div
                className="rounded-xl p-3 w-48 bg-white"
                style={{ border: "1px solid var(--line)", boxShadow: "var(--sh-2)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-1" style={{ color: "var(--ink-500)" }}>
                  Total active jobs
                </p>
                <p className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--ink-900)" }}>
                  {isLoading ? "…" : (summaryData as any)?.activeJobs?.value || "450+"} positions
                </p>
                <p className="text-[11px]" style={{ color: "var(--ink-500)" }}>
                  Live on platform
                </p>
              </div>
            </div>

            {/* Floating: new this month */}
            <div className="absolute -right-8 -bottom-6">
              <div
                className="rounded-xl p-3 w-44 bg-white"
                style={{ border: "1px solid var(--line)", boxShadow: "var(--sh-2)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-1" style={{ color: "var(--ink-500)" }}>
                  New this month
                </p>
                <p className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--ink-900)" }}>
                  {isLoading ? "…" : (summaryData as any)?.jobseekersThisMonth || "120+"} jobseekers
                </p>
                <div
                  className="mt-2 flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: "var(--emerald-600)" }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />+{(summaryData as any)?.totalApplicants?.growth || 0}% growth
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
