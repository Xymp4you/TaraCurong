import { Info } from "lucide-react";

type MaintainerNoteProps = {
  /** Optional override for the body. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Tiny disclosure card used near forms/lists to remind users that a real
 * person (the project maintainer) is the one doing reviews and replies.
 */
export function MaintainerNote({ children, className }: MaintainerNoteProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: "var(--ink-50, #F8FAFC)",
        border: "1px solid var(--ink-7, #E2E8F0)",
        borderRadius: 10,
        fontSize: 12.5,
        lineHeight: 1.5,
        color: "var(--ink-3, #475569)",
      }}
    >
      <Info size={14} style={{ color: "var(--ink-4, #94A3B8)", marginTop: 2, flexShrink: 0 }} />
      <div>
        {children ?? (
          <>
            Reviewed manually by <strong>John Aerol Tapales</strong>, the project maintainer.
            Typical response time: <strong>1–3 working days</strong>. Not a government service.
          </>
        )}
      </div>
    </div>
  );
}
