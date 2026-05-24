/**
 * End-to-end test for the Utility Scoring Engine (Stage 3)
 * Run with: npx tsx --require ./scripts/preload-env.cjs scripts/test-matching-agent.ts
 *
 * Env vars are injected by preload-env.cjs BEFORE tsx evaluates any module.
 */
import postgres from "postgres";
import { runMatching } from "../app/lib/matching/agent";

async function main() {
  const databaseUrl = (process.env.DATABASE_URL ?? "").replace(":6543", ":5432");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set. Did preload-env.cjs run?");
  }
  const sql = postgres(databaseUrl);

  console.log("🔍 Fetching test IDs from the database...");

  const seekerRows = await sql`SELECT id FROM jobseekers LIMIT 1`;
  const jobRows = await sql`
    SELECT id, position_title, years_of_experience_required, minimum_education_required
    FROM jobs
    LIMIT 1
  `;
  await sql.end();

  if (!seekerRows.length || !jobRows.length) {
    console.error("❌ No test data found. Run mock_data_tacurong.sql first.");
    process.exit(1);
  }

  const jobseekerId = seekerRows[0]!.id as string;
  const jobId = jobRows[0]!.id as string;
  const position = (jobRows[0] as any).position_title as string;

  console.log(`\n📋 Jobseeker ID : ${jobseekerId}`);
  console.log(`📋 Job ID        : ${jobId}`);
  console.log(`📋 Position      : ${position}`);
  console.log("\n⏳ Running Utility Scoring Engine (Groq / llama-3.1-70b)...\n");

  const result = await runMatching({ jobseeker_id: jobseekerId, job_id: jobId });

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  const payload = result.value.result;

  console.log("✅ Match Complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎯 Utility Score : ${payload.utility_score} / 100`);
  console.log(`🏷️  Grade         : ${payload.grade}`);
  console.log(`\n📝 Summary:\n   ${payload.summary}`);
  console.log("\n📊 Dimension Scores:");
  for (const [key, val] of Object.entries<any>({ f1: payload.f1, f2: payload.f2, f3: payload.f3, f4: payload.f4, f5: payload.f5 })) {
    const k = key.padEnd(22);
    const r = String(val.raw ?? "?").padStart(4);
    const wt = String(val.weighted ?? "?").padStart(5);
    console.log(`   ${k}: raw=${r} | weighted=${wt}`);
  }
  if (payload.bias_flags?.length) {
    console.log("\n⚠️  Bias Flags:");
    payload.bias_flags.forEach((f) => console.log("   -", f));
  }
  if (payload.constraint_violations?.length) {
    console.log("\n🚫 Constraint Violations:");
    payload.constraint_violations.forEach((v) => console.log("   -", v));
  }
  console.log("\n💪 Strengths:");
  (payload.strengths ?? []).forEach((s) => console.log("   •", s));
  console.log("\n❌ Gaps:");
  (payload.gaps ?? []).forEach((g) => console.log("   •", g));
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Score persisted to job_match_scores table.");
}

main().catch((err) => {
  console.error("❌ Fatal:", err?.message ?? err);
  process.exit(1);
});
