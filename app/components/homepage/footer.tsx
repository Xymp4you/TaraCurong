"use client";

import React from "react";
import Link from "next/link";

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface FooterProps {
  generalSettings?: GeneralSettings;
}

const defaultSettings: GeneralSettings = {
  siteName: "TaraCurong",
  siteDescription: "A community job platform for Tacurong City — built by an IT student",
  contactEmail: "admin@taracurong.com",
  contactPhone: "+63 264 477 1234",
  address: "Tacurong City, Sultan Kudarat",
};

const navLinkStyle: React.CSSProperties = { color: "var(--ink-300)" };
const navLinkClass = "hover:text-white transition-colors";

const Heading = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="font-semibold mb-5 text-[11px] uppercase tracking-[0.16em]"
    style={{ color: "var(--ink-400)" }}
  >
    {children}
  </h3>
);

export function Footer({ generalSettings = defaultSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="gw-app w-full py-14"
      style={{ background: "var(--ink-900)", color: "var(--ink-300)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Wordmark + tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <img
                src="/taracurong-logo.svg"
                alt="TaraCurong"
                width={36}
                height={36}
                style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0, background: "white", borderRadius: 7, padding: 2 }}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-[16px] tracking-tight text-white">TaraCurong</span>
                <span
                  className="text-[10px] mt-0.5 font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--ink-400)" }}
                >
                  Tacurong City
                </span>
              </div>
            </Link>
            <p className="text-sm mb-3 leading-relaxed" style={navLinkStyle}>
              <span className="font-semibold block mb-0.5 text-white">A community project for Tacurong City</span>
              Built by John Aerol Tapales · Not a government service
            </p>
            <Link href="/help" className="text-sm font-medium hover:underline" style={{ color: "var(--teal-500)" }}>
              Accessibility Statement
            </Link>
          </div>

          {/* Contact */}
          <div>
            <Heading>Contact Us</Heading>
            <ul className="space-y-2.5 text-sm">
              <li style={navLinkStyle}>{generalSettings.address}</li>
              <li>
                <Link href="/contact" className="font-medium hover:underline" style={{ color: "var(--teal-500)" }}>
                  Helpdesk
                </Link>
              </li>
              <li>
                <a href={`tel:${generalSettings.contactPhone}`} className={navLinkClass} style={navLinkStyle}>
                  {generalSettings.contactPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${generalSettings.contactEmail}`} className={navLinkClass} style={navLinkStyle}>
                  {generalSettings.contactEmail}
                </a>
              </li>
            </ul>

            <Heading>
              <span className="block mt-6">Follow Us</span>
            </Heading>
            <div className="flex gap-2.5">
              <SocialIconLink
                href="https://x.com/taracurong"
                label="X"
                path="M18.902 1H22L13.5 11.004 22.5 23h-7.1l-5.5-7.2-6.1 7.2H2l8.9-10.5L1.5 1h7.2l5 6.6L18.902 1z"
              />
              <SocialIconLink
                href="https://www.linkedin.com/company/taracurong"
                label="LinkedIn"
                path="M4.983 3.5C4.983 5 3.88 6 2.5 6S0 5 0 3.5 1.103 1 2.483 1s2.5 1 2.5 2.5zM.5 8h4V23h-4V8zm7.5 0h3.834v2.05h.054c.534-1.012 1.84-2.05 3.787-2.05 4.05 0 4.8 2.664 4.8 6.128V23h-4v-6.52c0-1.556-.028-3.556-2.17-3.556-2.17 0-2.5 1.693-2.5 3.444V23h-3.8V8z"
              />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <Heading>Quick Links</Heading>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className={navLinkClass} style={navLinkStyle}>About TaraCurong</Link></li>
              <li><Link href="/help" className={navLinkClass} style={navLinkStyle}>Help & Support</Link></li>
              <li><Link href="/privacy" className={navLinkClass} style={navLinkStyle}>Privacy Policy</Link></li>
              <li><Link href="/contact" className={navLinkClass} style={navLinkStyle}>Contact Information</Link></li>
              <li><Link href="/login/admin" className={navLinkClass} style={navLinkStyle}>Admin Portal</Link></li>
            </ul>
          </div>

          {/* External job resources (informational only) */}
          <div>
            <Heading>Other Resources</Heading>
            <ul className="space-y-2.5 text-sm">
              <li><a href="https://dole.gov.ph" target="_blank" rel="noopener noreferrer" className={navLinkClass} style={navLinkStyle}>DOLE (external)</a></li>
              <li><a href="https://philjobnet.gov.ph/" target="_blank" rel="noopener noreferrer" className={navLinkClass} style={navLinkStyle}>PhilJobNet (external)</a></li>
              <li><a href="https://psa.gov.ph" target="_blank" rel="noopener noreferrer" className={navLinkClass} style={navLinkStyle}>PSA (external)</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "var(--ink-400)" }}
        >
          <div className="mb-3 md:mb-0">© {currentYear} TaraCurong · A community project by John Aerol Tapales.</div>
          <div>
            <span>Project home: </span>
            <a
              href="/about"
              className="font-medium hover:underline"
              style={{ color: "var(--teal-500)" }}
            >
              About this project
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIconLink({ href, label, path }: { href: string; label: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-md flex items-center justify-center transition-colors"
      style={{ background: "rgba(255,255,255,0.06)", color: "var(--ink-300)" }}
      aria-label={label}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </a>
  );
}
