"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Lock, PlayCircle, SkipForward, Award } from "lucide-react";
import { LESSONS, PLANNED } from "@/content/lessons";
import type { Level } from "@/content/types";
import { useStore } from "@/lib/store";
import { nextLessonId } from "@/lib/planner";
import { Badge, Card, PageHeader, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

const LEVELS: { level: Level; label: string }[] = [
  { level: "A0", label: "A0 · Basis" },
  { level: "A1", label: "A1 · Beginner" },
  { level: "A2", label: "A2 · Elementair" },
  { level: "B1", label: "B1 · Zelfstandig" },
  { level: "B2", label: "B2 · Gevorderd" },
  { level: "C1", label: "C1 · Vergevorderd" },
];

const isDone = (s?: string) => s === "completed" || s === "tested_out";

export default function LessonsPage() {
  const lessons = useStore((s) => s.lessons);
  const next = nextLessonId(useStore.getState());
  const [level, setLevel] = useState<Level>("A0");
  useEffect(() => {
    const l = LESSONS.find((x) => x.id === next)?.level;
    if (l) setLevel(l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = LESSONS.filter((l) => isDone(lessons[l.id]?.status)).length;
  const inLevel = LESSONS.filter((l) => l.level === level);
  const modules = Array.from(new Set(inLevel.map((l) => l.module)));

  return (
    <div>
      <PageHeader title="Lessen" subtitle={`Curriculum A0–C1 · ${done}/${LESSONS.length} behaald. Een les is pas behaald als je de eindtoets met minstens 80% haalt.`} />
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {LEVELS.map((lv) => {
          const ls = LESSONS.filter((l) => l.level === lv.level);
          const d = ls.filter((l) => isDone(lessons[l.id]?.status)).length;
          return (
            <button
              key={lv.level}
              onClick={() => setLevel(lv.level)}
              className={cn("min-w-36 shrink-0 rounded-2xl border px-4 py-3 text-left transition", level === lv.level ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary")}
            >
              <span className="block text-sm font-medium">{lv.label}</span>
              <span className="mb-1.5 block text-xs text-muted">
                {d}/{ls.length} lessen
              </span>
              <Progress value={ls.length ? d / ls.length : 0} tone={d === ls.length ? "ok" : "primary"} />
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {modules.map((m) => (
          <section key={m}>
            <h2 className="mb-3 font-display text-xl font-semibold">{m}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inLevel
                .filter((l) => l.module === m)
                .map((l) => {
                  const p = lessons[l.id];
                  const st = p?.status ?? "new";
                  const isTest = l.title.startsWith("Niveautoets");
                  return (
                    <Link key={l.id} href={`/lessen/${l.id}`} className="group">
                      <Card className={cn("h-full transition group-hover:border-primary", l.id === next && "ring-2 ring-gold/50", isTest && "border-gold/40")}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted">
                            Les {l.id} · {l.minutes} min
                          </span>
                          {st === "completed" && <CheckCircle2 className="h-5 w-5 text-ok" />}
                          {st === "tested_out" && <SkipForward className="h-5 w-5 text-gold" />}
                          {st === "in_progress" && <PlayCircle className="h-5 w-5 text-primary" />}
                          {st === "new" && (isTest ? <Award className="h-5 w-5 text-gold" /> : <CircleDashed className="h-5 w-5 text-line" />)}
                        </div>
                        <p className="font-medium leading-snug">{l.title}</p>
                        <p className="ar mt-1 text-xl text-gold">{l.titleAr}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {l.id === next && <Badge tone="gold">Volgende</Badge>}
                          {st === "completed" && <Badge tone="ok">Behaald {p?.bestTest !== undefined ? `· ${Math.round(p.bestTest * 100)}%` : ""}</Badge>}
                          {st === "tested_out" && <Badge tone="gold">Overgeslagen via instaptoets</Badge>}
                          {st === "in_progress" && <Badge tone="primary">Bezig</Badge>}
                          {p && p.testAttempts > 0 && st !== "completed" && <Badge tone="warn">Toets nog niet gehaald</Badge>}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
        {level === "C1" && PLANNED.length > 0 && (
          <section>
            <h2 className="mb-1 font-display text-xl font-semibold">Toekomstige uitbreidingen</h2>
            <p className="mb-3 text-sm text-muted">Deze modules zijn gepland maar nog niet geschreven. Ze zijn daarom niet te openen.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANNED.map((p) => (
                <Card key={p.title} className="opacity-70">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{p.title}</span>
                    <Lock className="h-4 w-4 text-muted" />
                  </div>
                  <ul className="list-inside list-disc text-sm text-muted">
                    {p.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">In ontwikkeling</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
