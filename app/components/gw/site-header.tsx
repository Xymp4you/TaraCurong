import Link from "next/link";
import { Seal } from "@/components/gw/atoms";
import { BetaBadge } from "@/components/transparency/beta-badge";

// Shared public-site chrome (utility bar + header) used across the secondary
// public pages (training, get-started, about, help, …) so they stay visually
// consistent with the landing page's gw design system.
export function SiteHeader() {
  return (
    <>
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
        className="flex items-center gap-3 sm:gap-7 px-4 sm:px-8 lg:px-14 py-3 lg:py-0 lg:h-[72px]"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--ink-7)" }}
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
        </div>
      </header>
    </>
  );
}
