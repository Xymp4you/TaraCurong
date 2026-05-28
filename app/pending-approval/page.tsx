import { Ban } from "lucide-react";
import { SiteHeader } from "@/components/gw/site-header";
import { SiteFooter } from "@/components/gw/site-footer";
import { PendingActions } from "./pending-actions";

export const metadata = {
  title: "Account inactive — TaraCurong",
  description: "Your employer account is not currently active.",
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
            <Ban size={26} />
          </div>
          <div className="tx-eyebrow" style={{ marginTop: 16 }}>Employer account</div>
          <h1
            className="tx-h1 text-[26px] sm:text-[32px]"
            style={{ marginTop: 8, lineHeight: 1.1, letterSpacing: "-0.028em", fontWeight: 500 }}
          >
            Your account isn&apos;t active
          </h1>
          <p className="tx-body" style={{ marginTop: 12, color: "var(--ink-3)" }}>
            Your employer account is currently inactive or suspended, so you can&apos;t
            access the employer portal right now. If you believe this is a mistake,
            please contact support.
          </p>
          <PendingActions />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
