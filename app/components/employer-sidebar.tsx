"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Bell,
  UserCircle2,
  Settings,
  LogOut,
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

type EmployerSidebarProps = {
  user?: {
    name: string | null;
    email: string | null;
    image?: string | null;
    company?: string | null;
  };
};

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

const primaryItems: NavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
  { label: "Applications", href: "/employer/applications", icon: ClipboardList },
  { label: "Messages", href: "/employer/messages", icon: MessageSquare },
  { label: "Notifications", href: "/employer/notifications", icon: Bell },
];

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/employer/settings", icon: Settings },
  { label: "Logout", href: "/logout", icon: LogOut },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/employer/dashboard" && pathname === "/employer") {
    return true;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatInitials(name: string | null, email: string | null, company: string | null) {
  const base = company?.trim() || name?.trim() || email?.trim() || "Employer";
  return base
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "E")
    .join("");
}

export function EmployerSidebar({ user }: EmployerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          fetch("/api/messages/unread", { cache: "no-store" }),
          fetch("/api/notifications?limit=1", { cache: "no-store" }),
        ]);
        
        if (!mounted) return;

        if (msgRes.ok) {
          const d = await msgRes.json();
          setUnreadCounts(prev => ({ ...prev, messages: d.unreadCount ?? d.count ?? 0 }));
        }
        if (notifRes.ok) {
          const d = await notifRes.json();
          setUnreadCounts(prev => ({ ...prev, notifications: d.unreadCount ?? 0 }));
        }
      } catch (err) {}
    };

    void loadUnread();

    const interval = window.setInterval(() => {
      void loadUnread();
    }, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const initials = useMemo(
    () => formatInitials(user?.name ?? null, user?.email ?? null, user?.company ?? null),
    [user?.email, user?.name, user?.company],
  );

  const renderSidebarItem = (item: NavItem) => {
    const active = isActivePath(pathname ?? "", item.href);
    let badge = 0;
    if (item.label === "Messages") badge = unreadCounts.messages;
    if (item.label === "Notifications") badge = unreadCounts.notifications;

    if (item.label === "Logout") {
      return (
        <button
          key={item.href}
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
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
        {badge > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center text-white"
            style={{ background: "var(--role-employer)" }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

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
          Employer Portal
        </div>
        <div className="space-y-0.5">{primaryItems.map((item) => renderSidebarItem(item))}</div>
      </div>

      <div className="px-3 py-3 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="space-y-0.5">{bottomItems.map((item) => renderSidebarItem(item))}</div>
      </div>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/employer/profile" className="flex items-center gap-2.5 px-2 py-1 rounded-md hover:bg-white/5 transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.image ?? undefined} alt={user?.company || user?.name || "Employer"} />
            <AvatarFallback
              className="rounded-full text-[11px] font-semibold"
              style={{ background: "var(--violet-100)", color: "var(--violet-600)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{user?.company || user?.name || "Employer"}</p>
            <p className="truncate text-[11px]" style={{ color: "var(--ink-400)" }}>
              Employer
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
                  router.push("/login?role=employer");
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
