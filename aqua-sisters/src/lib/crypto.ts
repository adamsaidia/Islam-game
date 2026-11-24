import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

function key(raw: string): Buffer {
  // Accepteert een base64-sleutel van 32 bytes of een willekeurige lange string (wordt gehasht).
  const b = Buffer.from(raw, 'base64');
  return b.length === 32 ? b : createHash('sha256').update(raw).digest();
}

export function encrypt(plain: string, rawKey: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(rawKey), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}

export function decrypt(payload: string, rawKey: string): string {
  const [v, iv, tag, data] = payload.split('.');
  if (v !== 'v1') throw new Error('Onbekend versleutelingsformaat');
  const d = createDecipheriv('aes-256-gcm', key(rawKey), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8');
}

export function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
