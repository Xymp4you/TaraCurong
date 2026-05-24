"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Briefcase,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  Wand2,
  Settings,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminSidebarProps = {
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  };
};

type BadgeCounts = {
  messages: number;
  notifications: number;
  pendingAccessRequests: number;
  pendingEmployers: number;
  pendingJobs: number;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: keyof BadgeCounts;
};

const primaryItems: NavItem[] = [
  { label: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Job Seekers", href: "/admin/applicants", icon: Users },
  { label: "Employers", href: "/admin/employers", icon: Briefcase },
  { label: "Jobs", href: "/admin/jobs", icon: FileText },
  { label: "Referrals", href: "/admin/referrals", icon: ClipboardList },
  { label: "Matching", href: "/admin/matching", icon: Wand2 },
  { label: "Analytics", href: "/admin/reports", icon: Activity },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
];

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Logout", href: "/admin/logout", icon: LogOut },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard" && pathname === "/admin") {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderItem(item: NavItem, pathname: string, onLogoutClick?: () => void) {
  const active = isActivePath(pathname ?? "", item.href);

  if (item.label === "Logout") {
    return (
      <button
        key={item.href}
        type="button"
        onClick={onLogoutClick}
        className="gw-sidebar-item w-full text-left"
      >
        <item.icon className="h-4 w-4 flex-none" />
        <span className="flex-1">{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      key={item.href}
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`gw-sidebar-item${active ? " active" : ""}`}
    >
      <item.icon className="h-4 w-4 flex-none" />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

function formatInitials(name: string | null, email: string | null) {
  const base = name?.trim() || email?.trim() || "Admin";
  return base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "A")
    .join("");
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = useMemo(
    () => formatInitials(user.name, user.email),
    [user.email, user.name],
  );

  return (
    <aside
      className="flex h-full w-64 flex-col"
      style={{ background: "var(--ink-900)", color: "var(--ink-200)", fontFamily: "var(--font-ui)" }}
    >
      <div className="px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <img
            src="/taracurong-logo.svg"
            alt="TaraCurong"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0, background: "white", borderRadius: 6, padding: 2 }}
          />
          <div className="min-w-0">
            <div className="text-white text-[15px] font-semibold leading-tight tracking-tight">TaraCurong</div>
            <div
              className="text-[10px] mt-0.5 font-medium"
              style={{ color: "var(--ink-400)", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              Tacurong City
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div
          className="px-3 pb-2 text-[10px] font-semibold"
          style={{ color: "var(--ink-400)", letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Admin Portal
        </div>
        <div className="space-y-0.5">{primaryItems.map((item) => renderItem(item, pathname ?? ""))}</div>
      </div>

      <div className="px-3 py-3 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="space-y-0.5">
          {bottomItems.map((item) => renderItem(item, pathname ?? "", () => setShowLogoutConfirm(true)))}
        </div>
      </div>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/admin/profile" className="flex items-center gap-2.5 px-2 py-1 rounded-md hover:bg-white/5 transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.image ?? undefined} alt={user.name || "Admin"} />
            <AvatarFallback
              className="rounded-full text-[11px] font-semibold"
              style={{ background: "var(--rose-100)", color: "var(--rose-600)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{user.name || "Demo Admin"}</p>
            <p className="truncate text-[11px]" style={{ color: "var(--ink-400)" }}>
              Admin Officer
            </p>
          </div>
        </Link>
      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You&apos;ll need to log in again
              to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowLogoutConfirm(false);
                try {
                  await signOut();
                  router.push("/login/admin");
                  router.refresh();
                } catch (error) {
                  console.error("Logout failed:", error);
                }
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
