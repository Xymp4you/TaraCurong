// TaraCurong redesign — atomic components
// Ported from the design bundle (taracurong/project/atoms.jsx).
// Use these throughout the app for visual consistency with the redesign.

import { CSSProperties, ReactNode } from "react"

// ---------- Pill / status badge ----------
export type PillTone =
  | "slate" | "sky" | "violet" | "amber" | "emerald" | "rose" | "teal" | "outline"

type PillProps = {
  children: ReactNode
  tone?: PillTone
  dot?: boolean
  style?: CSSProperties
  className?: string
}

export function Pill({ children, tone = "slate", dot = true, style, className }: PillProps) {
  return (
    <span className={`gw-pill gw-pill-${tone}${className ? " " + className : ""}`} style={style}>
      {dot && tone !== "outline" && <span className="gw-pill-dot" />}
      {children}
    </span>
  )
}

// ---------- Button ----------
type BtnKind = "primary" | "teal" | "ghost" | "emerald" | "rose"
type BtnSize = "sm" | "lg"

type BtnProps = {
  children: ReactNode
  kind?: BtnKind
  size?: BtnSize
  icon?: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function Btn({ children, kind = "ghost", size, icon, style, className, onClick, type, disabled }: BtnProps) {
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      className={`gw-btn gw-btn-${kind}${size ? " gw-btn-" + size : ""}${className ? " " + className : ""}`}
      style={style}
    >
      {icon}
      {children}
    </button>
  )
}

// ---------- Logo badge (used in headers / sidebars) ----------
type SealRole = "official" | "gold" | "teal"
export function Seal({ size = 36, role: _role = "official" }: { size?: number; role?: SealRole }) {
  return (
    <img
      src="/taracurong-logo.svg"
      alt="TaraCurong"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  )
}

// ---------- Large logo (used on referral slip) ----------
export function PesoSeal({ size = 72 }: { size?: number; color?: string; mono?: boolean }) {
  return (
    <img
      src="/taracurong-logo.svg"
      alt="TaraCurong"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  )
}

// ---------- TaraCurong Wordmark ----------
export function GWMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src="/taracurong-logo.svg"
        alt="TaraCurong"
        width={28}
        height={28}
        style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: inverted ? "white" : "var(--ink-900)",
          }}
        >
          TaraCurong
        </div>
        <div
          style={{
            fontSize: 9,
            marginTop: 3,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: inverted ? "var(--ink-300)" : "var(--ink-500)",
            fontWeight: 500,
          }}
        >
          Tacurong City
        </div>
      </div>
    </div>
  )
}

// ---------- QR placeholder (deterministic) ----------
export function QR({ size = 120, seed = 7, mod = 21 }: { size?: number; seed?: number; mod?: number }) {
  const cells: boolean[] = []
  for (let y = 0; y < mod; y++) {
    for (let x = 0; x < mod; x++) {
      const inCorner = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
      if (inCorner(0, 0) || inCorner(mod - 7, 0) || inCorner(0, mod - 7)) {
        const cx = inCorner(0, 0) ? 0 : inCorner(mod - 7, 0) ? mod - 7 : 0
        const cy = inCorner(0, 0) ? 0 : inCorner(mod - 7, 0) ? 0 : mod - 7
        const lx = x - cx
        const ly = y - cy
        const isFrame = lx === 0 || lx === 6 || ly === 0 || ly === 6
        const isInner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
        cells.push(isFrame || isInner)
        continue
      }
      const v = Math.sin((x + 1) * (y + 1) * seed * 13.371) * 10000
      cells.push(v - Math.floor(v) > 0.5)
    }
  }
  const cs = size / mod
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: "white" }} aria-label="QR code">
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={(i % mod) * cs}
            y={Math.floor(i / mod) * cs}
            width={cs}
            height={cs}
            fill="#0B1929"
          />
        ) : null,
      )}
    </svg>
  )
}

// ---------- Avatar with initials ----------
const AVATAR_TONES = {
  teal:    { bg: "var(--teal-100)",    fg: "var(--teal-700)"    },
  violet:  { bg: "var(--violet-100)",  fg: "var(--violet-600)"  },
  amber:   { bg: "var(--amber-100)",   fg: "var(--amber-600)"   },
  rose:    { bg: "var(--rose-100)",    fg: "var(--rose-600)"    },
  sky:     { bg: "var(--sky-100)",     fg: "var(--sky-600)"     },
  slate:   { bg: "var(--ink-100)",     fg: "var(--ink-700)"     },
  emerald: { bg: "var(--emerald-100)", fg: "var(--emerald-600)" },
}

export function Avatar({
  name,
  size = 32,
  tone = "teal",
}: {
  name: string
  size?: number
  tone?: keyof typeof AVATAR_TONES
}) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  const { bg, fg } = AVATAR_TONES[tone]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.floor(size * 0.4),
        fontWeight: 600,
        letterSpacing: "-0.01em",
        flexShrink: 0,
        fontFamily: "var(--font-ui)",
      }}
    >
      {initials}
    </div>
  )
}

// ---------- Pipeline (horizontal stepper) ----------
export type PipelineStep = { key: string; label: string }

const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "hired", label: "Hired" },
]

export function Pipeline({
  current = 0,
  steps = DEFAULT_PIPELINE_STEPS,
}: {
  current?: number
  steps?: PipelineStep[]
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, fontFamily: "var(--font-ui)" }}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const color = done || active ? "var(--teal-600)" : "var(--ink-300)"
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i === steps.length - 1 ? "0 0 auto" : 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: done ? "var(--teal-600)" : active ? "white" : "white",
                  border: `2px solid ${color}`,
                  color: done ? "white" : color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--ink-900)" : "var(--ink-500)",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? "var(--teal-600)" : "var(--ink-200)",
                  margin: "0 8px",
                  marginBottom: 18,
                  minWidth: 24,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
