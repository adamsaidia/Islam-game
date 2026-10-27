"use client";
// Digitaal schrijfbord. Beoordeling = eerlijke vergelijking van overlap met de voorbeeldletter
// (geen handschriftherkenning): hoeveel van de letter je bedekt en hoeveel van je inkt erbinnen valt.
import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Eye, EyeOff, Play } from "lucide-react";
import { Button } from "./ui";
import { cn } from "@/lib/utils";

const SIZE = 320;

function fontFamily() {
  if (typeof window === "undefined") return "serif";
  const f = getComputedStyle(document.documentElement).getPropertyValue("--font-naskh").trim();
  return f ? `${f}, serif` : "serif";
}

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: string, color: string, stroke = 0) {
  ctx.save();
  ctx.clearRect(0, 0, SIZE, SIZE);
  const len = Array.from(glyph).length;
  const px = len > 2 ? 110 : len > 1 ? 150 : 200;
  ctx.font = `${px}px ${fontFamily()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.fillStyle = color;
  ctx.fillText(glyph, SIZE / 2, SIZE / 2 + px * 0.08);
  if (stroke) {
    ctx.lineWidth = stroke;
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.strokeText(glyph, SIZE / 2, SIZE / 2 + px * 0.08);
  }
  ctx.restore();
}

export type TraceScore = { coverage: number; precision: number; score: number };

export function TraceBoard({ glyph, tip, onScore }: { glyph: string; tip?: string; onScore?: (s: TraceScore) => void }) {
  const guide = useRef<HTMLCanvasElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const drawing = useRef(false);
  const [showGuide, setShowGuide] = useState(true);
  const [result, setResult] = useState<TraceScore | null>(null);
  const [sweep, setSweep] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  const paintGuide = useCallback(() => {
    const c = guide.current?.getContext("2d");
    if (!c) return;
    if (showGuide) drawGlyph(c, glyph, "rgba(127,127,127,.22)");
    else c.clearRect(0, 0, SIZE, SIZE);
  }, [glyph, showGuide]);

  useEffect(() => {
    paintGuide();
    document.fonts?.ready.then(paintGuide);
  }, [paintGuide]);

  useEffect(() => {
    strokes.current = [];
    setResult(null);
    setHasInk(false);
    ink.current?.getContext("2d")?.clearRect(0, 0, SIZE, SIZE);
  }, [glyph]);

  const pos = (e: React.PointerEvent) => {
    const r = ink.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const redraw = () => {
    const c = ink.current?.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, SIZE, SIZE);
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = 12;
    c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary") || "#0f5c46";
    for (const s of strokes.current) {
      c.beginPath();
      s.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      if (s.length === 1) c.lineTo(s[0].x + 0.1, s[0].y);
      c.stroke();
    }
  };

  const evaluate = () => {
    // Doelmasker: de letter, iets verdikt als tolerantie.
    const target = document.createElement("canvas");
    target.width = target.height = SIZE;
    const tc = target.getContext("2d")!;
    drawGlyph(tc, glyph, "#000", 0);
    const core = tc.getImageData(0, 0, SIZE, SIZE).data;
    drawGlyph(tc, glyph, "#000", 22);
    const zone = tc.getImageData(0, 0, SIZE, SIZE).data;
    // Inkt van de gebruiker, ook iets verdikt.
    const user = document.createElement("canvas");
    user.width = user.height = SIZE;
    const uc = user.getContext("2d")!;
    uc.lineCap = "round";
    uc.lineJoin = "round";
    uc.lineWidth = 22;
    uc.strokeStyle = "#000";
    for (const s of strokes.current) {
      uc.beginPath();
      s.forEach((p, i) => (i ? uc.lineTo(p.x, p.y) : uc.moveTo(p.x, p.y)));
      uc.stroke();
    }
    const u = uc.getImageData(0, 0, SIZE, SIZE).data;
    let coreN = 0, covered = 0, inkN = 0, inside = 0;
    for (let i = 3; i < u.length; i += 16) {
      const isCore = core[i] > 100;
      const isZone = zone[i] > 100;
      const isInk = u[i] > 100;
      if (isCore) {
        coreN++;
        if (isInk) covered++;
      }
      if (isInk) {
        inkN++;
        if (isZone) inside++;
      }
    }
    const coverage = coreN ? covered / coreN : 0;
    const precision = inkN ? inside / inkN : 0;
    const score = coverage + precision ? (2 * coverage * precision) / (coverage + precision) : 0;
    const r = { coverage, precision, score };
    setResult(r);
    onScore?.(r);
  };

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
        <canvas ref={guide} width={SIZE} height={SIZE} className="absolute inset-0 h-full w-full" />
        {sweep && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="ar animate-[reveal_2.2s_ease-in-out_forwards] text-[200px] leading-none text-gold" style={{ clipPath: "inset(0 0 0 100%)" }} onAnimationEnd={() => setSweep(false)}>
              {glyph}
            </span>
            <style>{`@keyframes reveal{from{clip-path:inset(0 0 0 100%)}to{clip-path:inset(0 0 0 0)}}`}</style>
          </div>
        )}
        <canvas
          ref={ink}
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(e) => {
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            drawing.current = true;
            strokes.current.push([pos(e)]);
            setHasInk(true);
            setResult(null);
            redraw();
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            strokes.current[strokes.current.length - 1].push(pos(e));
            redraw();
          }}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        />
      </div>
      {tip && <p className="text-center text-sm text-muted">{tip}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowGuide((g) => !g)}>
          {showGuide ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showGuide ? "Uit het hoofd" : "Overtrekken"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSweep(true)} title="Toont de globale schrijfrichting (van rechts naar links), niet de exacte volgorde van de streken">
          <Play className="h-4 w-4" /> Schrijfrichting
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            strokes.current = [];
            setResult(null);
            setHasInk(false);
            redraw();
          }}
        >
          <Eraser className="h-4 w-4" /> Wissen
        </Button>
        <Button size="sm" onClick={evaluate} disabled={!hasInk}>
          Vergelijk
        </Button>
      </div>
      {result && (
        <div className={cn("rounded-xl p-3 text-sm", result.score >= 0.55 ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn")}>
          <p className="font-medium">Overeenkomst: {Math.round(result.score * 100)}%</p>
          <p className="text-xs opacity-80">
            Bedekt: {Math.round(result.coverage * 100)}% van de letter · Binnen de lijnen: {Math.round(result.precision * 100)}% van je inkt. Dit is een vergelijking van de vorm, geen
            handschriftherkenning: volgorde en richting van je streken worden niet beoordeeld.
          </p>
        </div>
      )}
    </div>
  );
}
