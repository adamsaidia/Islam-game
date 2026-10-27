"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Target, TrendingDown, History, Layers, Pencil, Plus, Trash2, Flame } from "lucide-react";
import { useStore, BLOCK_LABELS, type Block } from "@/lib/store";
import { dailyPlan, isStudyDay, levelEstimate, nextLessonId } from "@/lib/planner";
import { blockHref } from "@/lib/plan-links";
import { getLesson } from "@/content/lessons";
import { SKILL_LABELS, type Skill } from "@/content/types";
import { familiarity, isDue } from "@/lib/srs";
import { fetchAiStatus } from "@/lib/ai/client";
import { addDays, dayKey, DAY_NAMES } from "@/lib/utils";
import { Badge, Button, Card, CardTitle, LinkButton, Progress } from "@/components/ui";
import { Rich } from "@/components/arabic";

const SKILL_ORDER: Skill[] = ["letters", "reading", "reading_unvowelled", "spelling", "writing", "vocabulary", "grammar", "listening", "speaking"];

export default function Dashboard() {
  const s = useStore();
  const [minutes, setMinutes] = useState<number | undefined>(undefined);
  const [aiOn, setAiOn] = useState(false);
  useEffect(() => {
    fetchAiStatus().then((st) => setAiOn(st.configured && s.settings.aiLevel !== "off"));
  }, [s.settings.aiLevel]);

  const next = nextLessonId(s);
  const nextLesson = next ? getLesson(next) : null;
  const plan = useMemo(() => dailyPlan(s, new Date(), minutes), [s, minutes]);
  const level = levelEstimate(s);
  const today = dayKey();
  const todayDone = Object.values(s.history[today]?.seconds ?? {}).reduce((a, b) => a + b, 0) / 60;
  const planTotal = plan.reduce((a, p) => a + p.minutes, 0);
  const cards = Object.values(s.cards);
  const due = cards.filter((c) => isDue(c)).length;
  const words = Object.values(s.dictionary);
  const fam = words.map((w) => {
    const cs = cards.filter((c) => c.wordId === w.id);
    const levels = cs.map(familiarity);
    return levels.includes("new") || !cs.length ? "new" : levels.every((l) => l === "mastered") ? "mastered" : levels.some((l) => l === "learning") ? "learning" : "known";
  });
  const mistakes = Object.values(s.mistakes)
    .filter((m) => !m.resolved)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const skillsMeasured = SKILL_ORDER.filter((k) => s.skills[k].n >= 3);
  const weakest = [...skillsMeasured].sort((a, b) => s.skills[a].score - s.skills[b].score).slice(0, 3);
  const completed = Object.values(s.lessons).filter((l) => l.status === "completed").length;
  const testedOut = Object.values(s.lessons).filter((l) => l.status === "tested_out").length;

  // Laatste 14 dagen
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 13));
  const hist = days.map((d) => {
    const h = s.history[dayKey(d)];
    const sec = h ? Object.values(h.seconds).reduce((a, b) => a + b, 0) : 0;
    return { d, min: Math.round(sec / 60), ex: h?.exercises ?? 0 };
  });
  const maxMin = Math.max(s.settings.dailyMinutes, ...hist.map((h) => h.min));
  let streak = 0;
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i].min >= 5) streak++;
    else if (i === hist.length - 1) continue;
    else break;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <bdi className="ar block text-left text-xl text-gold">أَهْلًا وَسَهْلًا</bdi>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welkom terug</h1>
          <p className="mt-1 text-sm text-muted">
            {isStudyDay(s) ? "Vandaag is een studiedag." : "Vandaag is geen geplande studiedag — oefenen mag natuurlijk wel."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <Badge tone="gold">
              <Flame className="h-3.5 w-3.5" /> {streak} dag{streak > 1 ? "en" : ""} op rij
            </Badge>
          )}
          <Badge tone="primary">Niveau {level.level}</Badge>
        </div>
      </div>

      {!s.placement && (
        <Card className="border-gold/40 bg-gold-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Begin met de instaptoets</h2>
              <p className="text-sm text-muted">Je kent het alfabet al deels. De toets (±15 min) bepaalt welke lessen je kunt overslaan en waar je begint.</p>
            </div>
            <LinkButton href="/instaptoets" variant="gold">
              Start instaptoets <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="mb-0" icon={<Target className="h-5 w-5 text-primary" />}>
              Studieprogramma van vandaag
            </CardTitle>
            <div className="flex gap-1 rounded-xl bg-surface-2 p-1 text-xs">
              {[20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m === s.settings.dailyMinutes ? undefined : m)}
                  className={`rounded-lg px-2.5 py-1 ${(minutes ?? s.settings.dailyMinutes) === m ? "bg-surface font-medium shadow-sm" : "text-muted"}`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <Progress value={todayDone / planTotal} tone="gold" />
            <span className="shrink-0 text-sm text-muted">
              {Math.round(todayDone)} / {planTotal} min
            </span>
          </div>
          <ul className="space-y-2">
            {plan.map((p) => {
              const link = blockHref(p.block, { nextLesson: next, aiOn });
              const done = p.doneMinutes >= p.minutes;
              return (
                <li key={p.block}>
                  <Link href={link.href} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-primary hover:bg-primary-soft/40">
                    {done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-ok" /> : <Circle className="h-5 w-5 shrink-0 text-line" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium">{BLOCK_LABELS[p.block as Block]}</span>
                        <span className="text-sm text-muted">· {link.label}</span>
                      </div>
                      {p.reason && <p className="text-xs text-muted">{p.reason}</p>}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {p.doneMinutes}/{p.minutes} min
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Tijd wordt automatisch gemeten zolang je actief oefent. Op kortere dagen schuift de planner onderdelen door; wat vandaag minder krijgt, komt de volgende dagen terug.
          </p>
        </Card>

        <Card>
          <CardTitle icon={<ArrowRight className="h-5 w-5 text-primary" />}>Verder met</CardTitle>
          {nextLesson ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted">
                Les {nextLesson.id} · {nextLesson.module}
              </p>
              <p className="font-display text-xl font-semibold leading-snug">{nextLesson.title}</p>
              <p className="ar text-2xl text-gold">{nextLesson.titleAr}</p>
              <p className="text-sm text-muted">{nextLesson.goal}</p>
              {s.lessons[nextLesson.id]?.status === "in_progress" && <Badge tone="warn">Bezig — je gaat verder waar je was</Badge>}
              <LinkButton href={`/lessen/${nextLesson.id}`} className="w-full">
                {s.lessons[nextLesson.id]?.status === "in_progress" ? "Hervat les" : "Start les"}
              </LinkButton>
            </div>
          ) : (
            <p className="text-sm">Je hebt alle lessen behaald. Ga verder met lezen zonder harakat, vrij schrijven en gesprekken met de AI-docent.</p>
          )}
          <div className="mt-5 border-t border-line pt-4 text-sm">
            <p className="font-medium">{level.level}</p>
            <p className="text-muted">{level.detail}</p>
            <p className="mt-1 text-xs text-muted">
              {completed} behaald via lestoets{testedOut ? ` · ${testedOut} overgeslagen via instaptoets` : ""}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Voortgang per vaardigheid</CardTitle>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {SKILL_ORDER.map((k) => {
              const v = s.skills[k];
              const measured = v.n >= 3;
              return (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{SKILL_LABELS[k]}</span>
                    <span className="tabular-nums text-muted">{measured ? `${Math.round(v.score * 100)}%` : "nog niet gemeten"}</span>
                  </div>
                  <Progress value={measured ? v.score : 0} tone={measured && v.score < 0.6 ? "danger" : measured && v.score >= 0.85 ? "ok" : "primary"} />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Score = recent gewogen percentage goede antwoorden per vaardigheid. Pas na minimaal 3 antwoorden wordt een score getoond.</p>
        </Card>

        <Card>
          <CardTitle icon={<Layers className="h-5 w-5 text-primary" />}>Woordenschat</CardTitle>
          <div className="grid grid-cols-2 gap-3 text-center">
            <Stat n={words.length} label="in woordenboek" />
            <Stat n={due} label="nu te herhalen" highlight={due > 0} />
            <Stat n={fam.filter((f) => f === "known").length} label="herkend" />
            <Stat n={fam.filter((f) => f === "mastered").length} label="beheerst (21+ dagen)" />
          </div>
          <LinkButton href="/woorden" variant="outline" className="mt-4 w-full">
            {due ? `Herhaal ${due} kaarten` : "Naar woordenschat"}
          </LinkButton>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={<History className="h-5 w-5 text-primary" />}>Studiegeschiedenis (14 dagen)</CardTitle>
          <div className="flex h-36 items-end gap-1.5">
            {hist.map((h) => (
              <div key={dayKey(h.d)} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md ${h.min >= s.settings.dailyMinutes ? "bg-gold" : "bg-primary/70"}`}
                    style={{ height: `${(h.min / maxMin) * 100}%`, minHeight: h.min ? 3 : 0 }}
                    title={`${dayKey(h.d)}: ${h.min} min, ${h.ex} oefeningen`}
                  />
                </div>
                <span className={`text-[10px] ${dayKey(h.d) === today ? "font-bold text-ink" : "text-muted"}`}>{DAY_NAMES[h.d.getDay()]}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Goud = dagdoel ({s.settings.dailyMinutes} min) gehaald.</p>
        </Card>

        <Card>
          <CardTitle icon={<TrendingDown className="h-5 w-5 text-danger" />}>Aandachtspunten</CardTitle>
          {weakest.length ? (
            <ul className="mb-3 space-y-1 text-sm">
              {weakest.map((k) => (
                <li key={k} className="flex justify-between">
                  <span>{SKILL_LABELS[k]}</span>
                  <span className="text-muted">{Math.round(s.skills[k].score * 100)}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-muted">Nog te weinig gegevens. Maak eerst de instaptoets of een paar lessen.</p>
          )}
          {mistakes.length > 0 && (
            <>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Vaak fout</p>
              <ul className="space-y-1.5 text-sm">
                {mistakes.map((m) => (
                  <li key={m.id} className="rounded-lg bg-surface-2 px-2 py-1">
                    <Rich text={m.prompt} arClass="text-base" /> <span className="text-xs text-muted">({m.count}×)</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/schrijven?mode=herhaling" variant="outline" size="sm" className="mt-3 w-full">
                Oefen je fouten opnieuw
              </LinkButton>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Recente toetsresultaten</CardTitle>
          {s.tests.length ? (
            <ul className="divide-y divide-line text-sm">
              {s.tests.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <span>
                    {t.title}
                    <span className="ml-2 text-xs text-muted">{new Date(t.date).toLocaleDateString("nl-NL")}</span>
                  </span>
                  <Badge tone={t.score >= 0.8 ? "ok" : t.score >= 0.6 ? "warn" : "danger"}>{Math.round(t.score * 100)}%</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nog geen toetsen gemaakt.</p>
          )}
          {(() => {
            const last = s.tests.find((t) => t.title === "Voortgangstoets");
            const days = last ? (Date.now() - new Date(last.date).getTime()) / 864e5 : Infinity;
            const studied = Object.values(s.lessons).filter((l) => l.status !== "new").length;
            return studied >= 2 && days >= 7 ? (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gold-soft px-3 py-2 text-sm">
                <span>{last ? "Tijd voor je wekelijkse voortgangstoets." : "Maak je eerste voortgangstoets."}</span>
                <LinkButton href="/toetsen" size="sm" variant="gold">
                  Start
                </LinkButton>
              </div>
            ) : (
              <LinkButton href="/toetsen" size="sm" variant="ghost" className="mt-2">
                Alle toetsen →
              </LinkButton>
            );
          })()}
        </Card>
        <Goals />
      </div>
    </div>
  );
}

function Stat({ n, label, highlight }: { n: number; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? "bg-gold-soft" : "bg-surface-2"}`}>
      <div className="font-display text-2xl font-semibold tabular-nums">{n}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Goals() {
  const goals = useStore((s) => s.goals);
  const setGoals = useStore((s) => s.setGoals);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle className="mb-0">Mijn leerdoelen</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setEdit((e) => !e)}>
          <Pencil className="h-4 w-4" /> {edit ? "Klaar" : "Bewerk"}
        </Button>
      </div>
      <ul className="space-y-2 text-sm">
        {goals.map((g, i) => (
          <li key={i} className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-gold" />
            <span className="flex-1">{g}</span>
            {edit && (
              <button onClick={() => setGoals(goals.filter((_, j) => j !== i))} aria-label="Verwijder doel">
                <Trash2 className="h-4 w-4 text-muted" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {edit && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setGoals([...goals, draft.trim()]);
            setDraft("");
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nieuw doel…" className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      )}
    </Card>
  );
}
