"use client";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { PLACEMENT } from "@/content/placement";
import { getLesson, LESSONS } from "@/content/lessons";
import { SKILL_LABELS, type Skill } from "@/content/types";
import { useStore, PASS_MARK } from "@/lib/store";
import { sttSupported } from "@/lib/speech";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession, type SessionResult } from "@/components/ExerciseSession";
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Progress } from "@/components/ui";

type Phase = { kind: "start" } | { kind: "intro"; i: number } | { kind: "run"; i: number } | { kind: "done" };

export default function PlacementPage() {
  const placement = useStore((s) => s.placement);
  const savePlacement = useStore((s) => s.savePlacement);
  const [phase, setPhase] = useState<Phase>({ kind: "start" });
  const [results, setResults] = useState<Record<string, SessionResult[]>>({});
  useStudyTimer("read_grammar", phase.kind === "run");

  const sections = useMemo(() => PLACEMENT.filter((s) => !(s.optional && !sttSupported())), []);

  const finish = (all: Record<string, SessionResult[]>) => {
    const sectionScores: Record<string, number> = {};
    const skillAgg: Partial<Record<Skill, { c: number; n: number }>> = {};
    for (const sec of sections) {
      const rs = (all[sec.key] ?? []).filter((r) => r.result);
      sectionScores[sec.key] = rs.length ? rs.filter((r) => r.result!.correct).length / rs.length : 0;
      for (const r of rs) {
        const a = (skillAgg[r.exercise.skill] ??= { c: 0, n: 0 });
        a.n++;
        if (r.result!.correct) a.c++;
      }
    }
    const skills: Partial<Record<Skill, number>> = {};
    for (const [k, v] of Object.entries(skillAgg)) skills[k as Skill] = v!.c / v!.n;
    const testedOut = sections.filter((s) => sectionScores[s.key] >= PASS_MARK && (all[s.key] ?? []).some((r) => r.result)).flatMap((s) => s.lessons);
    // Luisteren/spreken (les 28–29) en A1+ alleen overslaan als ook de basisgrammatica beheerst wordt.
    const safe = testedOut.filter((id) => id < 28 || sectionScores.grammar >= PASS_MARK);
    const startLesson = LESSONS.map((l) => l.id).find((id) => !safe.includes(id)) ?? LESSONS[LESSONS.length - 1].id;
    savePlacement({ date: new Date().toISOString(), skills, sections: sectionScores, startLesson }, safe);
    setPhase({ kind: "done" });
  };

  if (phase.kind === "start") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Instaptoets" subtitle="Ongeveer 20 minuten · 9 onderdelen · je resultaten bepalen je startpunt" />
        <Card className="space-y-4">
          <p className="text-sm leading-relaxed">
            Je kent het Arabische alfabet al grotendeels, maar het is weggezakt. Deze toets meet elke vaardigheid apart: letters, lezen met en zonder harakat, spelling, woordenschat,
            grammatica, luisteren en spreken. Onderdelen die je beheerst (≥ 80%) worden overgeslagen; die lessen blijven wel beschikbaar.
          </p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.key} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                <ClipboardCheck className="h-4 w-4 text-primary" /> {s.title} <span className="ml-auto text-xs text-muted">{s.items.length} vragen</span>
              </li>
            ))}
          </ul>
          {!sttSupported() && <Notice tone="warn">Je browser ondersteunt geen spraakherkenning, dus het onderdeel Spreken wordt overgeslagen (niet beoordeeld).</Notice>}
          {placement && <Notice>Je hebt de instaptoets al gemaakt op {new Date(placement.date).toLocaleDateString("nl-NL")}. Opnieuw maken overschrijft je startpunt; behaalde lessen blijven behaald.</Notice>}
          <Notice>Weet je een antwoord niet? Gok dan niet, maar kies het antwoord dat het meest waarschijnlijk is of typ wat je denkt. Zo wordt je niveau eerlijk gemeten.</Notice>
          <div className="flex justify-end">
            <Button size="lg" onClick={() => setPhase({ kind: "intro", i: 0 })}>
              Begin <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase.kind === "intro" || phase.kind === "run") {
    const sec = sections[phase.i];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted">
            <span>
              Onderdeel {phase.i + 1} van {sections.length}
            </span>
            <span>{sec.title}</span>
          </div>
          <Progress value={phase.i / sections.length} tone="gold" />
        </div>
        {phase.kind === "intro" ? (
          <Card className="space-y-4 text-center">
            <h2 className="font-display text-2xl font-semibold">{sec.title}</h2>
            <p className="text-sm text-muted">{sec.intro}</p>
            <Button size="lg" onClick={() => setPhase({ kind: "run", i: phase.i })}>
              Start onderdeel
            </Button>
          </Card>
        ) : (
          <Card>
            <ExerciseSession
              key={sec.key}
              title={sec.title}
              exercises={sec.items}
              forceFull={sec.key === "reading"}
              onFinish={(res) => {
                const all = { ...results, [sec.key]: res };
                setResults(all);
                if (phase.i + 1 < sections.length) setPhase({ kind: "intro", i: phase.i + 1 });
                else finish(all);
              }}
            />
          </Card>
        )}
      </div>
    );
  }

  // Resultaat
  const p = useStore.getState().placement!;
  const start = getLesson(p.startLesson);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Jouw resultaat" subtitle="Je persoonlijke leertraject is aangepast." />
      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold">Per onderdeel</h2>
        <ul className="space-y-3">
          {sections.map((s) => {
            const v = p.sections[s.key] ?? 0;
            const answered = (results[s.key] ?? []).some((r) => r.result);
            return (
              <li key={s.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{s.title}</span>
                  {answered ? (
                    <span className="flex items-center gap-2">
                      {Math.round(v * 100)}%{v >= PASS_MARK && s.lessons.length > 0 && <Badge tone="ok">beheerst</Badge>}
                    </span>
                  ) : (
                    <span className="text-muted">overgeslagen</span>
                  )}
                </div>
                <Progress value={v} tone={v >= PASS_MARK ? "ok" : v >= 0.5 ? "primary" : "danger"} />
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-2 font-display text-lg font-semibold">Per vaardigheid</h2>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {Object.entries(p.skills).map(([k, v]) => (
            <li key={k} className="flex justify-between rounded-lg bg-surface-2 px-3 py-1.5">
              <span>{SKILL_LABELS[k as Skill]}</span>
              <span>{Math.round((v ?? 0) * 100)}%</span>
            </li>
          ))}
        </ul>
        {(p.sections.unvowelled ?? 0) < PASS_MARK && (
          <p className="mt-3 text-sm text-muted">Lezen zonder harakat is nog lastig. Daar is de leesmodule (5 fasen) voor bedoeld; die komt ook terug in je dagprogramma.</p>
        )}
      </Card>
      <Card className="border-primary/30 bg-primary-soft/50">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">
              Je startpunt: les {p.startLesson} — {start?.title}
            </p>
            <p className="text-sm text-muted">Overgeslagen lessen zijn gemarkeerd als &quot;overgeslagen via instaptoets&quot;, niet als behaald. Je kunt ze altijd openen om te herhalen.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/lessen/${p.startLesson}`}>Start les {p.startLesson}</LinkButton>
          <LinkButton href="/" variant="outline">
            Naar dashboard
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
