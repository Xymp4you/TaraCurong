"use client";

import { useState } from "react";
import Link from "next/link";
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
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  status: JobStatus;
  match: number;
  saved?: boolean;
};

const JOBS: Job[] = [
  { title: "Bookkeeper", company: "Dole Philippines, Inc.", location: "Tacurong · On-site", salary: "₱18,000 – ₱24,000", type: "Full-time", posted: "2d ago", status: "active", match: 94, saved: true },
  { title: "Junior Accountant", company: "Sultan Kudarat CPA", location: "Tacurong · On-site", salary: "₱20,000 – ₱28,000", type: "Full-time", posted: "Today", status: "active", match: 88 },
  { title: "Account Assistant", company: "RD Pawnshop", location: "Tacurong · Hybrid", salary: "₱15,000 – ₱18,000", type: "Full-time", posted: "5h ago", status: "active", match: 86 },
  { title: "Records Officer", company: "City Hall Tacurong", location: "City Hall · On-site", salary: "₱17,500 fixed", type: "Contract", posted: "1d ago", status: "active", match: 81 },
  { title: "Office Clerk", company: "City Treasurer's Office", location: "City Hall · On-site", salary: "₱14,200 – ₱16,000", type: "Full-time", posted: "3d ago", status: "active", match: 76 },
  { title: "Payroll Encoder", company: "Marigold Manpower", location: "Tacurong · Remote OK", salary: "₱22,000 – ₱30,000", type: "Full-time", posted: "1w ago", status: "active", match: 72 },
];

const FILTERS = [
  { h: "Salary range", v: "₱15k – ₱35k", chips: ["₱20k +", "₱25k +", "₱35k +"] },
  { h: "Experience", v: "Any", chips: ["Entry", "Mid", "Senior"] },
  { h: "Education", v: "Any", chips: ["HS", "Vocational", "Bachelor's"] },
];

function JobCard({ j }: { j: Job }) {
  return (
    <Link href={`/jobseeker/jobs/${encodeURIComponent(j.title)}`} style={{ textDecoration: "none", color: "inherit" }}>
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
            <span className="tx-micro tx-mono" style={{ color: "var(--ink-3)" }}>· {j.match}% match</span>
          </div>
          <span className="tx-micro" style={{ color: "var(--ink-4)" }}>{j.posted}</span>
        </div>
      </div>
    </Link>
  );
}

export default function JobseekerJobsPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const chips = ["All", "Full-time", "Part-time", "Contract", "On-site", "Hybrid", "Remote"];

  return (
    <div className="gw" style={{ maxWidth: 1320 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="tx-h1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em" }}>Find jobs</h1>
        <p className="tx-caption" style={{ marginTop: 4 }}>1,284 active jobs · Updated 2 minutes ago</p>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", minWidth: 180 }}>
          <MapPin size={16} style={{ color: "var(--ink-4)" }} />
          <span className="tx-body" style={{ color: "var(--ink-2)" }}>Tacurong + 25km</span>
          <ChevronDown size={14} style={{ color: "var(--ink-4)", marginLeft: "auto" }} />
        </div>
        <button type="button" className="gw-btn gw-btn--accent" style={{ height: 40 }}>Search</button>
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
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
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
              Showing <span className="tx-mono" style={{ color: "var(--ink)" }}>1–{JOBS.length}</span> of{" "}
              <span className="tx-mono" style={{ color: "var(--ink)" }}>284</span> jobs in Tacurong
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {JOBS.map((j) => <JobCard key={j.title} j={j} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
