const postgres = require('postgres');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split(/\r?\n/);
const getVal = (k) => {
  const line = lines.find((l) => l.startsWith(k + '='));
  if (!line) return null;
  return line.slice(k.length + 1).trim();
};

const databaseUrl = getVal('DATABASE_URL');
if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const ORDERED_FILES = [
  // 0. Bootstrap truly-missing base tables (users, admins, messages, ...)
  'scripts/bootstrap-missing-tables.sql',
  // 1. Phase 1 — foundational alters + creates (referral_slips, message_threads, job_match_scores)
  'docs/migrations/phase1_migration.sql',
  // 2. Dated docs/migrations in chronological order
  'docs/migrations/20260424_add_audit_logs.sql',
  'docs/migrations/20260424_landing_page_tables.sql',
  'docs/migrations/20260424_nsrp_full_parity.sql',
  'docs/migrations/20260426_add_missing_nsrp_fields.sql',
  'docs/migrations/20260426_add_profile_image_column.sql',
  'docs/migrations/20260426_fix_auth_trigger.sql',
  'docs/migrations/20260428_add_dead_letter_queue.sql',
  // match_disparity_monitoring creates match_disparity_flags — must run BEFORE add_disparity_reviewer
  'docs/migrations/match_disparity_monitoring.sql',
  'docs/migrations/20260428_add_disparity_reviewer.sql',
  'docs/migrations/20260428_add_published_at_to_jobs.sql',
  'docs/migrations/20260428_add_salary_period_to_jobs.sql',
  'docs/migrations/20260428_add_score_version.sql',
  'docs/migrations/20260428_remove_age_preference.sql',
  // utility_agent_setup creates ai_matching_logs — must run BEFORE update_ai_matching_logs
  'docs/migrations/utility_agent_setup.sql',
  'docs/migrations/20260428_update_ai_matching_logs.sql',
  'docs/migrations/20260429_hybrid_hardened.sql',
  // Other docs/migrations
  'docs/migrations/identity_verification.sql',
  'docs/migrations/phase5b_pgvector.sql',
  // Apply RLS toward the end so it sees all tables
  'docs/migrations/20260424_enable_rls.sql',
  // 3. supabase/migrations (chronological)
  'supabase/migrations/20260430120000_upsert_job_match_scores.sql',
  'supabase/migrations/20260430130000_cleanup_stale_dimensions.sql',
  'supabase/migrations/20260430140000_compute_job_percentiles.sql',
  'supabase/migrations/20260430150000_add_percentile_rank_column.sql',
  'supabase/migrations/20260430160000_fix_feedback_logs.sql',
];

(async () => {
  const results = [];
  for (const file of ORDERED_FILES) {
    process.stdout.write(`-> ${file} ... `);
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.log('SKIP (file not found)');
      results.push({ file, status: 'skip', error: 'not found' });
      continue;
    }
    // Fresh connection per file to avoid transaction-abort cascade
    const sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
      connect_timeout: 15,
      prepare: false,
      onnotice: () => {}, // silence NOTICE noise
    });
    try {
      await sql.unsafe(content);
      console.log('OK');
      results.push({ file, status: 'ok' });
    } catch (e) {
      console.log('FAIL');
      console.log(`   ${e.message}`);
      results.push({ file, status: 'fail', error: e.message });
    } finally {
      await sql.end();
    }
  }

  console.log('\n=== Summary ===');
  const okCount = results.filter((r) => r.status === 'ok').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const skipCount = results.filter((r) => r.status === 'skip').length;
  console.log(`OK: ${okCount}, FAIL: ${failCount}, SKIP: ${skipCount}`);
  if (failCount > 0) {
    console.log('\nFailures:');
    results.filter((r) => r.status === 'fail').forEach((r) => {
      console.log(`  ${r.file}`);
      console.log(`    ${r.error}`);
    });
    process.exit(1);
  }
})();
