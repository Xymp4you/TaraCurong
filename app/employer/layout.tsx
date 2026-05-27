import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { EmployerSidebar } from "@/components/employer-sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MobileHeader } from "./mobile-header";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const userId = (user as { id?: string } | undefined)?.id;

  if (!session || !user || role !== "employer") {
    redirect("/login?role=employer");
  }

  // Only approved employers may use the portal; pending/rejected/suspended
  // accounts are sent to the approval-waiting screen.
  const { data: employer } = await supabaseAdmin
    .from("employers")
    .select("account_status")
    .eq("id", userId ?? "")
    .single();

  if (!employer || employer.account_status !== "approved") {
    redirect("/pending-approval");
  }

  const userData = {
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    company: (user as { company?: string | null }).company ?? null,
  };

  return (
    <div className="gw-app fixed inset-0 flex overflow-hidden" style={{ background: "var(--gw-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: `body { overflow: hidden !important; }` }} />
      <div className="hidden lg:flex lg:h-full lg:shrink-0">
        <EmployerSidebar user={userData} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader user={userData} />
        <div
          className="hidden lg:flex items-center gap-3 px-7 bg-white"
          style={{ height: 56, borderBottom: "1px solid var(--line)" }}
        >
          <div className="gw-role-bar" style={{ background: "var(--role-employer)" }} />
          <div>
            <div className="gw-eyebrow">Employer</div>
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
