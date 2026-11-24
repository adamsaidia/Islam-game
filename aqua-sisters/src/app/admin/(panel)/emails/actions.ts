'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { deliverEmail } from '@/lib/email';
import { getSettings, saveSetting } from '@/lib/settings';
import { EMAIL_TEMPLATE_LABELS, type EmailTemplateKey } from '@/lib/settings-defaults';

export async function retryEmail(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const r = await deliverEmail(id);
  await audit(user.id, 'email.retry', 'email', id, { result: r });
  redirect(`/admin/emails?${r === 'sent' ? 'msg=Verstuurd' : 'error=Opnieuw+mislukt'}`);
}

export async function retryAllFailed() {
  const user = await requireAdmin();
  const rows = await sql<{ id: string }[]>`select id from email_logs where status = 'failed' and created_at > now() - interval '14 days' order by created_at limit 100`;
  let ok = 0;
  for (const r of rows) if ((await deliverEmail(r.id)) === 'sent') ok++;
  await audit(user.id, 'email.retry_all', 'email', null, { total: rows.length, ok });
  redirect(`/admin/emails?msg=${encodeURIComponent(`${ok} van ${rows.length} opnieuw verstuurd`)}`);
}

export async function saveTemplates(form: FormData) {
  const user = await requireAdmin();
  const s = await getSettings();
  const next = { ...s.emailTemplates };
  for (const key of Object.keys(EMAIL_TEMPLATE_LABELS) as EmailTemplateKey[]) {
    const subject = String(form.get(`${key}.subject`) ?? '').trim().slice(0, 200);
    const intro = String(form.get(`${key}.intro`) ?? '').trim().slice(0, 2000);
    if (subject && intro) next[key] = { subject, intro };
  }
  await saveSetting('emailTemplates', next);
  await audit(user.id, 'settings.email_templates', 'settings', 'emailTemplates');
  redirect('/admin/emails?msg=Sjablonen+opgeslagen#sjablonen');
}
