"use client";
// Speelt een reeks oefeningen af, met voortgangsbalk en hervatten.
import { useState } from "react";
import type { Exercise } from "@/content/types";
import { ExerciseView, type ExerciseResult } from "./ExerciseView";
import { Progress } from "./ui";
import { SKILL_LABELS } from "@/content/types";

export type SessionResult = { exercise: Exercise; result: ExerciseResult | null };

export function ExerciseSession({
  exercises,
  startAt = 0,
  onAnswer,
  onStep,
  onFinish,
  forceFull,
  title,
}: {
  exercises: Exercise[];
  startAt?: number;
  onAnswer?: (e: Exercise, r: ExerciseResult) => void;
  onStep?: (index: number) => void;
  onFinish: (results: SessionResult[]) => void;
  forceFull?: boolean;
  title?: string;
}) {
  const [i, setI] = useState(Math.min(startAt, Math.max(0, exercises.length - 1)));
  const [results, setResults] = useState<SessionResult[]>([]);
  const e = exercises[i];
  if (!e) return null;

  const done = (r: ExerciseResult | null) => {
    if (r) onAnswer?.(e, r);
    const next = [...results, { exercise: e, result: r }];
    setResults(next);
    if (i + 1 >= exercises.length) onFinish(next);
    else {
      setI(i + 1);
      onStep?.(i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{title}</span>
          <span>
            {i + 1} / {exercises.length} · {SKILL_LABELS[e.skill]}
          </span>
        </div>
        <Progress value={i / exercises.length} />
      </div>
      <ExerciseView key={e.id} exercise={e} onDone={done} forceFull={forceFull} />
    </div>
  );
}
