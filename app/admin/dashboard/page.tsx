"use client";

import Link from "next/link";
import { ArrowRight, Building } from "lucide-react";
import { Pill } from "@/components/gw/atoms";

type DonutDatum = { v: number; c: string };

function Donut({ data, size = 92, thickness = 14 }: { data: DonutDatum[]; size?: number; thickness?: number }) {
  const total = data.reduce((a, b) => a + b.v, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-7)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.v / total;
        const offset = c * (1 - acc);
        const dash = `${c * frac} ${c}`;
        acc += frac;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.c}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

const STATS: { l: string; v: string; d: string; action?: boolean }[] = [
  { l: "Jobseekers", v: "12,840", d: "+184 this week" },
  { l: "Employers", v: "486", d: "+12 verified" },
  { l: "Active jobs", v: "1,284", d: "+47 today" },
  { l: "Applications", v: "8,431", d: "+312 today" },
  { l: "Pending employers", v: "7", d: "Needs review", action: true },
  { l: "Pending jobs", v: "14", d: "In moderation", action: true },
  { l: "Admin requests", v: "3", d: "Officer access", action: true },
];

const JOB_STATUS_DATA = [
  { l: "Active", v: 719, p: "56%", c: "var(--emerald)" },
  { l: "Pending", v: 231, p: "18%", c: "var(--amber)" },
  { l: "Closed", v: 205, p: "16%", c: "var(--slate)" },
  { l: "Archived", v: 129, p: "10%", c: "var(--ink-4)" },
];

const REFERRAL_DATA = [
  { l: "Hired", v: 524, p: "42%", c: "var(--emerald)" },
  { l: "Issued", v: 349, p: "28%", c: "var(--sky)" },
  { l: "Not hired", v: 250, p: "20%", c: "var(--rose)" },
  { l: "Expired", v: 124, p: "10%", c: "var(--slate)" },
];

const TOP_EMPLOYERS = [
  { n: "Dole Philippines, Inc.", h: 47, j: 12 },
  { n: "General Tuna Corporation", h: 38, j: 8 },
  { n: "Sykes Asia (Tacurong)", h: 29, j: 14 },
  { n: "City Government of Tacurong", h: 22, j: 6 },
  { n: "RD Pawnshop", h: 18, j: 4 },
];

const AUDIT_EVENTS = [
  { t: "Employer approved", w: "Marigold Manpower Inc.", a: "L. Sandoval", c: "var(--emerald)", time: "08:42" },
  { t: "Referral slip issued", w: "TC-2026-014872 · Bookkeeper / Dole", a: "M. Velasquez", c: "var(--sky)", time: "08:14" },
  { t: "Admin access requested", w: "Ronaldo Aquino · Officer III", a: "—", c: "var(--amber)", time: "07:58" },
  { t: "Job rejected", w: "Sales Rep · BBA Marketing — missing TIN", a: "L. Sandoval", c: "var(--rose)", time: "Yesterday" },
  { t: "Hire outcome confirmed", w: "Records Officer · City Hall Tacurong", a: "system", c: "var(--emerald)", time: "Yesterday" },
];

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export default function AdminDashboardPage() {
  return (
    <div className="gw" style={{ maxWidth: 1380 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>
            TaraCurong operations · Tacurong City
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>Tuesday, 23 May · 9:14 PHT</p>
        </div>
        <Pill tone="emerald">All systems normal</Pill>
      </div>

      {/* 7 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="gw-stat"
            style={{
              borderColor: s.action ? "var(--amber)" : "var(--ink-7)",
              background: s.action ? "var(--amber-bg)" : "var(--surface)",
            }}
          >
            <div className="label">{s.l}</div>
            <div className="value tx-num" style={{ fontSize: 26 }}>{s.v}</div>
            <div
              className="tx-micro"
              style={{
                color: s.action ? "var(--amber)" : "var(--ink-3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {s.action && <ArrowRight size={10} />}
              {s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Trend + donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-[18px]">
        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div className="tx-h3">Activity trend</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>
                Applications, hires, referrals · Last 12 months
              </div>
            </div>
            <div className="gw-toggle">
              <button type="button">3M</button>
              <button type="button">6M</button>
              <button type="button" className="active">12M</button>
              <button type="button">All</button>
            </div>
          </div>

          <div style={{ height: 200, position: "relative", padding: "0 8px" }}>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="600"
                  y1={y}
                  y2={y}
                  stroke="var(--ink-7)"
                  strokeWidth="1"
                  strokeDasharray={y === 200 ? "0" : "3 4"}
                />
              ))}
              <path
                d="M0,170 C50,150 100,160 150,140 S250,90 300,80 S400,70 450,60 S550,40 600,30"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2"
              />
              <path
                d="M0,170 C50,150 100,160 150,140 S250,90 300,80 S400,70 450,60 S550,40 600,30 L600,200 L0,200 Z"
                fill="var(--teal-4)"
                opacity="0.5"
              />
              <path
                d="M0,180 C80,170 150,160 220,150 S380,130 450,120 S550,110 600,90"
                fill="none"
                stroke="var(--violet)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M0,190 C100,185 180,180 250,170 S400,150 470,145 S560,135 600,125"
                fill="none"
                stroke="var(--ink-2)"
                strokeWidth="1.5"
              />
              <circle cx="600" cy="30" r="3.5" fill="var(--teal)" />
              <circle cx="600" cy="90" r="3.5" fill="var(--violet)" />
              <circle cx="600" cy="125" r="3.5" fill="var(--ink-2)" />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: "var(--ink-4)" }}>
            {MONTHS.map((m) => (
              <span key={m} className="tx-micro tx-mono">{m}</span>
            ))}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "20px 0 16px" }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { c: "var(--teal)", l: "Applications", v: "8,431", d: "+18% MoM" },
              { c: "var(--violet)", l: "Referrals issued", v: "1,247", d: "+9% MoM", dash: true },
              { c: "var(--ink-2)", l: "Hires confirmed", v: "612", d: "+5% MoM" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    display: "block",
                    width: 12,
                    height: 2,
                    marginTop: 8,
                    background: s.dash
                      ? `repeating-linear-gradient(90deg, ${s.c} 0 3px, transparent 3px 6px)`
                      : s.c,
                  }}
                />
                <div>
                  <div className="tx-micro" style={{ color: "var(--ink-3)" }}>{s.l}</div>
                  <div className="tx-mono" style={{ fontSize: 16, color: "var(--ink)", marginTop: 2, letterSpacing: "-0.01em" }}>
                    {s.v}
                  </div>
                  <div className="tx-micro" style={{ color: "var(--emerald)" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="gw-card" style={{ padding: 20 }}>
            <div className="tx-h3">Job status</div>
            <div className="tx-caption" style={{ marginTop: 2, marginBottom: 12 }}>1,284 jobs total</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut data={JOB_STATUS_DATA.map((d) => ({ v: parseInt(d.p), c: d.c }))} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {JOB_STATUS_DATA.map((s) => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
                    <span className="tx-body" style={{ fontSize: 12.5, flex: 1 }}>{s.l}</span>
                    <span className="tx-mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.v}</span>
                    <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 32, textAlign: "right" }}>{s.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gw-card" style={{ padding: 20 }}>
            <div className="tx-h3">Referral outcomes</div>
            <div className="tx-caption" style={{ marginTop: 2, marginBottom: 12 }}>1,247 slips issued</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut data={REFERRAL_DATA.map((d) => ({ v: parseInt(d.p), c: d.c }))} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {REFERRAL_DATA.map((s) => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
                    <span className="tx-body" style={{ fontSize: 12.5, flex: 1 }}>{s.l}</span>
                    <span className="tx-mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.v}</span>
                    <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)", width: 32, textAlign: "right" }}>{s.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top employers + audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-[18px]">
        <div className="gw-card" style={{ padding: 22 }}>
          <div className="tx-h3" style={{ marginBottom: 14 }}>Top hiring employers</div>
          {TOP_EMPLOYERS.map((e, i) => (
            <div
              key={e.n}
              style={{
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="tx-mono" style={{ width: 22, color: "var(--ink-4)", fontSize: 11 }}>#{i + 1}</span>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--paper-2)",
                  border: "1px solid var(--ink-7)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Building size={11} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-h4" style={{ fontSize: 13 }}>{e.n}</div>
                <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)" }}>{e.j} active jobs</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tx-mono" style={{ fontSize: 14, color: "var(--emerald)" }}>{e.h}</div>
                <div className="tx-micro" style={{ color: "var(--ink-4)" }}>hires</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gw-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="tx-h3">Recent audit events</div>
            <Link
              href="/admin/audit-logs"
              className="tx-micro"
              style={{ color: "var(--role-admin)", textDecoration: "none" }}
            >
              Full log →
            </Link>
          </div>
          {AUDIT_EVENTS.map((e, i) => (
            <div
              key={`${e.t}-${i}`}
              style={{
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ink-7)",
                display: "flex",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: e.c,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div className="tx-body" style={{ fontSize: 13 }}>{e.t}</div>
                <div className="tx-caption" style={{ marginTop: 2, fontSize: 12 }}>{e.w}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>{e.time}</div>
                <div className="tx-micro" style={{ color: "var(--ink-4)" }}>{e.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
