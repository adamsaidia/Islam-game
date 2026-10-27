"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, BookText, Languages, Mic, Square } from "lucide-react";
import { STAGES, TEXTS, type ReadingText, type ReadingStage } from "@/content/texts";
import { useStore } from "@/lib/store";
import { compareSpoken, type HarakatMode } from "@/lib/arabic";
import { useSpeechRecognition } from "@/lib/speech";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { AudioButton, ClickableArabic } from "@/components/arabic";
import { Badge, Button, Card, PageHeader, Segmented, Switch, Notice } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function ReadingPage() {
  const [open, setOpen] = useState<ReadingText | null>(null);
  const lessons = useStore((s) => s.lessons);
  const tests = useStore((s) => s.tests);
  useStudyTimer("read_grammar");

  if (open) return <Reader text={open} onBack={() => setOpen(null)} />;

  const passedLesson = (id: number) => ["completed", "tested_out"].includes(lessons[id]?.status ?? "");
  const readDone = (id: string) => tests.some((t) => t.kind === "review" && t.title === `Leestekst: ${TEXTS.find((x) => x.id === id)?.title}` && t.score >= 0.8);

  return (
    <div>
      <PageHeader title="Lezen" subtitle="Bouw stap voor stap af: van volledige harakat naar zelfstandig lezen zonder klinkertekens en zonder vertaling." />
      <div className="space-y-6">
        {([1, 2, 3, 4, 5] as ReadingStage[]).map((st) => {
          const items = TEXTS.filter((t) => t.stage === st);
          if (!items.length) return null;
          return (
            <section key={st}>
              <h2 className="font-display text-lg font-semibold">{STAGES[st].title}</h2>
              <p className="mb-3 text-sm text-muted">{STAGES[st].desc}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((t) => (
                  <button key={t.id} onClick={() => setOpen(t)} className="text-left">
                    <Card className="h-full transition hover:border-primary">
                      <div className="flex items-center justify-between">
                        <BookText className="h-5 w-5 text-primary" />
                        <div className="flex gap-1">
                          {readDone(t.id) && <Badge tone="ok">begrepen</Badge>}
                          {!passedLesson(t.minLesson) && <Badge>na les {t.minLesson}</Badge>}
                        </div>
                      </div>
                      <p className="mt-2 font-medium">{t.title}</p>
                      <p className="ar mt-1 line-clamp-1 text-lg text-muted">{t.sentences[0].ar}</p>
                    </Card>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Reader({ text, onBack }: { text: ReadingText; onBack: () => void }) {
  const stage = STAGES[text.stage];
  const [mode, setMode] = useState<HarakatMode>(stage.harakat);
  const [showNl, setShowNl] = useState(stage.translation);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const recordAnswer = useStore((s) => s.recordAnswer);
  const addTest = useStore((s) => s.addTest);
  const [saved, setSaved] = useState(false);
  const skill = mode === "none" ? "reading_unvowelled" : "reading";

  const allAnswered = Object.keys(answers).length === text.questions.length;
  const correct = text.questions.filter((q, i) => answers[i] === q.answer).length;

  useEffect(() => {
    if (allAnswered && !saved) {
      setSaved(true);
      const score = correct / text.questions.length;
      addTest({ id: `read-${text.id}-${Date.now()}`, kind: "review", title: `Leestekst: ${text.title}`, score, date: new Date().toISOString(), skills: { [skill]: score } });
    }
  }, [allAnswered, saved, correct, text, skill, addTest]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alle teksten
      </button>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{stage.title}</p>
        <h1 className="font-display text-2xl font-semibold">{text.title}</h1>
      </div>
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "full", label: "Harakat" },
            { value: "partial", label: "Deels" },
            { value: "none", label: "Zonder" },
          ]}
        />
        <div className="min-w-48">
          <Switch checked={showNl} onChange={setShowNl} label="Vertaling tonen" />
        </div>
        <AudioButton text={text.sentences.map((s) => s.ar).join(" ")} label="Hele tekst" />
      </Card>
      <p className="text-xs text-muted">Tik op een woord voor de betekenis en uitspraak. Je kunt het woord direct bewaren als flashcard.</p>
      <Card className="space-y-4">
        {text.sentences.map((s, i) => (
          <Sentence key={i} ar={s.ar} nl={s.nl} showNl={showNl} mode={mode} gloss={text.gloss} />
        ))}
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold">Begripsvragen</h2>
        <div className="space-y-4">
          {text.questions.map((q, i) => (
            <div key={i}>
              <p className="mb-2 text-sm font-medium">{q.q}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {q.options.map((o, j) => {
                  const picked = answers[i];
                  const done = picked !== undefined;
                  return (
                    <button
                      key={j}
                      disabled={done}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [i]: j }));
                        recordAnswer({ exerciseId: `R-${text.id}-${i}`, skill, correct: j === q.answer, verdict: j === q.answer ? "correct" : "wrong", prompt: `${text.title}: ${q.q}`, expected: q.options[q.answer] });
                      }}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2 text-left text-sm",
                        !done && "border-line hover:border-primary",
                        done && j === q.answer && "border-ok bg-ok-soft",
                        done && j === picked && j !== q.answer && "border-danger bg-danger-soft",
                        done && j !== picked && j !== q.answer && "border-line opacity-50",
                      )}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {allAnswered && (
          <Notice tone={correct / text.questions.length >= 0.8 ? "ok" : "warn"} className="mt-4">
            {correct} van {text.questions.length} goed.{" "}
            {correct / text.questions.length >= 0.8 ? (mode === "none" ? "Uitstekend: je begrijpt de tekst zonder harakat." : "Probeer de tekst nu eens zonder harakat.") : "Lees de tekst nog eens met vertaling en probeer het opnieuw."}
          </Notice>
        )}
      </Card>
    </div>
  );
}

function Sentence({ ar, nl, showNl, mode, gloss }: { ar: string; nl: string; showNl: boolean; mode: HarakatMode; gloss: [string, string][] }) {
  const stt = useSpeechRecognition();
  const [result, setResult] = useState<ReturnType<typeof compareSpoken> | null>(null);
  const [peek, setPeek] = useState(false);
  useEffect(() => {
    if (!stt.listening && stt.transcript) setResult(compareSpoken(stt.transcript, ar));
  }, [stt.listening, stt.transcript, ar]);
  return (
    <div className="border-b border-line pb-4 last:border-0 last:pb-0">
      <ClickableArabic text={ar} gloss={gloss} force={mode} size="lg" />
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <AudioButton text={ar} label="" />
        {stt.supported && (
          <button
            onClick={() => (stt.listening ? stt.stop() : stt.start())}
            className={cn("inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm", stt.listening ? "bg-danger text-white" : "text-primary hover:bg-primary-soft")}
            title="Lees deze zin hardop voor"
          >
            {stt.listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />} Hardop lezen
          </button>
        )}
        {!showNl && (
          <button onClick={() => setPeek((p) => !p)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted hover:bg-surface-2">
            <Languages className="h-3.5 w-3.5" /> {peek ? "verberg" : "spiek"}
          </button>
        )}
      </div>
      {(showNl || peek) && <p className="mt-1 text-sm text-muted">{nl}</p>}
      {stt.error && <p className="mt-1 text-xs text-danger">{stt.error}</p>}
      {result && (
        <p className="mt-1 text-sm">
          <span className={result.score >= 0.75 ? "text-ok" : "text-warn"}>{Math.round(result.score * 100)}% herkend</span>
          {result.words.some((w) => !w.ok) && (
            <>
              {" "}
              · oefen: <bdi className="ar text-lg">{result.words.filter((w) => !w.ok).map((w) => w.w).join("، ")}</bdi>
            </>
          )}
        </p>
      )}
    </div>
  );
}
