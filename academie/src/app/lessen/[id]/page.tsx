"use client";
import { promptOf } from "@/lib/pools";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { getLesson } from "@/content/lessons";
import { SKILL_LABELS, type Skill, type Exercise } from "@/content/types";
import { useStore, PASS_MARK, SKILL_BLOCK } from "@/lib/store";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession, type SessionResult } from "@/components/ExerciseSession";
import { Ar, AudioButton, Rich, Translit } from "@/components/arabic";
import { Badge, Button, Card, LinkButton, Notice } from "@/components/ui";

type Phase = "intro" | "exercises" | "review" | "test" | "result";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  return <LessonView key={id} lessonId={Number(id)} />;
}

function LessonView({ lessonId }: { lessonId: number }) {
  const lesson = getLesson(lessonId);
  const router = useRouter();
  const progress = useStore((s) => s.lessons[lessonId]);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const setLessonStep = useStore((s) => s.setLessonStep);
  const finishLessonTest = useStore((s) => s.finishLessonTest);
  const addWords = useStore((s) => s.addWords);
  const resetLesson = useStore((s) => s.resetLesson);

  const n = lesson?.exercises.length ?? 0;
  const initialPhase: Phase = !progress || progress.step === 0 ? "intro" : progress.step <= n ? "exercises" : "review";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [testResults, setTestResults] = useState<SessionResult[] | null>(null);
  const [exerciseResults, setExerciseResults] = useState<SessionResult[] | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  const mainBlock = lesson ? SKILL_BLOCK[lesson.skills[0]] : "read_grammar";
  useStudyTimer(mainBlock, phase !== "result");
  const forceFull = lessonId <= 14 ? "full" : undefined;

  const score = useMemo(() => {
    if (!testResults) return null;
    const counted = testResults.filter((r) => r.result);
    const correct = counted.filter((r) => r.result!.correct).length;
    const bySkill: Partial<Record<Skill, { c: number; n: number }>> = {};
    for (const r of counted) {
      const b = (bySkill[r.exercise.skill] ??= { c: 0, n: 0 });
      b.n++;
      if (r.result!.correct) b.c++;
    }
    return { counted: counted.length, correct, total: testResults.length, value: counted.length ? correct / counted.length : 0, bySkill };
  }, [testResults]);

  if (!lesson) {
    return (
      <div className="space-y-4">
        <p>Deze les bestaat niet.</p>
        <LinkButton href="/lessen">Terug naar lessen</LinkButton>
      </div>
    );
  }

  const record = (phaseName: "exercise" | "test") => (e: Exercise, r: { correct: boolean; verdict: string; expected: string }) =>
    recordAnswer({ exerciseId: e.id, lessonId, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected, phase: phaseName });

  const learnWords = () =>
    addWords(lesson.words.map((w) => ({ id: w.id, ar: w.ar, nl: w.nl, tr: w.tr, info: w.info, source: "les" as const, verified: true })));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link href="/lessen" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Lessen
        </Link>
        <div className="flex gap-2">
          {progress?.status === "completed" && <Badge tone="ok">Behaald</Badge>}
          {progress?.status === "tested_out" && <Badge tone="gold">Overgeslagen via instaptoets</Badge>}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Les {lesson.id} · {lesson.module} · {lesson.level}
        </p>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{lesson.title}</h1>
        <p className="ar mt-1 text-2xl text-gold">{lesson.titleAr}</p>
      </div>

      {phase === "intro" && (
        <div className="space-y-5">
          <Card className="border-primary/30 bg-primary-soft/50">
            <p className="text-sm">
              <span className="font-semibold">Leerdoel:</span> {lesson.goal}
            </p>
            <p className="mt-1 text-xs text-muted">
              {lesson.exercises.length} oefeningen · eindtoets van {lesson.test.length} vragen · behaald bij {Math.round(PASS_MARK * 100)}%
            </p>
          </Card>
          {lesson.sections.map((sec, i) => (
            <Card key={i}>
              <h2 className="mb-2 font-display text-lg font-semibold">
                <Rich text={sec.title} force={forceFull} />
              </h2>
              <div className="space-y-2 text-[15px] leading-relaxed">
                {sec.body.map((b, j) => (
                  <p key={j}>
                    <Rich text={b} force={forceFull} />
                  </p>
                ))}
              </div>
              {sec.table && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-max text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-muted">
                        {sec.table[0].map((h) => (
                          <th key={h} className="px-2 py-1.5 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.table.slice(1).map((row, r) => (
                        <tr key={r} className="border-b border-line/60">
                          {row.map((c, k) => (
                            <td key={k} className="px-2 py-1.5">
                              <Rich text={c} force={forceFull} arClass="text-xl sm:text-2xl" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sec.examples && (
                <ul className="mt-3 space-y-2">
                  {sec.examples.map((ex, k) => (
                    <li key={k} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2">
                      <div className="flex flex-col">
                        <Ar text={ex.ar} size="md" force={forceFull} />
                        <Translit>{ex.tr}</Translit>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">{ex.nl}</span>
                        <AudioButton text={ex.ar.replace(/[=+]/g, " ")} label="" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
          <Card>
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
              <BookOpen className="h-5 w-5 text-primary" /> Woorden in deze les
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {lesson.words.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                  <div>
                    <Ar text={w.ar} size="md" force={forceFull} />
                    <div className="text-sm">
                      {w.nl} <Translit>· {w.tr}</Translit>
                    </div>
                    {w.info && <div className="text-xs text-muted"><Rich text={w.info} arClass="text-base" /></div>}
                  </div>
                  <AudioButton text={w.ar} label="" />
                </li>
              ))}
            </ul>
          </Card>
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={() => {
                setLessonStep(lessonId, 1);
                setPhase("exercises");
              }}
            >
              Start oefeningen <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "exercises" && (
        <Card>
          <ExerciseSession
            title="Oefeningen"
            exercises={lesson.exercises}
            startAt={Math.max(0, (progress?.step ?? 1) - 1)}
            forceFull={!!forceFull}
            onAnswer={record("exercise")}
            onStep={(i) => setLessonStep(lessonId, i + 1)}
            onFinish={(res) => {
              setLessonStep(lessonId, n + 1);
              setExerciseResults(res);
              learnWords();
              setPhase("review");
            }}
          />
        </Card>
      )}

      {phase === "review" && (
        <div className="space-y-5">
          <Card>
            <h2 className="mb-2 font-display text-xl font-semibold">Oefeningen afgerond</h2>
            {exerciseResults ? (
              <p className="text-sm">
                {exerciseResults.filter((r) => r.result?.correct).length} van {exerciseResults.filter((r) => r.result).length} goed. Fouten komen terug in je herhalingsoefeningen.
              </p>
            ) : (
              <p className="text-sm">Je had de oefeningen al gemaakt.</p>
            )}
            <p className="mt-2 text-sm text-muted">De woorden van deze les staan nu in je woordenboek en flashcards.</p>
          </Card>
          <Notice>
            De eindtoets bevat {lesson.test.length} nieuwe vragen. Je hebt de les behaald bij minimaal {Math.round(PASS_MARK * 100)}% goed. Overgeslagen spreekvragen (bijv. zonder microfoon) tellen niet mee.
          </Notice>
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetLesson(lessonId);
                setPhase("intro");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Les opnieuw doen
            </Button>
            <Button size="lg" onClick={() => setPhase("test")}>
              Start eindtoets <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "test" && (
        <Card>
          <ExerciseSession
            title="Eindtoets"
            exercises={lesson.test}
            forceFull={!!forceFull}
            onAnswer={record("test")}
            onFinish={(res) => {
              setTestResults(res);
              const counted = res.filter((r) => r.result);
              const minCounted = Math.ceil(lesson.test.length * 0.7);
              const value = counted.length ? counted.filter((r) => r.result!.correct).length / counted.length : 0;
              const bySkill: Partial<Record<Skill, number>> = {};
              for (const sk of new Set(counted.map((r) => r.exercise.skill))) {
                const xs = counted.filter((r) => r.exercise.skill === sk);
                bySkill[sk] = xs.filter((r) => r.result!.correct).length / xs.length;
              }
              const ok = counted.length >= minCounted ? finishLessonTest(lessonId, `Les ${lessonId}: ${lesson.title}`, value, bySkill) : false;
              setPassed(ok);
              setPhase("result");
            }}
          />
        </Card>
      )}

      {phase === "result" && score && (
        <div className="space-y-5">
          <Card className={passed ? "border-ok/40 bg-ok-soft/50" : "border-warn/40 bg-warn-soft/50"}>
            <div className="flex items-center gap-3">
              {passed ? <CheckCircle2 className="h-8 w-8 text-ok" /> : <XCircle className="h-8 w-8 text-warn" />}
              <div>
                <h2 className="font-display text-xl font-semibold">{passed ? "Les behaald!" : "Nog niet behaald"}</h2>
                <p className="text-sm">
                  {score.correct} van {score.counted} goed ({Math.round(score.value * 100)}%)
                  {score.counted < score.total && ` · ${score.total - score.counted} overgeslagen`}
                </p>
              </div>
            </div>
            {!passed && score.counted < Math.ceil(lesson.test.length * 0.7) && <p className="mt-2 text-sm">Te veel vragen overgeslagen om de toets te beoordelen.</p>}
          </Card>
          <Card>
            <h3 className="mb-2 font-medium">Per vaardigheid</h3>
            <ul className="space-y-1 text-sm">
              {Object.entries(score.bySkill).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span>{SKILL_LABELS[k as Skill]}</span>
                  <span className={v!.c === v!.n ? "text-ok" : "text-warn"}>
                    {v!.c}/{v!.n}
                  </span>
                </li>
              ))}
            </ul>
            {testResults!.some((r) => r.result && !r.result.correct) && (
              <>
                <h3 className="mb-2 mt-4 font-medium">Opnieuw oefenen</h3>
                <ul className="space-y-2 text-sm">
                  {testResults!
                    .filter((r) => r.result && !r.result.correct)
                    .map((r) => (
                      <li key={r.exercise.id} className="rounded-xl bg-surface-2 px-3 py-2">
                        <Rich text={r.exercise.prompt} /> → <Rich text={r.result!.expected} arClass="text-lg" />
                      </li>
                    ))}
                </ul>
              </>
            )}
          </Card>
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTestResults(null);
                setPhase("test");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Toets opnieuw
            </Button>
            {passed && getLesson(lessonId + 1) && (
              <Button size="lg" onClick={() => router.push(`/lessen/${lessonId + 1}`)}>
                Volgende les <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {!passed && (
              <Button
                onClick={() => {
                  resetLesson(lessonId);
                  setPhase("intro");
                }}
              >
                Les herhalen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
