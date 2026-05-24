import Link from "next/link";

/**
 * Small "Beta · community project" badge used in top bars / footers.
 * Sets honest expectations about platform stage and provenance.
 */
export function BetaBadge({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const isDark = tone === "dark";
  return (
    <Link
      href="/about"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10.5,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: isDark ? "rgba(255,255,255,0.08)" : "var(--ink-100)",
        color: isDark ? "var(--ink-5)" : "var(--ink-700)",
        textDecoration: "none",
      }}
      title="A community project — not a government service. Click for details."
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--amber)",
        }}
      />
      Beta · Community project
    </Link>
  );
}
