"use client";
// Weergave van Arabische tekst: harakat-modus, RTL, klikbare woorden en voorlezen.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, Plus, Check, X } from "lucide-react";
import { applyHarakatMode, splitArabicRuns, stripHarakat, type HarakatMode } from "@/lib/arabic";
import { speak, useArabicVoices } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { lookup } from "@/content/lexicon";
import { cn } from "@/lib/utils";

const SIZES = { sm: "text-lg", md: "text-2xl", lg: "text-3xl", xl: "text-5xl", xxl: "text-7xl" };

export function useHarakat(force?: HarakatMode): HarakatMode {
  const mode = useStore((s) => s.settings.harakat);
  return force ?? mode;
}

/** Arabische tekst. `force` negeert de globale harakat-instelling (bijv. in harakat-lessen). */
export function Ar({ text, size = "md", force, className }: { text: string; size?: keyof typeof SIZES; force?: HarakatMode; className?: string }) {
  const mode = useHarakat(force);
  return (
    <bdi lang="ar" dir="rtl" className={cn("ar", SIZES[size], className)}>
      {applyHarakatMode(text, mode)}
    </bdi>
  );
}

/** Nederlandse tekst met losse Arabische stukken; die worden RTL en in Arabisch lettertype gezet. */
export function Rich({ text, force, arClass = "text-xl" }: { text: string; force?: HarakatMode; arClass?: string }) {
  const mode = useHarakat(force);
  return (
    <>
      {splitArabicRuns(text).map((p, i) =>
        p.ar ? (
          <bdi key={i} lang="ar" dir="rtl" className={cn("ar mx-0.5", arClass)}>
            {applyHarakatMode(p.text, mode)}
          </bdi>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export function Translit({ children }: { children: ReactNode }) {
  const on = useStore((s) => s.settings.translit);
  if (!on || !children) return null;
  return <span className="text-sm italic text-muted">{children}</span>;
}

export function AudioButton({ text, className, label, rate }: { text: string; className?: string; label?: string; rate?: number }) {
  const settings = useStore((s) => s.settings);
  const { voices, supported } = useArabicVoices();
  const [playing, setPlaying] = useState(false);
  const noVoice = supported && voices.length === 0;
  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true);
        const ok = speak(text, { rate: rate ?? settings.ttsRate, voiceURI: settings.voiceURI, onEnd: () => setPlaying(false) });
        if (!ok) setPlaying(false);
        setTimeout(() => setPlaying(false), 15000);
      }}
      title={!supported ? "Voorlezen wordt niet ondersteund in deze browser" : noVoice ? "Geen Arabische stem gevonden op dit apparaat; de uitspraak kan onjuist zijn" : "Voorlezen"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-primary transition hover:bg-primary-soft",
        playing && "bg-primary-soft",
        className,
      )}
    >
      <Volume2 className={cn("h-4 w-4", playing && "animate-pulse")} />
      {label ?? "Luister"}
      {noVoice && <span className="text-xs text-warn">(geen Arabische stem)</span>}
    </button>
  );
}

/** Tekst waarin je op elk woord kunt tikken voor betekenis en uitspraak. */
export function ClickableArabic({ text, gloss, size = "lg", force, source = "les" }: { text: string; gloss?: [string, string][]; size?: keyof typeof SIZES; force?: HarakatMode; source?: "les" | "gesprek" }) {
  const mode = useHarakat(force);
  const [open, setOpen] = useState<{ word: string; idx: number } | null>(null);
  const words = text.split(/(\s+)/);
  const addWords = useStore((s) => s.addWords);
  const dict = useStore((s) => s.dictionary);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const info = open ? lookup(open.word, gloss) : null;
  const clean = open ? open.word.replace(/[؟،.!:]/g, "") : "";
  const entryId = info ? `w-${info.ar}` : "";

  return (
    <div ref={ref} className="relative">
      <p lang="ar" dir="rtl" className={cn("ar", SIZES[size])}>
        {words.map((w, i) =>
          /^\s+$/.test(w) ? (
            <span key={i}>{w}</span>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(open?.idx === i ? null : { word: w, idx: i })}
              className={cn("rounded-md px-0.5 transition hover:bg-gold-soft", open?.idx === i && "bg-gold-soft")}
            >
              {applyHarakatMode(w, mode)}
            </button>
          ),
        )}
      </p>
      {open && (
        <div className="fade-in absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Ar text={clean} size="lg" force="full" />
            <button onClick={() => setOpen(null)} aria-label="Sluiten" className="text-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          {info ? (
            <>
              <p className="text-sm">{info.nl}</p>
              {info.info && <p className="mt-1 text-xs text-muted">{info.info}</p>}
              {info.lessonId && <p className="mt-1 text-xs text-muted">Uit les {info.lessonId}</p>}
            </>
          ) : (
            <p className="text-sm text-muted">Dit woord staat nog niet in het woordenboek van de app. Vraag het aan de AI-docent.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <AudioButton text={clean} />
            {info && (
              <button
                type="button"
                disabled={!!dict[entryId]}
                onClick={() => addWords([{ id: entryId, ar: info.ar, nl: info.nl.replace(" (grondvorm)", ""), info: info.info, source, verified: true }])}
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-60"
              >
                {dict[entryId] ? <Check className="h-4 w-4 text-ok" /> : <Plus className="h-4 w-4" />}
                {dict[entryId] ? "In woordenboek" : "Bewaar"}
              </button>
            )}
          </div>
          {mode !== "full" && <p className="mt-2 text-xs text-muted">Zonder harakat: {stripHarakat(clean)}</p>}
        </div>
      )}
    </div>
  );
}
