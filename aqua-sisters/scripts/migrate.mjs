// Voert alle SQL-migraties in supabase/migrations uit die nog niet zijn toegepast.
// Gebruik: DATABASE_URL=... npm run db:migrate
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL ontbreekt');
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const dir = path.resolve(process.cwd(), 'supabase/migrations');

try {
  await sql`create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select version from schema_migrations`).map((r) => r.version));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`insert into schema_migrations (version) values (${file})`;
    });
    console.log(`✓ ${file}`);
  }
  console.log('Migraties up-to-date.');
} catch (err) {
  console.error('Migratie mislukt:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
