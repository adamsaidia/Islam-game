import 'server-only';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import type { FullOrder } from './order-data';
import { CATEGORY_LABEL } from './order-data';
import { formatDate, formatTimeRange } from './dates';

const C = {
  deep: rgb(0.047, 0.2, 0.192), // #0C3331
  petrol: rgb(0.059, 0.298, 0.333),
  cream: rgb(0.965, 0.945, 0.906),
  gold: rgb(0.78, 0.663, 0.416),
  ink: rgb(0.1, 0.16, 0.16),
  muted: rgb(0.38, 0.43, 0.42),
  white: rgb(1, 1, 1),
};

/** pdf-lib standaardfonts ondersteunen alleen WinAnsi: vervang andere tekens. */
function safe(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\n\x20-\x7E\u00A0-\u00FF\u20AC\u2013\u2014\u2022]/g, '');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of safe(text).split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
  }
  return lines;
}

function spaced(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, spacing: number, color = C.white) {
  let cx = x;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + spacing;
  }
  return cx - x - spacing;
}

function spacedWidth(text: string, font: PDFFont, size: number, spacing: number) {
  return [...text].reduce((w, ch) => w + font.widthOfTextAtSize(ch, size) + spacing, -spacing);
}

export async function renderTicketsPdf(data: FullOrder, opts: { houseRules: string; contact: string }): Promise<Uint8Array> {
  const { order, event, tickets } = data;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Aqua Sisters tickets ${order.order_number}`);
  pdf.setAuthor('Aqua Sisters');
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 420;
  const H = 640;
  const valid = tickets.filter((t) => t.status === 'valid' || t.status === 'checked_in');

  for (const [i, t] of valid.entries()) {
    const page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.cream });
    // Kop
    page.drawRectangle({ x: 0, y: H - 150, width: W, height: 150, color: C.deep });
    const brand = 'AQUA SISTERS';
    const bw = spacedWidth(brand, serif, 22, 5);
    spaced(page, brand, (W - bw) / 2, H - 62, serif, 22, 5);
    page.drawLine({ start: { x: W / 2 - 30, y: H - 76 }, end: { x: W / 2 + 30, y: H - 76 }, thickness: 0.8, color: C.gold });
    const title = safe(event.title);
    const tw = serifItalic.widthOfTextAtSize(title, 17);
    page.drawText(title, { x: (W - tw) / 2, y: H - 104, size: 17, font: serifItalic, color: C.cream });
    const counter = `TICKET ${i + 1} VAN ${valid.length}`;
    const cw = spacedWidth(counter, sans, 7.5, 2);
    spaced(page, counter, (W - cw) / 2, H - 128, sans, 7.5, 2, C.gold);

    // QR
    const png = await QRCode.toBuffer(t.qr_token, { errorCorrectionLevel: 'M', margin: 1, width: 600, color: { dark: '#0C3331', light: '#FFFFFF' } });
    const img = await pdf.embedPng(png);
    const qr = 190;
    page.drawRectangle({ x: (W - qr) / 2 - 10, y: H - 370, width: qr + 20, height: qr + 20, color: C.white });
    page.drawImage(img, { x: (W - qr) / 2, y: H - 360, width: qr, height: qr });
    const tn = t.ticket_number;
    const tnw = sansBold.widthOfTextAtSize(tn, 11);
    page.drawText(tn, { x: (W - tnw) / 2, y: H - 390, size: 11, font: sansBold, color: C.ink });

    // Details
    const rows: [string, string][] = [
      ['Datum', formatDate(event.starts_at)],
      ['Tijd', formatTimeRange(event.starts_at, event.ends_at)],
      ['Locatie', [event.venue_name, event.pool_name, event.city].filter(Boolean).join(' · ')],
      ['Hoofdboeker', `${order.first_name} ${order.last_name}`],
      ['Ticket', t.ticket_type_name === CATEGORY_LABEL[t.category] ? t.ticket_type_name : `${t.ticket_type_name} (${CATEGORY_LABEL[t.category]})`],
      ['Bestelling', order.order_number],
    ];
    let y = H - 425;
    for (const [k, v] of rows) {
      page.drawText(k.toUpperCase(), { x: 40, y, size: 7, font: sans, color: C.muted });
      page.drawText(safe(v), { x: 130, y: y - 1, size: 10, font: sans, color: C.ink, maxWidth: W - 170 });
      y -= 20;
    }
    if (event.dress_code) {
      page.drawText(safe(event.dress_code), { x: 40, y: y - 4, size: 10, font: sansBold, color: C.petrol });
      y -= 20;
    }
    page.drawLine({ start: { x: 40, y: y - 2 }, end: { x: W - 40, y: y - 2 }, thickness: 0.5, color: C.gold });
    y -= 16;
    const rules = wrap(opts.houseRules.replace(/^CONCEPT.*\n+/i, ''), sans, 6.8, W - 80).slice(0, 10);
    for (const line of rules) {
      page.drawText(line, { x: 40, y, size: 6.8, font: sans, color: C.muted });
      y -= 9;
    }
    if (opts.contact) {
      page.drawText(safe(opts.contact), { x: 40, y: 22, size: 7, font: sans, color: C.muted });
    }
    page.drawText('Persoonlijk ticket · eenmalig geldig', { x: W - 40 - sans.widthOfTextAtSize('Persoonlijk ticket · eenmalig geldig', 7), y: 22, size: 7, font: sans, color: C.muted });
  }

  if (valid.length === 0) {
    const page = pdf.addPage([W, H]);
    page.drawText('Er zijn geen geldige tickets in deze bestelling.', { x: 40, y: H / 2, size: 12, font: sans, color: C.ink });
  }
  return pdf.save();
}

export async function qrSvg(token: string): Promise<string> {
  return QRCode.toString(token, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#0C3331', light: '#FFFFFF' } });
}
