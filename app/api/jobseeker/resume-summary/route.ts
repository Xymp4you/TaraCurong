export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/lib/auth";
import { STORAGE_BUCKETS, supabaseAdmin } from "@/lib/supabase";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_SOURCE_CHARS = 6000;
const MIN_SOURCE_CHARS = 40;

function getGroqKeys(): string[] {
  const keys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  return keys.split(",").map((k) => k.trim()).filter(Boolean);
}

async function extractPdfText(buf: Buffer): Promise<string> {
  try {
    // pdf-parse's index.js has debug code that reads a test fixture at import
    // time; import the lib directly to dodge it.
    // @ts-ignore - no type declarations for the deep import path
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = (mod.default || mod) as (b: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buf);
    return (data.text || "").replace(/\s+\n/g, "\n").trim();
  } catch (e) {
    console.warn("[resume-summary] PDF parse failed:", (e as Error)?.message);
    return "";
  }
}

async function extractDocxText(buf: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return (value || "").replace(/\s+\n/g, "\n").trim();
  } catch (e) {
    console.warn("[resume-summary] DOCX parse failed:", (e as Error)?.message);
    return "";
  }
}

type ResumeKind = "pdf" | "docx" | "doc" | "other" | "none";

function classifyResume(path: string | null): ResumeKind {
  if (!path) return "none";
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".doc")) return "doc";
  return "other";
}

// Builds a plain-text CV from structured DB data — used when the resume file is
// missing, unparseable, or yields no extractable text.
async function buildStructuredCv(jobseekerId: string, profile: Record<string, any>): Promise<string> {
  const [exp, edu] = await Promise.all([
    supabaseAdmin
      .from("jobseeker_experience")
      .select("company_name, position, number_of_months, status")
      .eq("jobseeker_id", jobseekerId),
    supabaseAdmin
      .from("jobseeker_education")
      .select("level, course, school_name, year_graduated")
      .eq("jobseeker_id", jobseekerId),
  ]);

  const parts: string[] = [];

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  if (fullName) parts.push(`Name: ${fullName}`);

  const location = [profile.city, profile.province].filter(Boolean).join(", ").trim();
  if (location) parts.push(`Location: ${location}`);

  if (profile.employment_status) parts.push(`Current status: ${profile.employment_status}`);

  const occs = [profile.preferred_occupation_1, profile.preferred_occupation_2, profile.preferred_occupation_3]
    .filter(Boolean);
  if (occs.length) parts.push(`Preferred occupations: ${occs.join(", ")}`);

  if (Array.isArray(profile.other_skills) && profile.other_skills.length) {
    parts.push(`Skills: ${profile.other_skills.join(", ")}`);
  }

  if (exp.data?.length) {
    const lines = exp.data.map((e: any) => {
      const months = e.number_of_months ? ` (${e.number_of_months} months)` : "";
      const status = e.status ? ` — ${e.status}` : "";
      return `- ${[e.position, e.company_name].filter(Boolean).join(" at ")}${months}${status}`;
    });
    parts.push(`Work experience:\n${lines.join("\n")}`);
  }

  if (edu.data?.length) {
    const lines = edu.data.map((e: any) => {
      const yr = e.year_graduated ? ` (${e.year_graduated})` : "";
      return `- ${[e.level, e.course, e.school_name].filter(Boolean).join(", ")}${yr}`;
    });
    parts.push(`Education:\n${lines.join("\n")}`);
  }

  return parts.join("\n\n").trim();
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (user?.role !== "jobseeker" || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("jobseekers")
      .select(
        "first_name, last_name, resume_url, other_skills, preferred_occupation_1, preferred_occupation_2, preferred_occupation_3, employment_status, city, province"
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 1. Try the uploaded resume file (private bucket).
    const resumePath = profile.resume_url as string | null;
    const resumeKind = classifyResume(resumePath);
    let resumeText = "";
    let resumeDownloadOk = false;

    if (resumePath && (resumeKind === "pdf" || resumeKind === "docx")) {
      const { data: blob, error: dlError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.resumes)
        .download(resumePath);
      if (!dlError && blob) {
        resumeDownloadOk = true;
        const buf = Buffer.from(await blob.arrayBuffer());
        resumeText = resumeKind === "pdf" ? await extractPdfText(buf) : await extractDocxText(buf);
      }
    }

    // 2. Always build the structured CV as well — we prefer resume text but fall
    // back to (or supplement with) the structured details when the resume is thin.
    const structured = await buildStructuredCv(user.id, profile);

    let source = "";
    let sourceKind: "resume" | "cv" = "resume";
    if (resumeText.length >= 200) {
      source = resumeText;
      sourceKind = "resume";
    } else if (structured.length > resumeText.length) {
      source = structured;
      sourceKind = "cv";
    } else {
      source = resumeText;
      sourceKind = "resume";
    }

    if (source.trim().length < MIN_SOURCE_CHARS) {
      // Build a message specific to which path failed.
      let message: string;
      if (resumeKind === "none") {
        message =
          "We can't generate a summary yet — please upload a resume, OR fill in your work experience and education in your profile.";
      } else if (resumeKind === "doc" || resumeKind === "other") {
        message =
          "Your resume file format isn't supported for AI summaries yet. Re-upload it as a PDF or DOCX, or fill in your work experience and education to generate a summary from your CV details.";
      } else if (!resumeDownloadOk) {
        message =
          "We couldn't open your uploaded resume. Try uploading it again, or fill in your work experience and education.";
      } else {
        // PDF/DOCX downloaded but yielded no text (image-based PDF, empty doc, etc.)
        message =
          "We couldn't read text from your resume (it may be a scanned image or empty). Try re-uploading a text-based version, or fill in your work experience and education to generate a summary from your CV details.";
      }
      return NextResponse.json(
        {
          error: "Not enough information to summarize",
          message,
          code: "NO_SOURCE",
          diagnostics: {
            resumeKind,
            resumeDownloadOk,
            resumeChars: resumeText.length,
            structuredChars: structured.length,
          },
        },
        { status: 422 }
      );
    }

    const keys = getGroqKeys();
    if (keys.length === 0) {
      return NextResponse.json(
        {
          error: "AI summary not configured",
          message:
            "AI summary is not available right now — the server has no AI key configured. Try again later or write your summary manually.",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const source_trimmed = source.slice(0, MAX_SOURCE_CHARS);

    const groq = new Groq({ apiKey: keys[0] });
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 320,
        messages: [
          {
            role: "system",
            content:
              "You write concise professional summaries for job seekers in Tacurong City, Philippines. " +
              "Write a single first-person paragraph of 3 to 5 sentences. " +
              "Highlight the person's roles, experience, key skills, and education. " +
              "Use ONLY facts present in the provided text — never invent employers, dates, titles, or achievements. " +
              "If a detail is missing, simply omit it. Plain text only, no markdown, no headings, no bullet points.",
          },
          {
            role: "user",
            content: `Summarize this ${
              sourceKind === "resume" ? "resume" : "CV profile"
            } into a professional summary:\n\n${source_trimmed}`,
          },
        ],
      });
    } catch (e) {
      console.error("[resume-summary] Groq error:", (e as Error)?.message);
      return NextResponse.json(
        {
          error: "AI summary failed",
          message: "Could not generate a summary right now. Please try again in a moment.",
          code: "AI_ERROR",
        },
        { status: 502 }
      );
    }

    const summary = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!summary) {
      return NextResponse.json(
        {
          error: "AI returned empty summary",
          message: "The AI returned an empty summary. Please try again.",
          code: "AI_EMPTY",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary, source: sourceKind });
  } catch (error) {
    console.error("[resume-summary] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
