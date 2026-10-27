"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Award, ClipboardList, RotateCcw } from "lucide-react";
import { LESSONS, getLesson } from "@/content/lessons";
import { SKILL_LABELS, type Exercise, type Skill } from "@/content/types";
import { useStore, PASS_MARK } from "@/lib/store";
import { promptOf } from "@/lib/pools";
import { hashString, seeded, shuffle } from "@/lib/random";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession, type SessionResult } from "@/components/ExerciseSession";
import { Badge, Button, Card, CardTitle, Notice, PageHeader, Progress } from "@/components/ui";

const LEVEL_TESTS: { level: string; lesson: number }[] = [
  { level: "A0–A1 basis", lesson: 30 },
  { level: "A1", lesson: 40 },
  { level: "A2", lesson: 50 },
  { level: "B1", lesson: 58 },
  { level: "B2", lesson: 64 },
  { level: "C1", lesson: 70 },
];

const SIZE = 15;

/** Voortgangstoets: toetsvragen uit lessen die je gedaan hebt, gespreid over vaardigheden. */
function buildProgressTest(lessonIds: number[], seed: number): Exercise[] {
  const rnd = seeded(seed);
  const pool = shuffle(
    LESSONS.filter((l) => lessonIds.includes(l.id)).flatMap((l) => l.test.filter((e) => e.kind !== "trace")),
    rnd,
  );
  // Zo veel mogelijk verschillende vaardigheden: eerst één per vaardigheid, daarna aanvullen.
  const out: Exercise[] = [];
  const seen = new Set<Skill>();
  for (const e of pool) if (!seen.has(e.skill)) { seen.add(e.skill); out.push(e); }
  for (const e of pool) if (out.length < SIZE && !out.includes(e)) out.push(e);
  return shuffle(out.slice(0, SIZE), rnd);
}

export default function TestsPage() {
  const lessons = useStore((s) => s.lessons);
  const tests = useStore((s) => s.tests);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const addTest = useStore((s) => s.addTest);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<SessionResult[] | null>(null);
  useStudyTimer("read_grammar", running);

  const studied = LESSONS.filter((l) => lessons[l.id] && lessons[l.id].status !== "new").map((l) => l.id);
  const items = useMemo(() => buildProgressTest(studied, hashString(String(Date.now() + round))), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const lastProgress = tests.find((t) => t.title === "Voortgangstoets");
  const daysSince = lastProgress ? Math.floor((Date.now() - new Date(lastProgress.date).getTime()) / 864e5) : null;

  const finish = (res: SessionResult[]) => {
    const counted = res.filter((r) => r.result);
    const score = counted.length ? counted.filter((r) => r.result!.correct).length / counted.length : 0;
    const bySkill: Partial<Record<Skill, number>> = {};
    for (const sk of new Set(counted.map((r) => r.exercise.skill))) {
      const xs = counted.filter((r) => r.exercise.skill === sk);
      bySkill[sk] = xs.filter((r) => r.result!.correct).length / xs.length;
    }
    addTest({ id: `progress-${Date.now()}`, kind: "review", title: "Voortgangstoets", score, date: new Date().toISOString(), skills: bySkill });
    setResult(res);
    setRunning(false);
  };

  if (running)
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <ExerciseSession
            key={round}
            title="Voortgangstoets"
            exercises={items}
            onAnswer={(e, r) => recordAnswer({ exerciseId: e.id, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected })}
            onFinish={finish}
          />
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Toetsen" subtitle="Voortgangstoetsen, niveau-evaluaties en al je resultaten. Vaardigheden worden apart beoordeeld." />

      {result && <ResultCard res={result} onAgain={() => { setResult(null); setRound((r) => r + 1); setRunning(true); }} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<ClipboardList className="h-5 w-5 text-primary" />}>Voortgangstoets</CardTitle>
          <p className="text-sm text-muted">
            {SIZE} nieuwe toetsvragen uit lessen die je gestart of behaald hebt, verspreid over zoveel mogelijk vaardigheden. Aanbevolen: elke week één keer.
          </p>
          <p className="mt-2 text-sm">{daysSince === null ? "Je hebt nog geen voortgangstoets gemaakt." : `Laatste keer: ${daysSince === 0 ? "vandaag" : `${daysSince} dag(en) geleden`} · ${Math.round(lastProgress!.score * 100)}%`}</p>
          {studied.length < 2 ? (
            <Notice className="mt-3">Start eerst minstens twee lessen; dan is er genoeg stof voor een eerlijke toets.</Notice>
          ) : (
            <Button className="mt-4" onClick={() => { setResult(null); setRound((r) => r + 1); setRunning(true); }}>
              Start voortgangstoets
            </Button>
          )}
        </Card>

        <Card>
          <CardTitle icon={<Award className="h-5 w-5 text-gold" />}>Niveau-evaluaties</CardTitle>
          <ul className="space-y-2">
            {LEVEL_TESTS.map((t) => {
              const p = lessons[t.lesson];
              const l = getLesson(t.lesson)!;
              return (
                <li key={t.lesson}>
                  <Link href={`/lessen/${t.lesson}`} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 hover:border-primary">
                    <span className="text-sm">
                      <span className="font-medium">{t.level}</span> <span className="text-muted">· les {l.id}</span>
                    </span>
                    {p?.status === "completed" ? (
                      <Badge tone="ok">behaald · {Math.round((p.bestTest ?? 0) * 100)}%</Badge>
                    ) : p?.testAttempts ? (
                      <Badge tone="warn">beste: {Math.round((p.bestTest ?? 0) * 100)}%</Badge>
                    ) : (
                      <Badge>nog niet gemaakt</Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">Een niveau geldt als afgerond als alle lessen van dat niveau behaald zijn (≥ {Math.round(PASS_MARK * 100)}%), inclusief de niveautoets.</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Toetsgeschiedenis</CardTitle>
        {tests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-line">
                  <th className="py-2">Toets</th>
                  <th className="py-2">Datum</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Vaardigheden</th>
                </tr>
              </thead>
              <tbody>
                {tests.slice(0, 50).map((t) => (
                  <tr key={t.id} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-2">{t.title}</td>
                    <td className="py-2 pr-2 text-muted">{new Date(t.date).toLocaleDateString("nl-NL")}</td>
                    <td className="py-2 pr-2">
                      <Badge tone={t.score >= 0.8 ? "ok" : t.score >= 0.6 ? "warn" : "danger"}>{Math.round(t.score * 100)}%</Badge>
                    </td>
                    <td className="py-2 text-xs text-muted">
                      {Object.entries(t.skills ?? {})
                        .map(([k, v]) => `${SKILL_LABELS[k as Skill]} ${Math.round((v ?? 0) * 100)}%`)
                        .join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">Nog geen toetsen gemaakt.</p>
        )}
      </Card>
    </div>
  );
}

function ResultCard({ res, onAgain }: { res: SessionResult[]; onAgain: () => void }) {
  const counted = res.filter((r) => r.result);
  const score = counted.length ? counted.filter((r) => r.result!.correct).length / counted.length : 0;
  const skills = Array.from(new Set(counted.map((r) => r.exercise.skill)));
  const wrong = counted.filter((r) => !r.result!.correct);
  return (
    <Card className={score >= PASS_MARK ? "border-ok/40" : "border-warn/40"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Resultaat voortgangstoets: {Math.round(score * 100)}%</h2>
        <Button variant="outline" size="sm" onClick={onAgain}>
          <RotateCcw className="h-4 w-4" /> Nieuwe toets
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {skills.map((sk) => {
          const xs = counted.filter((r) => r.exercise.skill === sk);
          const c = xs.filter((r) => r.result!.correct).length;
          return (
            <div key={sk}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{SKILL_LABELS[sk]}</span>
                <span className="text-muted">
                  {c}/{xs.length}
                </span>
              </div>
              <Progress value={c / xs.length} tone={c === xs.length ? "ok" : c / xs.length < 0.5 ? "danger" : "primary"} />
            </div>
          );
        })}
      </div>
      {wrong.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-sm font-medium">Opnieuw oefenen</p>
          <ul className="space-y-1 text-sm text-muted">
            {wrong.map((r) => (
              <li key={r.exercise.id}>
                {r.exercise.prompt} → <bdi className="ar text-base text-ink">{r.result!.expected}</bdi>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Deze vragen staan nu bij je fouten en komen terug in de schrijftraining en op het dashboard.</p>
        </div>
      )}
    </Card>
  );
}
