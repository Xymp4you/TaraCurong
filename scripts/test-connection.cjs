const postgres = require('postgres');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split(/\r?\n/);
const getVal = (k) => {
  const line = lines.find((l) => l.startsWith(k + '='));
  if (!line) return null;
  return line.slice(k.length + 1).trim();
};

const sql = postgres(getVal('DATABASE_URL'), {
  ssl: 'require',
  max: 1,
  connect_timeout: 15,
  prepare: false,
});

(async () => {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`public schema has ${tables.length} tables:`);
    tables.forEach((t) => console.log('  -', t.table_name));
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();
