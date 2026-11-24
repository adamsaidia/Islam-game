'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { getSettings, saveSetting } from '@/lib/settings';
import { parseEuroToCents } from '@/lib/money';

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
const url = (f: FormData, k: string) => {
  const v = str(f, k, 300);
  return /^https:\/\/[^\s"'<>]+$/.test(v) ? v : '';
};
const back = (section: string, msg: string): never => redirect(`/admin/instellingen?msg=${encodeURIComponent(msg)}#${section}`);

export async function saveSettingsSection(form: FormData) {
  const user = await requireAdmin();
  const s = await getSettings();
  const section = str(form, 'section', 20);

  if (section === 'site') {
    await saveSetting('site', {
      orgName: str(form, 'orgName', 80) || 'Aqua Sisters',
      tagline: str(form, 'tagline', 120),
      intro: str(form, 'intro', 600),
      contactEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(form, 'contactEmail')) ? str(form, 'contactEmail', 200) : '',
      contactPhone: str(form, 'contactPhone', 30).replace(/[^+0-9 ()-]/g, ''),
      whatsappUrl: url(form, 'whatsappUrl'),
      instagramUrl: url(form, 'instagramUrl'),
      tiktokUrl: url(form, 'tiktokUrl'),
      privacyNote: str(form, 'privacyNote', 600),
      burkiniNote: str(form, 'burkiniNote', 600),
    });
  } else if (section === 'checkout') {
    const iban = str(form, 'iban', 40).toUpperCase().replace(/\s/g, '');
    await saveSetting('checkout', {
      bankTransferEnabled: form.get('bankTransferEnabled') === 'on' && /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban),
      transferHoldHours: Math.max(1, Math.min(336, Number(form.get('transferHoldHours')) || 72)),
      iban,
      accountHolder: str(form, 'accountHolder', 80),
      maxPersonsPerOrder: Math.max(1, Math.min(100, Number(form.get('maxPersonsPerOrder')) || 20)),
      showDiscountField: form.get('showDiscountField') === 'on',
    });
  } else if (section === 'finance') {
    const rate = str(form, 'vatRatePercent');
    const fees = { ...s.finance.feeEstimates };
    for (const m of Object.keys(fees)) {
      fees[m] = {
        fixedCents: parseEuroToCents(str(form, `fee.${m}.fixed`) || '0') ?? 0,
        percentBps: Math.round((Number(str(form, `fee.${m}.percent`).replace(',', '.')) || 0) * 100),
      };
    }
    await saveSetting('finance', {
      vatEnabled: form.get('vatEnabled') === 'on' && rate !== '',
      vatRatePercent: rate === '' ? null : Math.max(0, Math.min(50, Number(rate.replace(',', '.')))),
      feeEstimates: fees,
    });
  } else if (section === 'privacy') {
    await saveSetting('privacy', { retentionMonths: Math.max(1, Math.min(120, Number(form.get('retentionMonths')) || 24)) });
    await saveSetting('reminders', {
      eventReminderHours: Math.max(0, Math.min(336, Number(form.get('eventReminderHours')) || 0)),
      paymentReminderMinutes: Math.max(0, Math.min(1440, Number(form.get('paymentReminderMinutes')) || 0)),
    });
  } else if (section === 'legal') {
    const legal = { ...s.legal };
    for (const k of ['privacy', 'terms', 'houseRules', 'cancellation'] as const) {
      legal[k] = { text: str(form, `${k}.text`, 20000) || s.legal[k].text, approved: form.get(`${k}.approved`) === 'on' };
    }
    await saveSetting('legal', legal);
  } else if (section === 'faq') {
    const qs = form.getAll('q').map(String);
    const as = form.getAll('a').map(String);
    await saveSetting('faq', qs.map((q, i) => ({ q: q.trim().slice(0, 200), a: (as[i] || '').trim().slice(0, 1000) })).filter((x) => x.q && x.a));
  } else {
    back('', 'Onbekende sectie');
  }
  await audit(user.id, `settings.${section}`, 'settings', section);
  revalidatePath('/', 'layout');
  back(section, 'Opgeslagen.');
}
