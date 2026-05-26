"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Building, Check, ChevronRight, Clock } from "lucide-react";

type View = "list" | "board" | "timeline";

type GroupKey = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected";
type Card = { t: string; c: string; d: string; warn?: boolean; success?: boolean };

// Shape returned by GET /api/jobseeker/applications
interface ApiApplication {
  id: string;
  status: string | null;
  source: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  interviewDate: string | null;
  jobId: string | null;
  positionTitle: string | null;
  location: string | null;
  employerName: string | null;
  qrCodeUrl: string | null;
  slipNumber: string | null;
}

interface ApplicationsResponse {
  applications: ApiApplication[];
}

const GROUP_META: { key: GroupKey; label: string; color: string }[] = [
  { key: "submitted", label: "Submitted", color: "var(--slate)" },
  { key: "under_review", label: "Under review", color: "var(--sky)" },
  { key: "shortlisted", label: "Shortlisted", color: "var(--violet)" },
  { key: "interview", label: "Interview", color: "var(--amber)" },
  { key: "hired", label: "Hired", color: "var(--emerald)" },
  { key: "rejected", label: "Closed", color: "var(--rose)" },
];

// Maps DB/API application status values to the kanban stage keys the UI renders.
// API statuses: pending, reviewed, shortlisted, interview, hired, rejected, withdrawn.
function statusToStage(status: string | null): GroupKey {
  switch (status) {
    case "pending":
      return "submitted";
    case "reviewed":
      return "under_review";
    case "shortlisted":
      return "shortlisted";
    case "interview":
      return "interview";
    case "hired":
      return "hired";
    case "rejected":
    case "withdrawn":
      return "rejected";
    default:
      return "submitted";
  }
}

function formatRelative(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNow(date, { addSuffix: false })} ago`;
}

// Builds a kanban card from an application, choosing the date label + accent
// based on the stage so existing warn/success styling is preserved.
function toCard(app: ApiApplication, stage: GroupKey): Card {
  const base: Card = {
    t: app.positionTitle ?? "Untitled position",
    c: app.employerName ?? "Unknown employer",
    d: formatRelative(app.submittedAt),
  };

  if (stage === "interview" && app.interviewDate) {
    const date = new Date(app.interviewDate);
    if (!Number.isNaN(date.getTime())) {
      base.d = date.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
      base.warn = true;
    }
  } else if (stage === "hired") {
    const date = app.reviewedAt ? new Date(app.reviewedAt) : null;
    if (date && !Number.isNaN(date.getTime())) {
      base.d = `Hired ${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
    } else {
      base.d = "Hired";
    }
    base.success = true;
  } else if (stage === "rejected") {
    const date = app.reviewedAt ? new Date(app.reviewedAt) : null;
    if (date && !Number.isNaN(date.getTime())) {
      base.d = `Closed ${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
    } else {
      base.d = "Closed";
    }
  }

  return base;
}

function buildBoard(applications: ApiApplication[]) {
  const items: Record<GroupKey, Card[]> = {
    submitted: [],
    under_review: [],
    shortlisted: [],
    interview: [],
    hired: [],
    rejected: [],
  };

  for (const app of applications) {
    const stage = statusToStage(app.status);
    items[stage].push(toCard(app, stage));
  }

  const groups = GROUP_META.map((g) => ({ ...g, count: items[g.key].length }));
  return { groups, items };
}

export default function JobseekerApplicationsPage() {
  const [view, setView] = useState<View>("board");

  const { data, isLoading } = useQuery<ApplicationsResponse>({
    queryKey: ["jobseeker", "applications"],
    queryFn: async () => {
      const response = await fetch("/api/jobseeker/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    staleTime: 1000 * 60,
  });

  const applications = data?.applications ?? [];
  const { groups, items } = buildBoard(applications);
  const employerCount = new Set(
    applications.map((a) => a.employerName).filter(Boolean)
  ).size;

  return (
    <div className="gw" style={{ maxWidth: 1600 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Applications</h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>{applications.length} applications across {employerCount} employers</p>
        </div>
        <div className="gw-toggle">
          {(["list", "board", "timeline"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={view === v ? "active" : ""}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="tx-caption" style={{ padding: 14, color: "var(--ink-3)" }}>
          Loading applications…
        </div>
      ) : applications.length === 0 ? (
        <div
          style={{
            padding: 14,
            border: "1px dashed var(--ink-6)",
            borderRadius: "var(--r-3)",
            textAlign: "center",
          }}
        >
          <div className="tx-micro" style={{ color: "var(--ink-3)" }}>
            No applications yet — apply to a job to start tracking it here.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 260px)", gap: 14, minWidth: 1620 }}>
            {groups.map((g) => (
              <div key={g.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 8px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color }} />
                  <span className="tx-h4" style={{ fontSize: 13 }}>{g.label}</span>
                  <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>{g.count}</span>
                </div>
                {items[g.key].map((it, i) => (
                  <div key={`${it.t}-${i}`} className="gw-card gw-card--hover" style={{ padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "var(--paper-2)",
                          border: "1px solid var(--ink-7)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Building size={11} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tx-h4" style={{ fontSize: 13 }}>{it.t}</div>
                        <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)" }}>{it.c}</div>
                      </div>
                    </div>
                    <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        className="tx-micro"
                        style={{
                          color: it.warn ? "var(--amber)" : it.success ? "var(--emerald)" : "var(--ink-4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {it.warn && <Clock size={11} />}
                        {it.success && <Check size={11} />}
                        {it.d}
                      </span>
                      <ChevronRight size={13} style={{ color: "var(--ink-4)" }} />
                    </div>
                  </div>
                ))}
                {g.key === "submitted" && (
                  <div
                    style={{
                      padding: 14,
                      border: "1px dashed var(--ink-6)",
                      borderRadius: "var(--r-3)",
                      textAlign: "center",
                    }}
                  >
                    <div className="tx-micro" style={{ color: "var(--ink-3)" }}>
                      Drop applications here when you submit them
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
