import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const N = 32768;
const R = 8;
const P = 1;
const LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, LEN, { N, r: R, p: P, maxmem: 128 * N * R * 2 });
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * Number(n) * Number(r) * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Dummy-hash zodat een login met een onbekend e-mailadres even lang duurt. */
export const DUMMY_HASH = ['scrypt', N, R, P, Buffer.alloc(16).toString('base64'), Buffer.alloc(64).toString('base64')].join('$');

export function passwordProblems(pw: string): string | null {
  if (pw.length < 12) return 'Gebruik minimaal 12 tekens.';
  if (pw.length > 200) return 'Wachtwoord is te lang.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Gebruik zowel letters als cijfers.';
  return null;
}
