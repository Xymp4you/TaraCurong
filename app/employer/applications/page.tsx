"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Sparkles, Shield as ShieldIcon, X } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type AppStatus = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected" | "withdrawn";
const APP_STATUS: Record<AppStatus, { tone: PillTone; label: string }> = {
  submitted: { tone: "slate", label: "Submitted" },
  under_review: { tone: "sky", label: "Under review" },
  shortlisted: { tone: "violet", label: "Shortlisted" },
  interview: { tone: "amber", label: "Interview" },
  hired: { tone: "emerald", label: "Hired" },
  rejected: { tone: "rose", label: "Rejected" },
  withdrawn: { tone: "slate", label: "Withdrawn" },
};

type Row = { id: string; ini: string; n: string; w: string; m: number; d: string; s: AppStatus; nsrp: string | null; fb: string | null; summary: string | null; selected?: boolean };

// Shape returned by GET /api/employer/applications (a row from the `applications`
// table plus nested jobs(position_title) and jobseekers(...) joins).
interface ApiApplication {
  id: string;
  job_id: string | null;
  jobseeker_id: string | null;
  employer_id: string | null;
  status: string | null;
  match_score: number | null;
  submitted_at: string | null;
  created_at: string | null;
  jobs?: { position_title: string | null } | null;
  jobseekers?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    nsrp_id: string | null;
    city: string | null;
    province: string | null;
    facebook_link: string | null;
    resume_summary: string | null;
  } | null;
}

interface ApplicationsApiResponse {
  success: boolean;
  data: {
    applications: ApiApplication[];
    pagination: { limit: number; offset: number; total: number; hasMore: boolean };
  };
}

// API/DB status enum -> UI AppStatus enum.
const API_STATUS_TO_UI: Record<string, AppStatus> = {
  pending: "submitted",
  submitted: "submitted",
  reviewed: "under_review",
  under_review: "under_review",
  shortlisted: "shortlisted",
  interview: "interview",
  hired: "hired",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

const formatApplied = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

// Typed adapter: API applicant shape -> table Row shape the JSX expects.
// Applicant name / initials / nsrp_id come from the joined jobseekers row.
// Experience (years) lives in a separate table and isn't fetched here, so it
// stays a neutral placeholder rather than a fabricated value.
const toRow = (a: ApiApplication): Row => {
  const s = API_STATUS_TO_UI[a.status ?? ""] ?? "submitted";
  const js = a.jobseekers;
  const fullName = js
    ? [js.first_name, js.last_name].filter(Boolean).join(" ").trim()
    : "";
  const initials = fullName
    ? fullName.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "—";
  return {
    id: a.id,
    ini: initials,
    n: fullName || "Applicant",
    w: "—",
    m: typeof a.match_score === "number" ? Math.round(a.match_score) : 0,
    d: formatApplied(a.submitted_at ?? a.created_at),
    s,
    nsrp: js?.nsrp_id ?? null,
    fb: js?.facebook_link ?? null,
    summary: js?.resume_summary ?? null,
  };
};

export default function EmployerApplicationsPage() {
  const [activeRow, setActiveRow] = useState(0);

  const { data, isLoading } = useQuery<ApplicationsApiResponse>({
    queryKey: ["employer", "applications"],
    queryFn: async () => {
      const response = await fetch("/api/employer/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const ROWS = useMemo<Row[]>(
    () => (data?.data?.applications ?? []).map(toRow),
    [data]
  );

  // Derive filter chip counts by grouping applications on (UI) status.
  const FILTERS = useMemo(() => {
    const count = (pred: (s: AppStatus) => boolean) =>
      ROWS.filter((r) => pred(r.s)).length;
    return [
      { l: "All", n: ROWS.length, active: true },
      { l: "New", n: count((s) => s === "submitted") },
      { l: "Under review", n: count((s) => s === "under_review") },
      { l: "Shortlisted", n: count((s) => s === "shortlisted") },
      { l: "Interview", n: count((s) => s === "interview") },
      { l: "Hired", n: count((s) => s === "hired") },
    ];
  }, [ROWS]);

  const EMPTY_ROW: Row = { id: "", ini: "—", n: "—", w: "—", m: 0, d: "—", s: "submitted", nsrp: null, fb: null, summary: null };
  const sel = ROWS[activeRow] ?? EMPTY_ROW;

  return (
    <div className="gw" style={{ display: "flex", gap: 0, height: "calc(100vh - 56px)", maxWidth: "100%", marginInline: "-24px" }}>
      {/* Table area */}
      <div style={{ flex: 1, padding: "20px 24px 24px", overflow: "auto" }}>
        <div style={{ marginBottom: 14 }}>
          <h1 className="tx-h1" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.025em" }}>
            Bookkeeper · 47 applicants
          </h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>
            Tacurong · Full-time · Posted 2 days ago
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <button type="button" className="gw-btn gw-btn--ghost">
            <Sparkles size={13} /> Run AI matching
          </button>
          <button type="button" className="gw-btn gw-btn--primary">
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Applicant data usage reminder */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 14px",
            background: "var(--sky-50, #F0F9FF)",
            border: "1px solid var(--sky-200, #BAE6FD)",
            borderRadius: 10,
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "var(--ink-2)",
            marginBottom: 14,
          }}
        >
          <ShieldIcon size={14} style={{ color: "var(--sky-700, #0369A1)", marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong>Applicant data handling.</strong> Contact details and uploaded documents are
            visible only because these jobseekers applied to this specific role. Don&apos;t reuse them
            for other postings, share them externally, or contact applicants outside this role.
            Misuse may result in your account being removed.{" "}
            <a href="/terms" style={{ color: "var(--sky-700, #0369A1)", textDecoration: "underline" }}>
              See Terms
            </a>
            .
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <span key={f.l} className={`gw-chip${f.active ? " active" : ""}`}>
              {f.l} <span className="tx-mono" style={{ marginLeft: 4 }}>{f.n}</span>
            </span>
          ))}
          <span style={{ flex: 1 }} />
          <span className="tx-micro" style={{ color: "var(--ink-3)" }}>Sort:</span>
          <span className="gw-chip">Match score <ChevronDown size={12} /></span>
        </div>

        {/* Table */}
        <div className="gw-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--ink-7)" }}>
                {["Applicant", "Experience", "Match", "Applied", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      font: "500 11.5px/1 var(--font-ui)",
                      color: "var(--ink-3)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                    Loading applicants…
                  </td>
                </tr>
              )}
              {!isLoading && ROWS.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>
                    No applicants yet
                  </td>
                </tr>
              )}
              {!isLoading && ROWS.map((r, i) => {
                const isActive = i === activeRow;
                return (
                  <tr
                    key={r.id}
                    onClick={() => setActiveRow(i)}
                    style={{
                      borderBottom: i < ROWS.length - 1 ? "1px solid var(--ink-7)" : "none",
                      background: isActive ? "var(--teal-4)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: isActive ? "var(--teal)" : "var(--paper-2)",
                            color: isActive ? "#fff" : "var(--ink-2)",
                            display: "grid",
                            placeItems: "center",
                            font: "600 11px/1 var(--font-ui)",
                            border: "1px solid var(--ink-7)",
                          }}
                        >
                          {r.ini}
                        </div>
                        <div>
                          <div className="tx-h4" style={{ fontSize: 13.5 }}>{r.n}</div>
                          <div className="tx-micro">{r.nsrp ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-2)" }}>{r.w}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            background: "var(--ink-7)",
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${r.m}%`,
                              background:
                                r.m >= 85
                                  ? "var(--violet)"
                                  : r.m >= 75
                                  ? "var(--teal)"
                                  : "var(--ink-4)",
                            }}
                          />
                        </div>
                        <span
                          className="tx-mono"
                          style={{
                            fontSize: 12,
                            color: r.m >= 85 ? "var(--violet)" : "var(--ink-2)",
                          }}
                        >
                          {r.m}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-3)", fontSize: 12.5 }}>{r.d}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Pill tone={APP_STATUS[r.s].tone}>{APP_STATUS[r.s].label}</Pill>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <ChevronRight size={14} style={{ color: "var(--ink-4)" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, alignItems: "center" }}>
          <span className="tx-micro" style={{ color: "var(--ink-3)" }}>Showing 8 of 47 applicants</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost"><ChevronLeft size={12} /></button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--primary">1</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">2</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">3</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">…</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost">6</button>
            <button type="button" className="gw-btn gw-btn--sm gw-btn--ghost"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>

      {/* Side drawer */}
      <aside
        style={{
          width: 420,
          borderLeft: "1px solid var(--ink-7)",
          background: "var(--surface)",
          overflow: "auto",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "20px 22px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="gw-btn gw-btn--quiet gw-btn--sm" style={{ padding: "0 6px" }}>
            <X size={14} />
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="gw-btn gw-btn--quiet gw-btn--sm"
            onClick={() => setActiveRow((i) => Math.max(0, i - 1))}
          >
            Prev
          </button>
          <span className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>
            {activeRow + 1} / {ROWS.length}
          </span>
          <button
            type="button"
            className="gw-btn gw-btn--quiet gw-btn--sm"
            onClick={() => setActiveRow((i) => Math.min(ROWS.length - 1, i + 1))}
          >
            Next
          </button>
        </div>

        <div style={{ padding: "16px 22px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "var(--teal-4)",
                color: "var(--teal)",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {sel.ini}
            </div>
            <div style={{ flex: 1 }}>
              <div className="tx-h2">{sel.n}</div>
              <div className="tx-caption" style={{ marginTop: 2 }}>29 yrs · Male · Tacurong</div>
              <div className="tx-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                {sel.nsrp ?? "—"}
              </div>
              {sel.fb ? (
                <a
                  href={sel.fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-micro"
                  style={{ color: "var(--teal)", marginTop: 4, display: "inline-block", textDecoration: "none" }}
                >
                  Facebook profile ↗
                </a>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Pill tone={APP_STATUS[sel.s].tone}>{APP_STATUS[sel.s].label}</Pill>
            <Pill tone="violet" dot={false}>
              <Sparkles size={9} /> {sel.m}% match
            </Pill>
            <Pill tone="teal" dot={false}>
              <ShieldIcon size={9} /> NSRP-verified
            </Pill>
          </div>
        </div>

        {/* Professional summary (AI-assisted, jobseeker-reviewed) */}
        <div style={{ padding: "0 22px 22px" }}>
          <div
            style={{
              padding: 14,
              background: "var(--violet-bg)",
              borderRadius: "var(--r-3)",
              border: "1px solid var(--violet-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Sparkles size={13} color="var(--violet)" />
              <span
                className="tx-mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--violet)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Professional summary
              </span>
            </div>
            {sel.summary ? (
              <p className="tx-body" style={{ fontSize: 13, color: "var(--ink-2)", margin: 0, whiteSpace: "pre-wrap" }}>
                {sel.summary}
              </p>
            ) : (
              <p className="tx-body" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, fontStyle: "italic" }}>
                This applicant hasn&apos;t added a professional summary yet.
              </p>
            )}
          </div>
        </div>

        <div style={{ padding: "0 22px 22px", display: "flex", gap: 8 }}>
          <button type="button" className="gw-btn gw-btn--primary" style={{ flex: 1 }}>
            Move to shortlist
          </button>
          <button type="button" className="gw-btn gw-btn--ghost">Message</button>
        </div>
      </aside>
    </div>
  );
}
