"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, X, Mic, Square, Sparkles, RotateCcw, Eye } from "lucide-react";
import type { Exercise } from "@/content/types";
import { checkArabic, compareSpoken, diffLetters, hasArabic, type CheckResult } from "@/lib/arabic";
import { hashString, seeded, shuffle } from "@/lib/random";
import { useSpeechRecognition } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { callAi, fetchAiStatus, AiError } from "@/lib/ai/client";
import type { JudgeResult } from "@/lib/ai/schemas";
import { Ar, AudioButton, Rich } from "./arabic";
import { ArabicInput } from "./ArabicInput";
import { TraceBoard } from "./TraceBoard";
import { Button, Notice } from "./ui";
import { cn } from "@/lib/utils";

export type ExerciseResult = { correct: boolean; verdict: string; expected: string; aiJudged?: boolean };

type Props = {
  exercise: Exercise;
  /** null = overgeslagen (telt niet mee). */
  onDone: (r: ExerciseResult | null) => void;
  forceFull?: boolean;
};

function Feedback({ ok, almost, children }: { ok: boolean; almost?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("fade-in rounded-xl p-4 text-sm", ok ? "bg-ok-soft text-ok" : almost ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger")}>
      <div className="mb-1 flex items-center gap-2 font-semibold">
        {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {ok ? "Goed!" : almost ? "Bijna goed" : "Nog niet goed"}
      </div>
      <div className="text-ink">{children}</div>
    </div>
  );
}

export function ExerciseView({ exercise: e, onDone, forceFull }: Props) {
  const full = forceFull || e.skill === "reading" || e.skill === "letters" ? "full" : undefined;
  const isListening = !!e.audio && !e.promptAr && !e.passage && e.kind === "mcq";
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setRevealed(false), [e.id]);

  return (
    <div className="fade-in space-y-5" key={e.id}>
      <div className="space-y-3">
        <p className="text-base font-medium sm:text-lg">
          <Rich text={e.prompt} force={full} />
        </p>
        {e.passage && (
          <div className="rounded-2xl bg-surface-2 p-4">
            <Ar text={e.passage} size="md" force={e.skill === "reading_unvowelled" ? "none" : undefined} />
            <div className="mt-2">
              <AudioButton text={e.passage} />
            </div>
          </div>
        )}
        {e.promptAr && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 py-6">
            <Ar text={e.promptAr} size={Array.from(e.promptAr).length <= 3 ? "xxl" : "xl"} force={e.skill === "reading_unvowelled" ? "none" : full} />
          </div>
        )}
        {e.audio && !e.passage && (
          <div className="flex flex-wrap items-center gap-2">
            <AudioButton text={e.audio} label="Luister" />
            <AudioButton text={e.audio} label="Langzaam" rate={0.55} />
            {isListening && revealed && <Ar text={e.audio} size="md" />}
          </div>
        )}
      </div>

      {e.kind === "mcq" && <Mcq e={e} full={full} onDone={(r) => { setRevealed(true); return r; }} finish={onDone} />}
      {e.kind === "type" && <TypeIt e={e} finish={onDone} />}
      {e.kind === "order" && <Order e={e} finish={onDone} />}
      {e.kind === "match" && <Match e={e} finish={onDone} full={full} />}
      {e.kind === "trace" && <Trace e={e} finish={onDone} />}
      {e.kind === "speak" && <Speak e={e} finish={onDone} />}
    </div>
  );
}

function NextBar({ onNext, label = "Volgende" }: { onNext: () => void; label?: string }) {
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" && !(ev.target instanceof HTMLInputElement) && !(ev.target instanceof HTMLTextAreaElement)) onNext();
    };
    const t = setTimeout(() => window.addEventListener("keydown", h), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", h);
    };
  }, [onNext]);
  return (
    <div className="flex justify-end">
      <Button size="lg" onClick={onNext} autoFocus>
        {label}
      </Button>
    </div>
  );
}

function Mcq({ e, full, onDone, finish }: { e: Extract<Exercise, { kind: "mcq" }>; full?: "full"; onDone: (r: ExerciseResult) => ExerciseResult; finish: Props["onDone"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [e.id]);
  const answered = picked !== null;
  const ok = picked === e.answer;
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {e.options.map((o, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => {
              setPicked(i);
              onDone({ correct: i === e.answer, verdict: i === e.answer ? "correct" : "wrong", expected: e.options[e.answer] });
            }}
            className={cn(
              "min-h-14 rounded-xl border-2 px-4 py-3 text-left transition",
              !answered && "border-line bg-surface hover:border-primary hover:bg-primary-soft",
              answered && i === e.answer && "border-ok bg-ok-soft",
              answered && i === picked && i !== e.answer && "border-danger bg-danger-soft",
              answered && i !== picked && i !== e.answer && "border-line opacity-50",
              hasArabic(o) && "text-center",
            )}
          >
            {hasArabic(o) && !/[a-zA-Z]/.test(o) ? <Ar text={o} size="lg" force={full} /> : <Rich text={o} force={full} />}
          </button>
        ))}
      </div>
      {answered && (
        <>
          <Feedback ok={ok}>
            {!ok && (
              <p>
                Juist antwoord: <Rich text={e.options[e.answer]} force={full} />
              </p>
            )}
            {e.explain && (
              <p className="mt-1">
                <Rich text={e.explain} force={full} />
              </p>
            )}
          </Feedback>
          <NextBar onNext={() => finish({ correct: ok, verdict: ok ? "correct" : "wrong", expected: e.options[e.answer] })} />
        </>
      )}
    </div>
  );
}

function TypeIt({ e, finish }: { e: Extract<Exercise, { kind: "type" }>; finish: Props["onDone"] }) {
  const [value, setValue] = useState("");
  const [res, setRes] = useState<CheckResult | null>(null);
  const [ai, setAi] = useState<{ loading: boolean; result?: JudgeResult; error?: string }>({ loading: false });
  const [aiOk, setAiOk] = useState(false);
  const aiLevel = useStore((s) => s.settings.aiLevel);
  const [aiConfigured, setAiConfigured] = useState(false);
  useEffect(() => {
    setValue("");
    setRes(null);
    setAi({ loading: false });
    setAiOk(false);
  }, [e.id]);
  useEffect(() => {
    fetchAiStatus().then((s) => setAiConfigured(s.configured));
  }, []);

  const check = () => {
    if (!value.trim()) return;
    if (e.dutch) {
      const norm = (s: string) => s.toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").trim();
      const ok = e.answers.some((a) => norm(a) === norm(value));
      setRes({ correct: ok, verdict: ok ? "correct" : "wrong", message: ok ? "Goed!" : "Nog niet goed.", expected: e.answers[0] });
      return;
    }
    setRes(checkArabic(value, e.answers, e.requireHarakat));
  };

  const askAi = async () => {
    setAi({ loading: true });
    try {
      const r = await callAi<JudgeResult>("judge", { prompt: e.prompt, expected: e.answers.join(" / "), answer: value });
      setAi({ loading: false, result: r });
      if (r.verdict === "correct" && r.confidence !== "laag") setAiOk(true);
    } catch (err) {
      setAi({ loading: false, error: err instanceof AiError ? err.message : "AI-beoordeling mislukt." });
    }
  };

  const canAskAi = res && !res.correct && aiConfigured && aiLevel !== "off" && !e.requireHarakat && !e.audio && (e.skill === "writing" || e.skill === "grammar" || e.skill === "vocabulary");
  const finalCorrect = (res?.correct ?? false) || aiOk;

  return (
    <div className="space-y-4">
      {e.dutch ? (
        <input
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyDown={(ev) => ev.key === "Enter" && (res ? null : check())}
          disabled={!!res}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg outline-none focus:border-primary"
          placeholder="Typ je antwoord…"
        />
      ) : (
        <ArabicInput value={value} onChange={setValue} onSubmit={res ? undefined : check} disabled={!!res} autoFocus />
      )}
      {e.hint && !res && <p className="text-sm text-muted">Tip: <Rich text={e.hint} /></p>}
      {!res && (
        <div className="flex justify-end">
          <Button size="lg" onClick={check} disabled={!value.trim()}>
            Controleer
          </Button>
        </div>
      )}
      {res && (
        <>
          <Feedback ok={finalCorrect} almost={res.verdict === "almost"}>
            <p>{aiOk ? "De AI beoordeelt jouw antwoord als correct (een andere juiste formulering)." : res.message}</p>
            {!res.correct && !e.dutch && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted">Modelantwoord:</p>
                <Ar text={res.expected} size="lg" force={e.requireHarakat ? "full" : undefined} />
                <p className="text-xs text-muted">Jouw letters vergeleken (groen = juist, rood = ontbreekt of anders):</p>
                <p className="ar text-2xl" dir="rtl">
                  {diffLetters(value, res.expected).map((d, i) => (
                    <span key={i} className={d.ok ? "text-ok" : "text-danger underline"}>
                      {d.ch}
                    </span>
                  ))}
                </p>
              </div>
            )}
            {!res.correct && e.dutch && <p className="mt-1">Juist antwoord: {res.expected}</p>}
            {e.explain && (
              <p className="mt-2">
                <Rich text={e.explain} />
              </p>
            )}
          </Feedback>
          {canAskAi && !ai.result && (
            <div className="rounded-xl border border-dashed border-line p-3 text-sm">
              <p className="mb-2 text-muted">Denk je dat jouw antwoord ook goed is? De AI kan het beoordelen. Een AI-oordeel kan fout zijn.</p>
              <Button variant="outline" size="sm" onClick={askAi} disabled={ai.loading}>
                <Sparkles className="h-4 w-4" /> {ai.loading ? "Bezig…" : "Laat AI beoordelen"}
              </Button>
              {ai.error && <p className="mt-2 text-danger">{ai.error}</p>}
            </div>
          )}
          {ai.result && (
            <Notice tone={ai.result.verdict === "correct" ? "ok" : ai.result.verdict === "bijna" ? "warn" : "danger"}>
              <p className="font-medium">
                AI-oordeel: {ai.result.verdict} · zekerheid: {ai.result.confidence}
              </p>
              <p className="text-ink">
                <Rich text={ai.result.explanation} />
              </p>
              {ai.result.verdict === "correct" && ai.result.confidence === "laag" && <p className="mt-1 text-xs">Omdat de AI onzeker is, telt dit niet als goed.</p>}
            </Notice>
          )}
          <NextBar onNext={() => finish({ correct: finalCorrect, verdict: aiOk ? "ai-correct" : res.verdict, expected: res.expected, aiJudged: aiOk })} />
        </>
      )}
    </div>
  );
}

function Order({ e, finish }: { e: Extract<Exercise, { kind: "order" }>; finish: Props["onDone"] }) {
  const pool = useMemo(() => {
    const idx = e.tokens.map((_, i) => i);
    let s = shuffle(idx, seeded(hashString(e.id)));
    if (s.every((v, i) => v === i)) s = [...s].reverse();
    return s;
  }, [e.id, e.tokens]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setChosen([]);
    setChecked(false);
  }, [e.id]);
  const ok = chosen.map((i) => e.tokens[i]).join(" ") === e.tokens.join(" ");
  const done = chosen.length === e.tokens.length;
  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-line p-3">
        {chosen.length === 0 && <span className="text-sm text-muted" dir="ltr">Tik de woorden in de juiste volgorde (de zin loopt van rechts naar links).</span>}
        {chosen.map((i) => (
          <button key={i} type="button" disabled={checked} onClick={() => setChosen((c) => c.filter((x) => x !== i))} className="rounded-xl bg-primary-soft px-3 py-1">
            <Ar text={e.tokens[i]} size="md" />
          </button>
        ))}
      </div>
      <div dir="rtl" className="flex flex-wrap gap-2">
        {pool
          .filter((i) => !chosen.includes(i))
          .map((i) => (
            <button key={i} type="button" onClick={() => setChosen((c) => [...c, i])} className="rounded-xl border border-line bg-surface px-3 py-1 hover:border-primary">
              <Ar text={e.tokens[i]} size="md" />
            </button>
          ))}
      </div>
      {!checked ? (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setChosen([])} disabled={!chosen.length}>
            <RotateCcw className="h-4 w-4" /> Opnieuw
          </Button>
          <Button size="lg" onClick={() => setChecked(true)} disabled={!done}>
            Controleer
          </Button>
        </div>
      ) : (
        <>
          <Feedback ok={ok}>
            {!ok && (
              <div>
                <p>Juiste volgorde:</p>
                <Ar text={e.tokens.join(" ")} size="lg" />
              </div>
            )}
            {e.explain && <Rich text={e.explain} />}
          </Feedback>
          <div className="flex items-center justify-between">
            <AudioButton text={e.tokens.join(" ")} />
            <NextBar onNext={() => finish({ correct: ok, verdict: ok ? "correct" : "wrong", expected: e.tokens.join(" ") })} />
          </div>
        </>
      )}
    </div>
  );
}

function Match({ e, finish, full }: { e: Extract<Exercise, { kind: "match" }>; finish: Props["onDone"]; full?: "full" }) {
  const right = useMemo(() => shuffle(e.pairs.map((_, i) => i), seeded(hashString(e.id) + 1)), [e.id, e.pairs]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  useEffect(() => {
    setSel(null);
    setMatched([]);
    setMistakes(0);
  }, [e.id]);
  const done = matched.length === e.pairs.length;
  const cell = (s: string) => (hasArabic(s) && !/[a-zA-Z]/.test(s) ? <Ar text={s} size="lg" force={full} /> : <Rich text={s} force={full} />);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {e.pairs.map(([l], i) => (
            <button
              key={i}
              type="button"
              disabled={matched.includes(i)}
              onClick={() => setSel(i)}
              className={cn(
                "flex min-h-14 w-full items-center justify-center rounded-xl border-2 px-3 py-2 transition",
                matched.includes(i) ? "border-ok bg-ok-soft opacity-70" : sel === i ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary",
              )}
            >
              {cell(l)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((i) => (
            <button
              key={i}
              type="button"
              disabled={matched.includes(i) || sel === null}
              onClick={() => {
                if (sel === null) return;
                if (sel === i) {
                  setMatched((m) => [...m, i]);
                  setSel(null);
                } else {
                  setMistakes((m) => m + 1);
                  setWrongFlash(i);
                  setTimeout(() => setWrongFlash(null), 500);
                }
              }}
              className={cn(
                "flex min-h-14 w-full items-center justify-center rounded-xl border-2 px-3 py-2 transition",
                matched.includes(i) ? "border-ok bg-ok-soft opacity-70" : wrongFlash === i ? "border-danger bg-danger-soft" : "border-line bg-surface hover:border-primary",
              )}
            >
              {cell(e.pairs[i][1])}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <>
          <Feedback ok={mistakes <= 1}>{mistakes === 0 ? "Alles in één keer goed." : `${mistakes} fout${mistakes > 1 ? "en" : ""} onderweg.`}</Feedback>
          <NextBar onNext={() => finish({ correct: mistakes <= 1, verdict: mistakes <= 1 ? "correct" : "wrong", expected: e.pairs.map((p) => p.join(" = ")).join(", ") })} />
        </>
      )}
    </div>
  );
}

function Trace({ e, finish }: { e: Extract<Exercise, { kind: "trace" }>; finish: Props["onDone"] }) {
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => setScore(null), [e.id]);
  return (
    <div className="space-y-4">
      <TraceBoard glyph={e.glyph} tip={e.tip} onScore={(s) => setScore(s.score)} />
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => finish(null)}>
          Overslaan
        </Button>
        {score !== null && <Button size="lg" onClick={() => finish({ correct: score >= 0.55, verdict: score >= 0.55 ? "correct" : "wrong", expected: e.glyph })}>Volgende</Button>}
      </div>
    </div>
  );
}

function Speak({ e, finish }: { e: Extract<Exercise, { kind: "speak" }>; finish: Props["onDone"] }) {
  const stt = useSpeechRecognition();
  const [result, setResult] = useState<{ words: { w: string; ok: boolean }[]; score: number } | null>(null);
  const [showText, setShowText] = useState(true);
  useEffect(() => {
    setResult(null);
    stt.setTranscript("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e.id]);
  useEffect(() => {
    if (!stt.listening && stt.transcript) setResult(compareSpoken(stt.transcript, e.text));
  }, [stt.listening, stt.transcript, e.text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-2 p-5 text-center">
        {showText ? <Ar text={e.text} size="xl" /> : <p className="text-sm text-muted">Tekst verborgen: spreek na wat je hoort.</p>}
        {e.nl && <p className="text-sm text-muted">{e.nl}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <AudioButton text={e.text} label="Voorbeeld" />
          <AudioButton text={e.text} label="Langzaam" rate={0.55} />
          <Button variant="ghost" size="sm" onClick={() => setShowText((s) => !s)}>
            <Eye className="h-4 w-4" /> {showText ? "Verberg tekst" : "Toon tekst"}
          </Button>
        </div>
      </div>
      {!stt.supported ? (
        <Notice tone="warn">
          Spraakherkenning werkt niet in deze browser (wel in Chrome, Edge en Safari). Je kunt de zin hardop naspreken, maar hij wordt dan niet beoordeeld en telt niet mee.
        </Notice>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => (stt.listening ? stt.stop() : stt.start())}
            className={cn("flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition active:scale-95", stt.listening ? "animate-pulse bg-danger" : "bg-primary")}
            aria-label={stt.listening ? "Stop opname" : "Start opname"}
          >
            {stt.listening ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
          </button>
          <p className="text-sm text-muted">{stt.listening ? "Ik luister… spreek nu." : "Tik op de microfoon en spreek de zin uit."}</p>
          {stt.interim && <p className="ar text-xl text-muted">{stt.interim}</p>}
          {stt.error && <p className="text-sm text-danger">{stt.error}</p>}
        </div>
      )}
      {result && (
        <Feedback ok={result.score >= 0.75} almost={result.score >= 0.4 && result.score < 0.75}>
          <p>Herkend: <bdi className="ar text-lg">{stt.transcript}</bdi></p>
          <p className="ar mt-1 text-2xl" dir="rtl">
            {result.words.map((w, i) => (
              <span key={i} className={cn("mx-1", w.ok ? "text-ok" : "text-danger underline")}>
                {w.w}
              </span>
            ))}
          </p>
          <p className="mt-1 text-xs text-muted">
            {Math.round(result.score * 100)}% van de woorden herkend. Dit meet of de spraakherkenning je verstaat; het is geen exacte uitspraakbeoordeling. Rode woorden: oefen ze nog eens met
            &quot;Langzaam&quot;.
          </p>
        </Feedback>
      )}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => finish(null)}>
          Overslaan (telt niet mee)
        </Button>
        {result && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setResult(null); stt.setTranscript(""); }}>
              Opnieuw
            </Button>
            <Button size="lg" onClick={() => finish({ correct: result.score >= 0.75, verdict: result.score >= 0.75 ? "correct" : "wrong", expected: e.text })}>
              Volgende
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
