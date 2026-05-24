"use client";

import { Flag } from "lucide-react";

type ReportButtonProps = {
  /** What is being reported — included in the mailto subject. */
  target: "job" | "employer" | "applicant" | "message";
  /** Identifier (slug, id, slip number) included in the email body for context. */
  identifier?: string;
  className?: string;
};

/**
 * Lightweight "Report this" button. Stubbed via mailto: today so it works with
 * zero backend; upgrade to a real endpoint + `reports` table later without
 * changing call sites.
 */
export function ReportButton({ target, identifier, className }: ReportButtonProps) {
  const labels: Record<ReportButtonProps["target"], string> = {
    job: "Report this job",
    employer: "Report this employer",
    applicant: "Report this applicant",
    message: "Report this message",
  };
  const subject = encodeURIComponent(`[REPORT] ${target}${identifier ? ` ${identifier}` : ""}`);
  const body = encodeURIComponent(
    [
      `Reporting a ${target}${identifier ? ` (ref: ${identifier})` : ""}.`,
      "",
      "Reason (please describe):",
      "",
      "",
      "Optional contact for follow-up:",
    ].join("\n")
  );

  return (
    <a
      href={`mailto:helpdesk@taracurong.com?subject=${subject}&body=${body}`}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--ink-3, #475569)",
        background: "transparent",
        border: "1px solid var(--ink-7, #E2E8F0)",
        textDecoration: "none",
      }}
      title={labels[target]}
    >
      <Flag size={12} />
      {labels[target]}
    </a>
  );
}
