// Maakt een beheerder of scanner-medewerker aan.
// Gebruik: DATABASE_URL=... npm run user:create -- --email jij@example.nl --name "Naam" --role admin
// Het wachtwoord wordt interactief gevraagd (of via AQUA_PASSWORD voor automatisering).
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import readline from 'node:readline';
import postgres from 'postgres';

const scrypt = promisify(scryptCb);
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []),
);
const email = String(args.email || '').trim().toLowerCase();
const name = String(args.name || '').trim();
const role = args.role === 'staff' ? 'staff' : 'admin';
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
  console.error('Gebruik: npm run user:create -- --email jij@example.nl --name "Naam" [--role admin|staff]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL ontbreekt');
  process.exit(1);
}

async function ask(q) {
  if (process.env.AQUA_PASSWORD) return process.env.AQUA_PASSWORD;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((res) => {
    rl.stdoutMuted = true;
    rl._writeToOutput = (s) => (rl.stdoutMuted && !s.startsWith(q) ? undefined : rl.output.write(s));
    rl.question(q, (a) => {
      rl.close();
      process.stdout.write('\n');
      res(a);
    });
  });
}

const password = await ask('Wachtwoord (min. 12 tekens, letters + cijfers): ');
if (password.length < 12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
  console.error('Wachtwoord te zwak.');
  process.exit(1);
}
const N = 32768;
const salt = randomBytes(16);
const hash = await scrypt(password, salt, 64, { N, r: 8, p: 1, maxmem: 128 * N * 8 * 2 });
const passwordHash = ['scrypt', N, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql.begin(async (tx) => {
    const [existing] = await tx`select id from users where lower(email) = ${email}`;
    let id = existing?.id;
    if (id) {
      await tx`update users set password_hash = ${passwordHash}, name = ${name}, is_active = true where id = ${id}`;
    } else {
      [{ id }] = await tx`insert into users (email, name, password_hash) values (${email}, ${name}, ${passwordHash}) returning id`;
    }
    await tx`insert into user_roles (user_id, role) values (${id}, ${role}) on conflict do nothing`;
    await tx`insert into audit_logs (action, entity, entity_id, details) values ('user.create_cli', 'user', ${id}, ${sql.json({ email, role })})`;
  });
  console.log(`✓ ${role === 'admin' ? 'Beheerder' : 'Medewerker'} ${email} is klaar. Log in via /admin/login${role === 'staff' ? ' of /scanner' : ''}.`);
} finally {
  await sql.end();
}
