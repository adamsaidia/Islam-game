"use client";
import Link from "next/link";
import { CheckCircle2, CircleDashed, Lock, PlayCircle, SkipForward } from "lucide-react";
import { LESSONS, MODULES, PLANNED } from "@/content/lessons";
import { useStore } from "@/lib/store";
import { Badge, Card, PageHeader } from "@/components/ui";

export default function LessonsPage() {
  const lessons = useStore((s) => s.lessons);
  const done = LESSONS.filter((l) => ["completed", "tested_out"].includes(lessons[l.id]?.status ?? "")).length;
  return (
    <div>
      <PageHeader title="Lessen" subtitle={`Beginnerstraject A0–A1 · ${done}/30 behaald. Een les is pas behaald als je de eindtoets met minstens 80% haalt.`} />
      <div className="space-y-8">
        {MODULES.map((m) => {
          const ls = LESSONS.filter((l) => l.module === m);
          return (
            <section key={m}>
              <h2 className="mb-3 font-display text-xl font-semibold">{m}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ls.map((l) => {
                  const p = lessons[l.id];
                  const st = p?.status ?? "new";
                  return (
                    <Link key={l.id} href={`/lessen/${l.id}`} className="group">
                      <Card className="h-full transition group-hover:border-primary">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted">
                            Les {l.id} · {l.level} · {l.minutes} min
                          </span>
                          {st === "completed" && <CheckCircle2 className="h-5 w-5 text-ok" />}
                          {st === "tested_out" && <SkipForward className="h-5 w-5 text-gold" />}
                          {st === "in_progress" && <PlayCircle className="h-5 w-5 text-primary" />}
                          {st === "new" && <CircleDashed className="h-5 w-5 text-line" />}
                        </div>
                        <p className="font-medium leading-snug">{l.title}</p>
                        <p className="ar mt-1 text-xl text-gold">{l.titleAr}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
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
          );
        })}
        <section>
          <h2 className="mb-1 font-display text-xl font-semibold">Volgende niveaus</h2>
          <p className="mb-3 text-sm text-muted">Deze modules zijn gepland maar nog niet geschreven. Ze zijn daarom niet te openen.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLANNED.map((p) => (
              <Card key={p.title} className="opacity-70">
                <div className="mb-2 flex items-center justify-between">
                  <Badge>{p.level}</Badge>
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <p className="font-medium">{p.title}</p>
                <ul className="mt-2 list-inside list-disc text-sm text-muted">
                  {p.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">In ontwikkeling</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
