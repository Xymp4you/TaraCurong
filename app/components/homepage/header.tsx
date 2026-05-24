"use client";

import React from "react";
import Link from "next/link";

interface GeneralSettings {
  siteName: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCTA: string;
  secondaryCTA: string;
  aboutTitle: string;
  aboutBody: string;
}

const defaultSettings: GeneralSettings = {
  siteName: "TaraCurong",
  heroHeadline: "Connecting jobseekers and employers in Tacurong City",
  heroSubheadline: "A single window for opportunities, referrals, and employment services",
  primaryCTA: "Browse Jobs",
  secondaryCTA: "Post a Vacancy",
  aboutTitle: "Why TaraCurong",
  aboutBody: "Community-built job matching, referrals, and analytics for Tacurong City.",
};

interface HeaderPropSettings {
  generalSettings?: GeneralSettings;
}

export function Header({ generalSettings = defaultSettings }: HeaderPropSettings) {
  return (
    <header
      className="gw-app sticky top-0 z-50 bg-white"
      style={{ borderBottom: "1px solid var(--line)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <img
              src="/taracurong-logo.svg"
              alt="TaraCurong"
              width={40}
              height={40}
              className="transition-transform group-hover:scale-[1.03] duration-200"
              style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-[18px] tracking-tight text-ink-900">
                TaraCurong
              </span>
              <span className="text-[10px] mt-0.5 font-medium uppercase tracking-[0.12em] text-ink-500">
                Tacurong City
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/#services"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-ink-600 hover:text-ink-900 hover:bg-ink-50"
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-ink-600 hover:text-ink-900 hover:bg-ink-50"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-ink-600 hover:text-ink-900 hover:bg-ink-50"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-ink-600 hover:text-ink-900 hover:bg-ink-50"
            >
              Contact
            </Link>

            {/* Login / Get Started */}
            <div
              className="flex items-center gap-2 ml-4 pl-4"
              style={{ borderLeft: "1px solid var(--line)" }}
            >
              <Link href="/login" className="gw-btn gw-btn-ghost gw-btn-sm">
                Sign in
              </Link>
              <Link href="/signup" className="gw-btn gw-btn-teal gw-btn-sm">
                Get Started
              </Link>
            </div>
          </nav>

          {/* Mobile menu */}
          <button
            className="lg:hidden p-2 rounded-md"
            style={{ color: "var(--ink-600)" }}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}