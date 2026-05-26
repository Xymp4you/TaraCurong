import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, getClientIp, getRequestId } from "@/lib/api-guardrails";
import { db } from "@/lib/db";

const defaultGeneralSettings = {
  siteName: "TaraCurong",
  siteDescription: "A community job platform for Tacurong City — built by an IT student",
  contactEmail: "admin@taracurong.com",
  contactPhone: "+63 264 477 1234",
  address: "Tacurong City, Sultan Kudarat",
  heroHeadline: "Connecting jobseekers and employers in Tacurong City",
  heroSubheadline: "A single window for opportunities, referrals, and employment services",
  primaryCTA: "Browse Jobs",
  secondaryCTA: "Post a Vacancy",
  aboutTitle: "Why TaraCurong",
  aboutBody: "Community-built job matching, referrals, and analytics for Tacurong City.",
  heroBackgroundImage:
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
  seoKeywords: "tacurong jobs, job portal tacurong, taracurong referrals",
};

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const requestId = getRequestId(request);
  const rateLimit = enforceRateLimit({
    key: `settings:general:public:${clientIp}`,
    maxRequests: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limited" },
      {
        status: 429,
        headers: {
          "X-Request-ID": requestId,
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  // Read the global "general" settings row (user_id/role null = site-wide)
  // and merge it over the defaults. Defaults stand in until an admin saves
  // overrides, so the response is always complete.
  let settings: Record<string, unknown> = { ...defaultGeneralSettings };
  try {
    const { data } = await db
      .from("settings")
      .select("value")
      .eq("key", "general")
      .is("user_id", null)
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      settings = { ...defaultGeneralSettings, ...(data.value as Record<string, unknown>) };
    }
  } catch {
    // Fall back to defaults if the settings store is unavailable.
  }

  return NextResponse.json(settings, {
    headers: {
      "X-Request-ID": requestId,
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "X-RateLimit-Reset": String(rateLimit.resetInSeconds),
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
