import QRCode from 'qrcode';
import { PageHeader, Flash, Section } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { decrypt } from '@/lib/crypto';
import { otpauthUri } from '@/lib/auth/totp';
import { changePassword, confirmTotp, startTotp } from './actions';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string; setup?: string; setup2fa?: string }> }) {
  const u = await requireAdmin({ allowWithout2fa: true });
  const sp = await searchParams;
  const [row] = await sql<{ totp_secret: string | null }[]>`select totp_secret from users where id = ${u.id}`;
  let qr: string | null = null;
  let secret: string | null = null;
  if (!u.totpEnabled && sp.setup && row.totp_secret) {
    secret = decrypt(row.totp_secret, env.encryptionKey);
    qr = await QRCode.toString(otpauthUri(secret, u.email), { type: 'svg', margin: 1 });
  }
  return (
    <>
      <PageHeader title="Mijn account" eyebrow={u.email} />
      <Flash msg={sp.msg} error={sp.error || (sp.setup2fa ? 'Zet tweestapsverificatie aan om het dashboard te gebruiken.' : undefined)} />
      <Section title="Tweestapsverificatie (2FA)">
        {u.totpEnabled ? (
          <p className="text-sm">Staat aan. Bij het inloggen vragen we een code uit je authenticator-app.</p>
        ) : qr ? (
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="w-48 bg-white p-2 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
            <form action={confirmTotp} className="max-w-xs space-y-3 text-sm">
              <p>Scan de QR-code met een authenticator-app (bijv. Google Authenticator, Microsoft Authenticator of 1Password) en vul de code in.</p>
              <p className="break-all font-mono text-xs text-muted">{secret}</p>
              <input name="code" inputMode="numeric" autoComplete="one-time-code" className="input text-lg tracking-[0.3em]" placeholder="123456" required />
              <SubmitButton>Bevestigen</SubmitButton>
            </form>
          </div>
        ) : (
          <form action={startTotp}><SubmitButton>2FA instellen</SubmitButton></form>
        )}
      </Section>
      <Section title="Wachtwoord wijzigen">
        <form action={changePassword} className="grid max-w-md gap-3 text-sm">
          <label><span className="label mb-1">Huidig wachtwoord</span><input name="current" type="password" className="input" autoComplete="current-password" required /></label>
          <label><span className="label mb-1">Nieuw wachtwoord (min. 12 tekens)</span><input name="next" type="password" className="input" autoComplete="new-password" minLength={12} required /></label>
          <div><SubmitButton>Wijzigen</SubmitButton></div>
        </form>
      </Section>
    </>
  );
}
