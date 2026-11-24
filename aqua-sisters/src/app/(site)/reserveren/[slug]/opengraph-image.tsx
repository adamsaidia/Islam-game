import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getEventBySlug, getTicketTypes } from '@/lib/events';
import { sql } from '@/lib/db';
import { formatDate, formatTimeRange } from '@/lib/dates';
import { formatEuro } from '@/lib/money';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Aqua Sisters – exclusief zwemmen voor vrouwen';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  const root = process.cwd();
  const [font, italic] = await Promise.all([
    fs.readFile(path.join(root, 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff')),
    fs.readFile(path.join(root, 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff')),
  ]);
  let bg: string;
  if (event?.image_id) {
    const [img] = await sql<{ content_type: string; data: Buffer }[]>`select content_type, data from images where id = ${event.image_id}`;
    bg = `data:${img.content_type};base64,${Buffer.from(img.data).toString('base64')}`;
  } else {
    bg = `data:image/jpeg;base64,${(await fs.readFile(path.join(root, 'public/images/water-og.jpg'))).toString('base64')}`;
  }
  const types = event ? (await getTicketTypes(event.id)).slice(0, 2) : [];

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Cormorant', color: '#fff' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(12,51,49,0.92) 0%, rgba(12,51,49,0.55) 60%, rgba(12,51,49,0.2) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%' }}>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 10 }}>AQUA SISTERS</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#C8A96A', textTransform: 'uppercase' }}>{event?.title ?? 'Exclusief vrouwenzwemmen'}</div>
            <div style={{ display: 'flex', fontSize: 88, lineHeight: 1, marginTop: 16, fontStyle: 'italic', fontFamily: 'CormorantItalic' }}>
              {event ? formatDate(event.starts_at) : 'Jouw moment in het water'}
            </div>
            {event && (
              <div style={{ display: 'flex', fontSize: 34, marginTop: 20, color: 'rgba(255,255,255,0.88)' }}>
                {`${formatTimeRange(event.starts_at, event.ends_at)} · ${event.venue_name}, ${event.city}`}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 40, fontSize: 30, color: 'rgba(255,255,255,0.9)' }}>
            {types.map((t) => (
              <span key={t.id}>{`${t.name} ${formatEuro(t.price_cents)}`}</span>
            ))}
            {event?.dress_code && <span style={{ color: '#C8A96A' }}>{event.dress_code}</span>}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Cormorant', data: font, weight: 500, style: 'normal' },
        { name: 'CormorantItalic', data: italic, weight: 400, style: 'italic' },
      ],
    },
  );
}
