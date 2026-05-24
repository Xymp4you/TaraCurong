"use client";

import Link from "next/link";
import { BriefcaseBusiness, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleId = "jobseeker" | "employer" | "admin";

type AuthShellProps = {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleId: RoleId;
  sideTitle: string;
  sideBullets: string[];
  primaryPortalBaseHref?: "/login" | "/signup";
  showPrimaryPortals?: boolean;
  showAdminPortalButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const portalsData = [
  { id: "jobseeker" as const, label: "Jobseeker" },
  { id: "employer" as const, label: "Employer" },
];

const roleThemes: Record<
  RoleId,
  {
    ambient: string;
    ring: string;
    badgeText: string;
    dot: string;
    panelAccent: string;
    portalBorder: string;
    portalActive: string;
    portalPassive: string;
    portalInactiveBorder: string;
    titleDot: string;
  }
> = {
  jobseeker: {
    // teal — primary role accent
    ambient:
      "bg-[radial-gradient(circle_at_10%_12%,rgba(14,124,123,0.16),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(26,149,145,0.12),transparent_34%),radial-gradient(circle_at_55%_95%,rgba(212,236,234,0.4),transparent_42%)]",
    ring: "border-teal-100",
    badgeText: "text-teal-700/90",
    dot: "bg-teal-600",
    panelAccent: "from-teal-700 to-teal-500",
    portalBorder: "border-teal-100",
    portalActive: "bg-ink-900 text-white shadow-md shadow-ink-200/60",
    portalPassive: "bg-white text-ink-500 hover:bg-ink-50 hover:text-ink-900",
    portalInactiveBorder: "border-line",
    titleDot: "text-teal-600",
  },
  employer: {
    // violet — employer accent
    ambient:
      "bg-[radial-gradient(circle_at_12%_14%,rgba(109,40,217,0.16),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(167,139,250,0.14),transparent_34%),radial-gradient(circle_at_55%_95%,rgba(228,218,248,0.35),transparent_42%)]",
    ring: "border-violet-100",
    badgeText: "text-violet-700/90",
    dot: "bg-violet-600",
    panelAccent: "from-violet-700 to-violet-500",
    portalBorder: "border-violet-100",
    portalActive: "bg-ink-900 text-white shadow-md shadow-ink-200/60",
    portalPassive: "bg-white text-ink-500 hover:bg-ink-50 hover:text-ink-900",
    portalInactiveBorder: "border-line",
    titleDot: "text-violet-600",
  },
  admin: {
    // oxblood — admin accent
    ambient:
      "bg-[radial-gradient(circle_at_12%_14%,rgba(134,36,53,0.16),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(180,35,66,0.14),transparent_34%),radial-gradient(circle_at_55%_95%,rgba(244,214,222,0.35),transparent_42%)]",
    ring: "border-rose-100",
    badgeText: "text-rose-700/90",
    dot: "bg-rose-700",
    panelAccent: "from-rose-700 to-rose-600",
    portalBorder: "border-rose-100",
    portalActive: "bg-ink-900 text-white shadow-md shadow-ink-200/60",
    portalPassive: "bg-white text-ink-500 hover:bg-ink-50 hover:text-ink-900",
    portalInactiveBorder: "border-line",
    titleDot: "text-rose-700",
  },
};

function roleIcon(roleId: RoleId) {
  if (roleId === "employer") return <Building2 className="h-4 w-4" />;
  if (roleId === "admin") return <ShieldCheck className="h-4 w-4" />;
  return <BriefcaseBusiness className="h-4 w-4" />;
}

function getPrimaryActiveIndex(roleId: RoleId) {
  if (roleId === "employer") return 1;
  return 0;
}

export function AuthShell({
  title,
  subtitle,
  roleLabel,
  roleId,
  sideTitle,
  sideBullets,
  primaryPortalBaseHref = "/login",
  showPrimaryPortals = true,
  showAdminPortalButton = false,
  children,
  footer,
}: AuthShellProps) {
  const theme = roleThemes[roleId];
  const primaryActiveIndex = getPrimaryActiveIndex(roleId);

  const getPortalHref = (id: "jobseeker" | "employer") => {
    if (primaryPortalBaseHref === "/signup") {
      return `/signup?role=${id}`;
    }
    return `/login?role=${id}`;
  };

  return (
    <div className="gw-app min-h-screen text-ink-900" style={{ background: "var(--gw-bg)" }}>
      <div className="relative overflow-hidden">
        <div className={cn("pointer-events-none absolute inset-0", theme.ambient)} />

        <header className="relative border-b border-line bg-white sticky top-0 z-50">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <img
                src="/taracurong-logo.svg"
                alt="TaraCurong"
                width={40}
                height={40}
                style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-[18px] tracking-tight text-ink-900">TaraCurong</span>
                <span className="text-[10px] mt-0.5 font-medium uppercase tracking-[0.12em] text-ink-500">
                  Tacurong City
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Home</Link>
              <Link href="/#services" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Services</Link>
              <Link href="/#how-it-works" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">How It Works</Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">About</Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Contact</Link>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {showPrimaryPortals ? (
                <div className={cn("relative grid grid-cols-2 rounded-2xl border bg-white p-1 shadow-sm", theme.portalBorder)}>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300 ease-out",
                      theme.portalActive
                    )}
                    style={{ transform: `translateX(${primaryActiveIndex * 100}%)` }}
                  />
                  {portalsData.map((portal, index) => (
                    <Link
                      key={portal.id}
                      href={getPortalHref(portal.id)}
                      className={cn(
                        "relative z-10 rounded-xl px-5 py-2 text-sm font-semibold transition-colors",
                        index === primaryActiveIndex && roleId !== "admin"
                          ? "text-white"
                          : cn(theme.portalPassive, theme.portalInactiveBorder)
                      )}
                    >
                      {portal.label}
                    </Link>
                  ))}
                </div>
              ) : null}

              {showAdminPortalButton ? (
                <Link
                  href="/login/admin"
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
                    roleId === "admin"
                      ? theme.portalActive
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                  )}
                >
                  Admin Portal
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <main className="relative mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl lg:grid-cols-2">
          <section className={cn("order-2 flex flex-col justify-between border-r border-slate-200/70 px-6 py-10 sm:px-10 lg:order-1 lg:py-14", theme.ring)}>
            <div className="max-w-xl">
              <p className={cn("inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]", theme.badgeText)}>
                {roleIcon(roleId)}
                {roleLabel}
              </p>

              <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-6xl">
                {title}
                <span className={theme.titleDot}>.</span>
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-slate-600">{subtitle}</p>

              <div className={cn("mt-8 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm", theme.ring)}>
                <p className="text-sm font-semibold text-slate-900">{sideTitle}</p>
                <ul className="mt-3 space-y-2 text-base text-slate-600">
                  {sideBullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", theme.dot)} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-10 text-sm text-slate-500">A community job platform for Tacurong City · built by John Aerol Tapales</p>
          </section>

          <section className="order-1 flex items-center px-6 py-10 sm:px-10 lg:order-2 lg:py-14">
            <div className="w-full max-w-xl lg:pl-10">
              <div className="mb-6 md:hidden">
                <p className="text-sm font-medium text-slate-500">Portal</p>
                <div className="mt-3 space-y-2">
                  {showPrimaryPortals ? (
                    <div className={cn("relative grid grid-cols-2 rounded-lg border bg-white p-1", theme.portalBorder)}>
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md transition-transform duration-300 ease-out",
                          theme.portalActive
                        )}
                        style={{ transform: `translateX(${primaryActiveIndex * 100}%)` }}
                      />
                      {portalsData.map((portal, index) => (
                        <Link
                          key={portal.id}
                          href={getPortalHref(portal.id)}
                          className={cn(
                            "relative z-10 rounded-md px-3 py-1.5 text-center text-sm font-semibold transition-colors",
                            index === primaryActiveIndex && roleId !== "admin"
                              ? "text-white"
                              : "text-slate-600"
                          )}
                        >
                          {portal.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {children}

              {footer ? <div className="mt-6 border-t border-slate-200 pt-5">{footer}</div> : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
