// Zet een schone e2e-database neer met migraties en twee testaccounts.
import { execSync } from 'node:child_process';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url || !/aqua_e2e|localhost/.test(url)) throw new Error('Weiger: e2e-setup alleen op een lokale testdatabase');
const sql = postgres(url, { max: 1, onnotice: () => {} });
await sql.unsafe('drop schema if exists public cascade; create schema public;');
await sql.end();
execSync('node scripts/migrate.mjs', { stdio: 'inherit', env: process.env });
for (const [email, role] of [['beheer@e2e.test', 'admin'], ['scanner@e2e.test', 'staff']]) {
  execSync(`node scripts/create-user.mjs --email ${email} --name "E2E ${role}" --role ${role}`, {
    stdio: 'inherit',
    env: { ...process.env, AQUA_PASSWORD: 'e2e-wachtwoord-123' },
  });
}
