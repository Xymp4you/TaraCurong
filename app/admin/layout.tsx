import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session || role !== "admin") {
    redirect("/login?role=admin");
  }

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  };

  return (
    <div className="gw-app fixed inset-0 flex overflow-hidden" style={{ background: "var(--gw-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: `body { overflow: hidden !important; }` }} />
      <div className="hidden lg:flex lg:h-full lg:shrink-0">
        <AdminSidebar user={user} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="hidden lg:flex items-center gap-3 px-7 bg-white"
          style={{ height: 56, borderBottom: "1px solid var(--line)" }}
        >
          <div className="gw-role-bar" style={{ background: "var(--role-admin)" }} />
          <div>
            <div className="gw-eyebrow">Admin</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 1, color: "var(--ink-900)" }}>Console</div>
          </div>
        </div>
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/taracurong-logo.svg"
                alt="TaraCurong"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight leading-none">
                  <span className="text-red-600">Tara</span>
                  <span className="text-teal-700">Curong</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Tacurong City
                </span>
              </div>
            </div>
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <main className="min-h-0 flex-1 overflow-auto p-6 lg:p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
