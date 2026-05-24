"use client";

import { ShieldAlert } from "lucide-react";

type ScamWarningProps = {
  /** Where the warning is shown — tailors the copy. */
  context?: "application" | "job-listing" | "messaging" | "general";
  className?: string;
};

/**
 * Universal anti-scam callout. Place near application submission, on job
 * detail pages, and in messaging surfaces. The #1 safety message PH job
 * boards owe their users.
 */
export function ScamWarning({ context = "general", className }: ScamWarningProps) {
  const lines: Record<NonNullable<ScamWarningProps["context"]>, string> = {
    application:
      "No legitimate employer will charge you a fee to apply, interview, or start work. Don't pay for training, uniforms, ID, or processing fees up front. If anyone asks, report them.",
    "job-listing":
      "Spot something off? If an employer asks for fees, money, or personal documents like your PhilID before an interview, report the listing.",
    messaging:
      "Don't send money or share OTPs, bank details, or scanned IDs through chat. Verified employers won't ask for these here.",
    general:
      "TaraCurong is free. We never charge fees, and neither should any employer here. Anything that smells like a fee-to-apply scam should be reported immediately.",
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        background: "var(--rose-bg, #FEF2F2)",
        border: "1px solid var(--rose-200, #FECACA)",
        borderRadius: 12,
        color: "var(--rose-900, #7F1D1D)",
        fontSize: 13,
        lineHeight: 1.45,
      }}
      role="note"
    >
      <ShieldAlert
        size={18}
        style={{ color: "var(--rose-600, #DC2626)", marginTop: 1, flexShrink: 0 }}
      />
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Safety reminder</div>
        <div>{lines[context]}</div>
        <a
          href="mailto:helpdesk@taracurong.com?subject=%5BREPORT%5D%20Possible%20scam%20on%20TaraCurong"
          style={{
            display: "inline-block",
            marginTop: 8,
            fontWeight: 600,
            color: "var(--rose-700, #B91C1C)",
            textDecoration: "underline",
          }}
        >
          Report a scam →
        </a>
      </div>
    </div>
  );
}
