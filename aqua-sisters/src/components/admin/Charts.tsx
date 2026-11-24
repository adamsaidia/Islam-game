'use client';

import { useState } from 'react';

type Point = { label: string; value: number };
type Unit = 'count' | 'euro';
const FORMAT: Record<Unit, (n: number) => string> = {
  count: (n) => String(Math.round(n)),
  euro: (n) => `€${Math.round(n)}`,
};

const W = 640;
const H = 200;
const PAD = { t: 12, r: 8, b: 26, l: 44 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function shortDay(iso: string) {
  const [, m, d] = iso.split('-');
  return `${Number(d)}-${Number(m)}`;
}

function ChartFrame({ title, data, format, children, hover }: { title: string; data: Point[]; format: (n: number) => string; children: React.ReactNode; hover: Point | null }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm text-deep">{title}</span>
        <span className="text-xs text-muted tabular-nums" aria-live="polite">
          {hover ? `${shortDay(hover.label)}: ${format(hover.value)}` : ' '}
        </span>
      </figcaption>
      {children}
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">Tabelweergave</summary>
        <table className="table mt-2">
          <thead>
            <tr><th>Dag</th><th className="text-right">Waarde</th></tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}><td>{d.label}</td><td className="text-right tabular-nums">{format(d.value)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function Axis({ max, format, data }: { max: number; format: (n: number) => string; data: Point[] }) {
  const ih = H - PAD.t - PAD.b;
  const ticks = [0, 0.5, 1];
  const step = Math.max(1, Math.ceil(data.length / 6));
  const iw = W - PAD.l - PAD.r;
  return (
    <g className="text-[10px]" fill="var(--color-muted)">
      {ticks.map((t) => {
        const y = PAD.t + ih - t * ih;
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1} />
            <text x={PAD.l - 6} y={y + 3} textAnchor="end">{format(max * t)}</text>
          </g>
        );
      })}
      {data.map((d, i) =>
        i % step === 0 ? (
          <text key={d.label} x={PAD.l + (iw / data.length) * (i + 0.5)} y={H - 8} textAnchor="middle">{shortDay(d.label)}</text>
        ) : null,
      )}
    </g>
  );
}

export function BarChart({ title, data, unit = 'count' }: { title: string; data: Point[]; unit?: Unit }) {
  const format = FORMAT[unit];
  const [hover, setHover] = useState<Point | null>(null);
  if (!data.length) return <p className="py-8 text-sm text-muted">{title}: nog geen verkopen.</p>;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const bw = iw / data.length;
  const barW = Math.max(2, Math.min(28, bw - 2));
  return (
    <ChartFrame title={title} data={data} format={format} hover={hover}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title} onMouseLeave={() => setHover(null)}>
        <Axis max={max} format={format} data={data} />
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = PAD.l + bw * i + (bw - barW) / 2;
          const y = PAD.t + ih - h;
          const r = Math.min(4, barW / 2, h);
          const active = hover?.label === d.label;
          return (
            <g key={d.label} onMouseEnter={() => setHover(d)} onTouchStart={() => setHover(d)}>
              <rect x={PAD.l + bw * i} y={PAD.t} width={bw} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`}
                  fill={active ? 'var(--color-deep)' : 'var(--color-teal)'}
                />
              )}
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}

export function LineChart({ title, data, unit = 'count' }: { title: string; data: Point[]; unit?: Unit }) {
  const format = FORMAT[unit];
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <p className="py-8 text-sm text-muted">{title}: nog geen omzet.</p>;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const bw = iw / data.length;
  const pts = data.map((d, i) => [PAD.l + bw * (i + 0.5), PAD.t + ih - (d.value / max) * ih] as const);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${PAD.t + ih} L${pts[0][0]},${PAD.t + ih} Z`;
  return (
    <ChartFrame title={title} data={data} format={format} hover={hover != null ? data[hover] : null}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={title}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.max(0, Math.min(data.length - 1, Math.floor((x - PAD.l) / bw))));
        }}
      >
        <Axis max={max} format={format} data={data} />
        <path d={area} fill="var(--color-aqua)" opacity={0.18} />
        <path d={path} fill="none" stroke="var(--color-teal)" strokeWidth={2} strokeLinejoin="round" />
        {data.length === 1 && <circle cx={pts[0][0]} cy={pts[0][1]} r={4.5} fill="var(--color-teal)" />}
        {hover != null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD.t} y2={PAD.t + ih} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r={4.5} fill="var(--color-teal)" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
    </ChartFrame>
  );
}
