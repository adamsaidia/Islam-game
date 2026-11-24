// HTML-e-mails in Aqua Sisters-huisstijl. Tabel-layout + inline styles voor brede ondersteuning.

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function fillPlaceholders(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k: string) => vars[k.toLowerCase()] ?? '');
}

export type EmailBlock =
  | { type: 'text'; text: string }
  | { type: 'details'; rows: [string, string][] }
  | { type: 'button'; label: string; href: string }
  | { type: 'note'; text: string }
  | { type: 'list'; items: string[] };

const COLORS = { deep: '#0C3331', petrol: '#0F4C5C', cream: '#F6F1E7', gold: '#C8A96A', ink: '#1A2A2A', muted: '#5E6C6A', line: '#E4DCCB' };

export function renderEmail(opts: { preheader: string; heading: string; intro: string; blocks: EmailBlock[]; footer: string }) {
  const c = COLORS;
  const blocks = opts.blocks
    .map((b) => {
      switch (b.type) {
        case 'text':
          return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${c.ink}">${esc(b.text).replace(/\n/g, '<br>')}</p>`;
        case 'note':
          return `<p style="margin:0 0 16px;padding:12px 16px;border-left:2px solid ${c.gold};font-size:14px;line-height:1.55;color:${c.ink};background:#FBF8F2">${esc(b.text).replace(/\n/g, '<br>')}</p>`;
        case 'list':
          return `<ul style="margin:0 0 16px;padding-left:18px;font-size:14px;line-height:1.7;color:${c.ink}">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'details':
          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid ${c.line}">${b.rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:10px 0;border-bottom:1px solid ${c.line};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${c.muted};width:38%;vertical-align:top">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid ${c.line};font-size:15px;color:${c.ink}">${esc(v)}</td></tr>`,
            )
            .join('')}</table>`;
        case 'button':
          return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:${c.deep};border-radius:2px"><a href="${esc(b.href)}" style="display:inline-block;padding:14px 28px;font-size:14px;letter-spacing:1px;color:#FFFFFF;text-decoration:none;font-family:Helvetica,Arial,sans-serif">${esc(b.label)}</a></td></tr></table>`;
      }
    })
    .join('\n');

  const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:${c.cream};font-family:Helvetica,Arial,sans-serif">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.cream}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF">
<tr><td style="background:${c.deep};padding:36px 32px 30px;text-align:center">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:6px;color:#FFFFFF">AQUA SISTERS</div>
<div style="width:48px;height:1px;background:${c.gold};margin:14px auto 0"></div>
</td></tr>
<tr><td style="padding:36px 32px 12px">
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;line-height:1.25;color:${c.deep}">${esc(opts.heading)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${c.ink}">${esc(opts.intro).replace(/\n/g, '<br>')}</p>
${blocks}
</td></tr>
<tr><td style="padding:20px 32px 32px;border-top:1px solid ${c.line};font-size:12px;line-height:1.6;color:${c.muted}">${esc(opts.footer).replace(/\n/g, '<br>')}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    'AQUA SISTERS',
    '',
    opts.heading,
    '',
    opts.intro,
    '',
    ...opts.blocks.map((b) => {
      switch (b.type) {
        case 'text':
        case 'note':
          return b.text + '\n';
        case 'list':
          return b.items.map((i) => `• ${i}`).join('\n') + '\n';
        case 'details':
          return b.rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n';
        case 'button':
          return `${b.label}: ${b.href}\n`;
      }
    }),
    '—',
    opts.footer,
  ].join('\n');

  return { html, text };
}
