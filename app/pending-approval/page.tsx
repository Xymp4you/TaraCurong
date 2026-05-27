import { Clock } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";
import { PendingActions } from "./pending-actions";

export const metadata = {
  title: "Account under review — TaraCurong",
  description: "Your employer account is awaiting administrator approval.",
};

export default function PendingApprovalPage() {
  return (
    <div
      className="gw"
      style={{ background: "var(--paper)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}
    >
      <SiteHeader />

      <main className="px-4 sm:px-8 lg:px-14 py-16 lg:py-24">
        <div className="mx-auto text-center" style={{ maxWidth: 560 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "var(--amber-bg)",
              color: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <Clock size={26} />
          </div>
          <div className="tx-eyebrow" style={{ marginTop: 16 }}>Employer account</div>
          <h1
            className="tx-h1 text-[26px] sm:text-[32px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Your account is awaiting approval
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Thanks for registering as an employer. An administrator will review your
            application and confirm your account — usually within 24–48 hours. Once
            approved, you&apos;ll be able to post jobs and manage applicants.
          </p>
          <PendingActions />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
