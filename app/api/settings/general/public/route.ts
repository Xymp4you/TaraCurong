import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, getClientIp, getRequestId } from "@/lib/api-guardrails";

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

  return NextResponse.json(defaultGeneralSettings, {
    headers: {
      "X-Request-ID": requestId,
      "X-RateLimit-Remaining": String(rateLimit.remaining),
      "X-RateLimit-Reset": String(rateLimit.resetInSeconds),
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
