// Returns a data: URI for an inline-SVG avatar showing 1-2 initials on a colored
// background. Used as a fallback when a user has no uploaded profile image.
// Self-contained — no external service (dicebear, gravatar) so it works
// offline, in demos, and in CI without a network.
export function initialsDataUri(name: string | null | undefined): string {
  const safe = (name ?? "").trim();
  const initials =
    safe
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Deterministic color per name so the same user always gets the same avatar.
  const palette = ["#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#0f766e", "#7c3aed"];
  const hash = Array.from(initials).reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = palette[hash % palette.length];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="${bg}"/>` +
    `<text x="100" y="124" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" ` +
    `font-size="84" font-weight="600" fill="white" text-anchor="middle">${initials}</text>` +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
