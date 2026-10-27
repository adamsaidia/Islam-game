"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PenLine, Sparkles, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildSession, mistakeExercises, promptOf } from "@/lib/pools";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { LETTERS } from "@/content/letters";
import { letterForm } from "@/lib/arabic";
import { callAi, fetchAiStatus, AiError } from "@/lib/ai/client";
import type { CorrectionResult } from "@/lib/ai/schemas";
import { ExerciseSession } from "@/components/ExerciseSession";
import { TraceBoard } from "@/components/TraceBoard";
import { ArabicInput } from "@/components/ArabicInput";
import { Ar, Rich } from "@/components/arabic";
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Segmented } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/content/types";

type Mode = "training" | "bord" | "vrij";

export default function WritingPage() {
  return (
    <Suspense>
      <Writing />
    </Suspense>
  );
}

function Writing() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("training");
  useStudyTimer("writing");
  return (
    <div>
      <PageHeader title="Schrijven" subtitle="Zelf Arabisch produceren: letters, woorden, zinnen en eigen teksten.">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "training", label: "Training" },
            { value: "bord", label: "Schrijfbord" },
            { value: "vrij", label: "Vrij schrijven" },
          ]}
        />
      </PageHeader>
      {mode === "training" && <Training mistakesOnly={params.get("mode") === "herhaling"} />}
      {mode === "bord" && <Board />}
      {mode === "vrij" && <FreeWriting />}
    </div>
  );
}

function Training({ mistakesOnly }: { mistakesOnly: boolean }) {
  const state = useStore();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<{ c: number; n: number } | null>(null);
  const exercises = useMemo<Exercise[]>(
    () =>
      mistakesOnly
        ? mistakeExercises(state, undefined, 12)
        : buildSession(state, { skills: ["writing", "spelling", "grammar"], kinds: ["type", "order"], size: 10, seed: Date.now() + round, includeDictionary: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, mistakesOnly],
  );

  if (!exercises.length)
    return (
      <Card className="space-y-3 text-center">
        <PenLine className="mx-auto h-8 w-8 text-muted" />
        <p className="font-medium">{mistakesOnly ? "Geen openstaande fouten. Goed bezig!" : "Nog geen schrijfstof"}</p>
        <p className="text-sm text-muted">De training gebruikt stof uit lessen die je gestart hebt. Begin met een les, of oefen intussen op het schrijfbord.</p>
        <LinkButton href="/lessen">Naar de lessen</LinkButton>
      </Card>
    );

  if (done)
    return (
      <Card className="space-y-3 text-center">
        <p className="font-display text-xl font-semibold">
          {done.c} van {done.n} goed
        </p>
        <p className="text-sm text-muted">Foute antwoorden komen terug in een volgende training en in &quot;Aandachtspunten&quot; op het dashboard.</p>
        <Button
          onClick={() => {
            setDone(null);
            setRound((r) => r + 1);
          }}
        >
          <RotateCcw className="h-4 w-4" /> Nieuwe ronde
        </Button>
      </Card>
    );

  return (
    <Card>
      <p className="mb-4 text-sm text-muted">{mistakesOnly ? "Je eerdere fouten, opnieuw." : "Dictee, vertalen naar het Arabisch en zinnen bouwen, met je fouten voorop."}</p>
      <ExerciseSession
        key={round}
        title={mistakesOnly ? "Herhaling" : "Schrijftraining"}
        exercises={exercises}
        onAnswer={(e, r) => recordAnswer({ exerciseId: e.id, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected })}
        onFinish={(res) => setDone({ c: res.filter((r) => r.result?.correct).length, n: res.filter((r) => r.result).length })}
      />
    </Card>
  );
}

function Board() {
  const [glyph, setGlyph] = useState("ب");
  const [pos, setPos] = useState<"isolated" | "initial" | "medial" | "final">("isolated");
  const letter = LETTERS.find((l) => l.char === glyph);
  const effPos = letter && !letter.connects ? (pos === "initial" ? "isolated" : pos === "medial" ? "final" : pos) : pos;
  const shown = glyph.length > 1 ? glyph : letterForm(glyph, effPos);
  const words = ["لا", "باب", "بيت", "كتاب", "سلام", "شكرا"];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <p className="mb-2 text-sm font-medium">Kies een letter</p>
        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10" dir="rtl">
          {LETTERS.map((l) => (
            <button key={l.char} onClick={() => setGlyph(l.char)} className={cn("ar rounded-lg border py-1 text-2xl", glyph === l.char ? "border-primary bg-primary-soft" : "border-line bg-surface")}>
              {l.char}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-sm font-medium">Of een woord</p>
        <div className="flex flex-wrap gap-1.5" dir="rtl">
          {words.map((w) => (
            <button key={w} onClick={() => setGlyph(w)} className={cn("ar rounded-lg border px-3 py-1 text-xl", glyph === w ? "border-primary bg-primary-soft" : "border-line bg-surface")}>
              {w}
            </button>
          ))}
        </div>
        {glyph.length === 1 && (
          <div className="mt-4">
            <Segmented
              value={pos}
              onChange={setPos}
              options={[
                { value: "isolated", label: "Los" },
                { value: "initial", label: "Begin" },
                { value: "medial", label: "Midden" },
                { value: "final", label: "Eind" },
              ]}
            />
            {letter && !letter.connects && (pos === "initial" || pos === "medial") && <p className="mt-2 text-xs text-muted">{letter.name} verbindt niet naar links; begin- en middenvorm zijn gelijk aan de losse/eindvorm.</p>}
          </div>
        )}
        {letter && glyph.length === 1 && (
          <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
            <p className="font-medium">
              {letter.name} <bdi className="ar text-lg">{letter.nameAr}</bdi>
            </p>
            <p className="text-muted">{letter.writeTip}</p>
          </div>
        )}
      </Card>
      <Card>
        <TraceBoard glyph={shown} />
      </Card>
    </div>
  );
}

const PROMPTS = [
  { nl: "Stel jezelf voor: naam, herkomst, woonplaats (3–4 zinnen).", level: "A1" },
  { nl: "Beschrijf je familie (4–5 zinnen).", level: "A1" },
  { nl: "Beschrijf je huis of je kamer.", level: "A1" },
  { nl: "Wat eet en drink je 's ochtends?", level: "A1" },
  { nl: "Schrijf een kort berichtje aan een vriend: hoe gaat het, wat doe je deze week?", level: "A2" },
  { nl: "Vertel over je dag gisteren (verleden tijd).", level: "A2" },
  { nl: "Waarom leer je Arabisch? Schrijf een korte alinea.", level: "B1" },
];

const CHECKLIST = [
  "Staat de hamza goed (أنا, أين, أسكن)?",
  "Eindigen vrouwelijke woorden op ة (en niet op ه)?",
  "Komt het bijvoeglijk naamwoord overeen in geslacht (البنت جميلة)?",
  "Heeft een bepaald zelfstandig naamwoord ال, en geen ال als er een bezittelijke uitgang achter staat?",
  "Staat het werkwoord 'zijn' er níet in de tegenwoordige tijd (أنا طالب)?",
];

function FreeWriting() {
  const [prompt, setPrompt] = useState(PROMPTS[0].nl);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const aiLevel = useStore((s) => s.settings.aiLevel);
  useEffect(() => {
    fetchAiStatus().then((s) => setAiReady(s.configured));
  }, []);

  const correct = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await callAi<CorrectionResult>("correct", { text, instruction: prompt }));
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Correctie mislukt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-3">
        <label className="text-sm font-medium">Opdracht</label>
        <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          {PROMPTS.map((p) => (
            <option key={p.nl} value={p.nl}>
              [{p.level}] {p.nl}
            </option>
          ))}
        </select>
        <ArabicInput value={text} onChange={setText} multiline placeholder="اكتب نصك هنا…" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{text.trim() ? text.trim().split(/\s+/).length : 0} woorden</span>
          <Button onClick={correct} disabled={!text.trim() || loading || !aiReady || aiLevel === "off"}>
            <Sparkles className="h-4 w-4" /> {loading ? "Bezig met corrigeren…" : "Laat AI corrigeren"}
          </Button>
        </div>
        {aiReady === false && <Notice tone="warn">AI-correctie is niet geconfigureerd (geen API-sleutel op de server). Gebruik intussen de checklist hiernaast.</Notice>}
        {aiReady && aiLevel === "off" && <Notice>AI staat uit in je instellingen.</Notice>}
        {error && <Notice tone="danger">{error}</Notice>}
      </Card>
      <div className="space-y-4">
        {result ? (
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Correctie</h2>
              <Badge tone={result.confidence === "hoog" ? "ok" : result.confidence === "middel" ? "warn" : "danger"}>AI-zekerheid: {result.confidence}</Badge>
            </div>
            <div className="rounded-xl bg-ok-soft p-3">
              <p className="mb-1 text-xs text-muted">Verbeterde tekst</p>
              <Ar text={result.corrected} size="md" force="full" />
            </div>
            {result.errors.length ? (
              <ul className="space-y-2 text-sm">
                {result.errors.map((er, i) => (
                  <li key={i} className="rounded-xl border border-line p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="danger">{er.type}</Badge>
                      <bdi className="ar text-lg text-danger line-through">{er.original}</bdi>→<bdi className="ar text-lg text-ok">{er.corrected}</bdi>
                    </div>
                    <p className="mt-1">
                      <Rich text={er.explanation} />
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Notice tone="ok">Geen fouten gevonden.</Notice>
            )}
            <p className="text-sm">
              <Rich text={result.feedback_nl} />
            </p>
            <p className="text-xs text-muted">AI-correcties zijn hulp, geen onbetwistbare lesstof. Bij twijfel: vraag de AI-docent naar de regel, of controleer in een grammaticaboek.</p>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-2 font-display text-lg font-semibold">Controleer jezelf</h2>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {CHECKLIST.map((c) => (
                <li key={c}>
                  <Rich text={c} arClass="text-base" />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
