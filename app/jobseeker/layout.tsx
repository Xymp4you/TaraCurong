import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { JobseekerSidebar } from "@/components/jobseeker-sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MobileHeader } from "./mobile-header";

export default async function JobseekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string; id?: string; name?: string; email?: string; image?: string } | undefined)?.role;

  if (!session || role !== "jobseeker") {
    redirect("/login?role=jobseeker");
  }

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  };

  return (
    <div className="gw-app flex h-screen" style={{ background: "var(--gw-bg)" }}>
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-full lg:shrink-0">
        <JobseekerSidebar user={user} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader user={user} />
        <div
          className="hidden lg:flex items-center gap-3 px-7 bg-white"
          style={{ height: 56, borderBottom: "1px solid var(--line)" }}
        >
          <div className="gw-role-bar" style={{ background: "var(--role-jobseeker)" }} />
          <div>
            <div className="gw-eyebrow">Jobseeker</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 1, color: "var(--ink-900)" }}>Portal</div>
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
