"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Building, Check, ChevronRight, Clock } from "lucide-react";

type View = "list" | "board" | "timeline";

type GroupKey = "submitted" | "under_review" | "shortlisted" | "interview" | "hired" | "rejected";
type Card = {
  id: string;
  t: string;
  c: string;
  d: string;
  warn?: boolean;
  success?: boolean;
  stage: GroupKey;
  // Sort key for list/timeline views: prefer interviewDate when scheduled,
  // otherwise reviewedAt, otherwise submittedAt. Falls back to 0 when nothing
  // is present so undated rows fall to the bottom.
  sortMs: number;
};

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

function safeTime(value: string | null): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatRelative(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDistanceToNow(date, { addSuffix: false })} ago`;
}

function toCard(app: ApiApplication, stage: GroupKey): Card {
  const base: Card = {
    id: app.id,
    t: app.positionTitle ?? "Untitled position",
    c: app.employerName ?? "Unknown employer",
    d: formatRelative(app.submittedAt),
    stage,
    sortMs: safeTime(app.interviewDate) || safeTime(app.reviewedAt) || safeTime(app.submittedAt),
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

function buildList(applications: ApiApplication[]): Card[] {
  return applications
    .map((app) => toCard(app, statusToStage(app.status)))
    .sort((a, b) => b.sortMs - a.sortMs);
}

const TIMELINE_BUCKETS = ["Today", "Yesterday", "Last 7 days", "Earlier"] as const;
type TimelineBucketKey = (typeof TIMELINE_BUCKETS)[number];

function buildTimeline(applications: ApiApplication[]): { key: TimelineBucketKey; cards: Card[] }[] {
  const all = buildList(applications);
  const buckets: Record<TimelineBucketKey, Card[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    Earlier: [],
  };
  const now = Date.now();
  const oneDay = 86400000;
  for (const card of all) {
    if (!card.sortMs) {
      buckets.Earlier.push(card);
      continue;
    }
    const age = now - card.sortMs;
    if (age < oneDay) buckets.Today.push(card);
    else if (age < oneDay * 2) buckets.Yesterday.push(card);
    else if (age < oneDay * 7) buckets["Last 7 days"].push(card);
    else buckets.Earlier.push(card);
  }
  return TIMELINE_BUCKETS.filter((k) => buckets[k].length > 0).map((k) => ({ key: k, cards: buckets[k] }));
}

function StatusPill({ stage }: { stage: GroupKey }) {
  const meta = GROUP_META.find((g) => g.key === stage)!;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        fontSize: 10.5,
        color: meta.color,
        border: `1px solid ${meta.color}`,
        borderRadius: 999,
        whiteSpace: "nowrap",
        fontWeight: 500,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: meta.color }} />
      {meta.label}
    </span>
  );
}

// Stacked row card used by List + Timeline views. Mobile-first single-column.
function ListRow({ card }: { card: Card }) {
  return (
    <Link href={`/jobseeker/applications/${card.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="gw-card gw-card--hover"
        style={{ padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--paper-2)",
            border: "1px solid var(--ink-7)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Building size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tx-h4" style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {card.t}
          </div>
          <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {card.c}
          </div>
          <div className="sm:hidden" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusPill stage={card.stage} />
            <span
              className="tx-micro"
              style={{
                color: card.warn ? "var(--amber)" : card.success ? "var(--emerald)" : "var(--ink-4)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {card.warn && <Clock size={11} />}
              {card.success && <Check size={11} />}
              {card.d}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex" style={{ flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <StatusPill stage={card.stage} />
          <span
            className="tx-micro"
            style={{
              color: card.warn ? "var(--amber)" : card.success ? "var(--emerald)" : "var(--ink-4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {card.warn && <Clock size={11} />}
            {card.success && <Check size={11} />}
            {card.d}
          </span>
        </div>
        <ChevronRight size={14} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
      </div>
    </Link>
  );
}

// Compact kanban card used by Board view (existing design).
function BoardCard({ card }: { card: Card }) {
  return (
    <Link href={`/jobseeker/applications/${card.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="gw-card gw-card--hover" style={{ padding: 14, cursor: "pointer" }}>
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
            <div className="tx-h4" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.t}</div>
            <div className="tx-micro" style={{ marginTop: 2, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.c}</div>
          </div>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            className="tx-micro"
            style={{
              color: card.warn ? "var(--amber)" : card.success ? "var(--emerald)" : "var(--ink-4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {card.warn && <Clock size={11} />}
            {card.success && <Check size={11} />}
            {card.d}
          </span>
          <ChevronRight size={13} style={{ color: "var(--ink-4)" }} />
        </div>
      </div>
    </Link>
  );
}

export default function JobseekerApplicationsPage() {
  // Default to List — works on every screen size. Users can switch to Board
  // (kanban) or Timeline (grouped by date) via the toggle.
  const [view, setView] = useState<View>("list");

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
  const list = buildList(applications);
  const timeline = buildTimeline(applications);
  const employerCount = new Set(applications.map((a) => a.employerName).filter(Boolean)).size;

  return (
    <div className="gw" style={{ maxWidth: 1600 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 18,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Applications</h1>
          <p className="tx-caption" style={{ marginTop: 4 }}>
            {applications.length} application{applications.length === 1 ? "" : "s"} across {employerCount} employer{employerCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="gw-toggle">
          {(["list", "board", "timeline"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={view === v ? "active" : ""}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
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
      ) : view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((card) => (
            <ListRow key={card.id} card={card} />
          ))}
        </div>
      ) : view === "timeline" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {timeline.map((bucket) => (
            <div key={bucket.key}>
              <div
                className="tx-eyebrow"
                style={{
                  marginBottom: 10,
                  color: "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{bucket.key}</span>
                <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
                  {bucket.cards.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bucket.cards.map((card) => (
                  <ListRow key={card.id} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Board view — desktop kanban, horizontal-scrolls when below ~1620px.
        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 260px)", gap: 14, minWidth: 1620 }}>
            {groups.map((g) => (
              <div key={g.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 8px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color }} />
                  <span className="tx-h4" style={{ fontSize: 13 }}>{g.label}</span>
                  <span className="tx-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>{g.count}</span>
                </div>
                {items[g.key].map((card) => (
                  <BoardCard key={card.id} card={card} />
                ))}
                {g.key === "submitted" && items.submitted.length === 0 && (
                  <div
                    style={{
                      padding: 14,
                      border: "1px dashed var(--ink-6)",
                      borderRadius: "var(--r-3)",
                      textAlign: "center",
                    }}
                  >
                    <div className="tx-micro" style={{ color: "var(--ink-3)" }}>
                      Apply to jobs to see them here
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
