"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Briefcase, Building, ChevronDown, MapPin, Search, X } from "lucide-react";
import { Pill, type PillTone } from "@/components/gw/atoms";

type JobStatus = "draft" | "pending" | "active" | "closed" | "archived" | "rejected" | "suspended";
const JOB_STATUS: Record<JobStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "slate", label: "Draft" },
  pending: { tone: "amber", label: "Pending review" },
  active: { tone: "emerald", label: "Active" },
  closed: { tone: "slate", label: "Closed" },
  archived: { tone: "outline", label: "Archived" },
  rejected: { tone: "rose", label: "Rejected" },
  suspended: { tone: "rose", label: "Suspended" },
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  status: JobStatus;
  saved?: boolean;
};

// Shape returned by GET /api/jobseeker/jobs
type ApiJob = {
  id: string;
  positionTitle: string | null;
  location: string | null;
  city: string | null;
  province: string | null;
  employmentType: string | null;
  startingSalary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
  vacancies: number | null;
  createdAt: string | null;
  employerId: string | null;
  establishmentName: string | null;
  employerName: string | null;
};

type JobsResponse = {
  jobs: ApiJob[];
  data?: ApiJob[];
  pagination?: { limit: number; offset: number; total: number; hasMore: boolean };
};

function formatPosted(iso: string | null): string {
  if (!iso) return "Recently";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Map the API job shape onto the existing JSX `Job` shape.
function adaptJob(j: ApiJob): Job {
  return {
    id: j.id,
    title: j.positionTitle ?? "Untitled role",
    company: j.establishmentName ?? j.employerName ?? "Unknown employer",
    location: j.location ?? "Tacurong",
    salary: j.startingSalary ?? "Salary not specified",
    type: j.employmentType ?? "—",
    posted: formatPosted(j.createdAt),
    // API only returns active/open jobs; no per-job status field is exposed.
    status: "active",
  };
}

const FILTERS = [
  { h: "Salary range", v: "₱15k – ₱35k", chips: ["₱20k +", "₱25k +", "₱35k +"] },
  { h: "Experience", v: "Any", chips: ["Entry", "Mid", "Senior"] },
  { h: "Education", v: "Any", chips: ["HS", "Vocational", "Bachelor's"] },
];

// Location options surfaced in the search bar dropdown. Scoped to the Tacurong
// area — the platform is a Tacurong-City community service, not a national
// jobs board. Empty value means no location filter at all.
const LOCATIONS = [
  { value: "Tacurong City", label: "Tacurong City", short: "Tacurong City" },
  { value: "Sultan Kudarat", label: "Sultan Kudarat (whole province)", short: "Sultan Kudarat" },
  { value: "", label: "Show jobs anywhere", short: "Anywhere" },
] as const;

function JobCard({ j }: { j: Job }) {
  return (
    <Link href={`/jobseeker/jobs/${encodeURIComponent(j.id)}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="gw-card gw-card--hover" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--paper-2)",
              border: "1px solid var(--ink-7)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Building size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tx-h3">{j.title}</div>
            <div className="tx-caption" style={{ marginTop: 2 }}>{j.company}</div>
          </div>
          <Bookmark
            size={16}
            fill={j.saved ? "var(--ink)" : "none"}
            stroke={j.saved ? "var(--ink)" : "var(--ink-4)"}
          />
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <MapPin size={13} />{j.location}
          </span>
          <span className="tx-caption" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Briefcase size={13} />{j.type}
          </span>
          <span className="tx-caption tx-mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}>
            {j.salary}
          </span>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--ink-7)", margin: "2px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Pill tone={JOB_STATUS[j.status].tone}>{JOB_STATUS[j.status].label}</Pill>
          </div>
          <span className="tx-micro" style={{ color: "var(--ink-4)" }}>{j.posted}</span>
        </div>
      </div>
    </Link>
  );
}

function JobseekerJobsContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("q") ?? "";
  // Landing page links here with ?category=; the API treats it as a text search term.
  const urlCategory = searchParams?.get("category") ?? "";
  const initialQuery = urlQuery || urlCategory;

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("All");
  const [location, setLocation] = useState<string>("Tacurong City");
  const [locOpen, setLocOpen] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);
  const chips = ["All", "Full-time", "Part-time", "Contract", "On-site", "Hybrid", "Remote"];

  // Close the location dropdown when clicking outside it.
  useEffect(() => {
    if (!locOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [locOpen]);

  // Pass the typed query (or the incoming category) through as the API's text search.
  const searchTerm = query.trim() || urlCategory.trim();
  const typeFilter = activeFilter !== "All" ? activeFilter : "";

  const { data, isLoading, isError } = useQuery<JobsResponse>({
    queryKey: ["jobseeker", "jobs", { q: searchTerm, type: typeFilter, location }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (typeFilter) params.set("type", typeFilter);
      if (location) params.set("location", location);
      const qs = params.toString();
      const res = await fetch(`/api/jobseeker/jobs${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
  });

  const apiJobs = data?.jobs ?? data?.data ?? [];
  const jobs = apiJobs.map(adaptJob);
  const total = data?.pagination?.total ?? jobs.length;
  const selectedLoc = LOCATIONS.find((l) => l.value === location) ?? LOCATIONS[0];
  const headerLine = isLoading
    ? "Loading jobs…"
    : total === 0
      ? `No active jobs in ${selectedLoc.short} yet`
      : `${total.toLocaleString()} active job${total === 1 ? "" : "s"} in ${selectedLoc.short}`;

  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Find jobs</h1>
        <p className="tx-caption" style={{ marginTop: 4 }}>{headerLine}</p>
      </div>

      {/* Search bar */}
      <div className="gw-card" style={{ padding: 8, display: "flex", gap: 4, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", flex: 1 }}>
          <Search size={16} style={{ color: "var(--ink-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="bookkeeper, accountant…"
            className="tx-body"
            style={{ border: 0, outline: 0, background: "transparent", flex: 1, padding: "10px 0", color: "var(--ink)" }}
          />
        </div>
        <div style={{ width: 1, height: 22, background: "var(--ink-7)" }} />
        <div ref={locRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", minWidth: 200 }}>
          <MapPin size={16} style={{ color: "var(--ink-4)" }} />
          <button
            type="button"
            onClick={() => setLocOpen((o) => !o)}
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 0",
              textAlign: "left",
              color: "var(--ink-2)",
              font: "inherit",
            }}
            aria-haspopup="listbox"
            aria-expanded={locOpen}
          >
            <span className="tx-body" style={{ color: "var(--ink-2)" }}>{selectedLoc.short}</span>
            <ChevronDown size={14} style={{ color: "var(--ink-4)", marginLeft: "auto", transform: locOpen ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
          </button>
          {locOpen && (
            <ul
              role="listbox"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 6,
                minWidth: 240,
                listStyle: "none",
                padding: 6,
                background: "var(--surface)",
                border: "1px solid var(--ink-7)",
                borderRadius: "var(--r-2)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                zIndex: 30,
              }}
            >
              {LOCATIONS.map((opt) => {
                const selected = opt.value === location;
                return (
                  <li key={opt.value || "anywhere"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => { setLocation(opt.value); setLocOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 12px",
                        background: selected ? "var(--paper-2)" : "transparent",
                        border: 0,
                        cursor: "pointer",
                        fontSize: 13.5,
                        color: "var(--ink)",
                        borderRadius: "var(--r-1)",
                        font: "inherit",
                      }}
                    >
                      <span style={{ width: 14, color: "var(--teal)", fontWeight: 600 }}>{selected ? "✓" : ""}</span>
                      <span>{opt.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button type="button" className="gw-btn gw-btn--accent" style={{ height: 40 }} aria-label="Search">Search</button>
      </div>

      {/* Filter chips */}
      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {chips.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setActiveFilter(c)}
            className={`gw-chip${activeFilter === c ? " active" : ""}`}
          >
            {c}
            {activeFilter === c && c === "All" && <X size={12} style={{ marginLeft: 4 }} />}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: "var(--ink-7)", margin: "0 4px" }} />
        <span className="gw-chip">Salary <ChevronDown size={12} /></span>
        <span className="gw-chip">Posted <ChevronDown size={12} /></span>
        <span className="gw-chip">Category <ChevronDown size={12} /></span>
        <span style={{ flex: 1 }} />
        <span className="tx-micro" style={{ color: "var(--ink-3)" }}>Sort by</span>
        <span className="gw-chip">Best match <ChevronDown size={12} /></span>
      </div>

      {/* Filter sidebar + results */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <aside>
          <div className="gw-card" style={{ padding: 18 }}>
            <div className="tx-h4" style={{ marginBottom: 14 }}>Refine</div>
            {FILTERS.map((f, i) => (
              <div
                key={f.h}
                style={{
                  paddingTop: i > 0 ? 16 : 0,
                  borderTop: i > 0 ? "1px solid var(--ink-7)" : "none",
                  marginTop: i > 0 ? 16 : 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="tx-h4" style={{ fontSize: 13 }}>{f.h}</span>
                  <span className="tx-micro" style={{ color: "var(--ink-3)" }}>{f.v}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.chips.map((c) => (
                    <span key={c} className="gw-chip" style={{ height: 24, fontSize: 11.5 }}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <span className="tx-caption">
              Showing <span className="tx-mono" style={{ color: "var(--ink)" }}>{jobs.length === 0 ? 0 : `1–${jobs.length}`}</span> of{" "}
              <span className="tx-mono" style={{ color: "var(--ink)" }}>{total}</span> jobs{location ? ` in ${selectedLoc.short}` : ""}
            </span>
          </div>
          {isLoading ? (
            <div className="gw-card tx-body" style={{ padding: 24, color: "var(--ink-4)", textAlign: "center" }}>
              Loading jobs…
            </div>
          ) : isError ? (
            <div className="gw-card tx-body" style={{ padding: 24, color: "var(--ink-4)", textAlign: "center" }}>
              Couldn&apos;t load jobs. Please try again.
            </div>
          ) : jobs.length === 0 ? (
            <div className="gw-card tx-body" style={{ padding: 24, color: "var(--ink-4)", textAlign: "center" }}>
              No jobs found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.map((j) => <JobCard key={j.id} j={j} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobseekerJobsPage() {
  return (
    <Suspense fallback={null}>
      <JobseekerJobsContent />
    </Suspense>
  );
}
