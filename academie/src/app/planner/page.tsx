"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore, BLOCK_LABELS, type Block } from "@/lib/store";
import { BASE_SPLIT, dailyPlan, nextLessonId, weekMinutes } from "@/lib/planner";
import { blockHref } from "@/lib/plan-links";
import { fetchAiStatus } from "@/lib/ai/client";
import { getLesson } from "@/content/lessons";
import { addDays, dayKey, DAY_NAMES, weekStart } from "@/lib/utils";
import { Badge, Card, CardTitle, PageHeader, Progress, Segmented } from "@/components/ui";
import { cn } from "@/lib/utils";

const BLOCKS: Block[] = ["read_grammar", "writing", "speak_listen", "vocab"];
const COLORS: Record<Block, string> = { read_grammar: "bg-primary", writing: "bg-gold", speak_listen: "bg-[#5b7fb5]", vocab: "bg-[#a06aa8]" };

export default function PlannerPage() {
  const s = useStore();
  const setSettings = useStore((x) => x.setSettings);
  const [aiOn, setAiOn] = useState(false);
  useEffect(() => {
    fetchAiStatus().then((st) => setAiOn(st.configured && s.settings.aiLevel !== "off"));
  }, [s.settings.aiLevel]);

  const today = new Date();
  const start = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const done = weekMinutes(s, today, true);
  const studyDays = s.settings.studyDays.length;
  const plan = dailyPlan(s, today);
  const next = nextLessonId(s);

  // Kaarten die de komende 7 dagen vervallen
  const cards = Object.values(s.cards);
  const dueByDay = Array.from({ length: 7 }, (_, i) => {
    const end = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), i + 1);
    const begin = addDays(end, -1);
    return cards.filter((c) => {
      const d = new Date(c.due);
      return i === 0 ? d < end : d >= begin && d < end;
    }).length;
  });

  // Lessen die aan herhaling toe zijn: openstaande fouten of lang geleden behaald.
  const mistakesByLesson = new Map<number, number>();
  for (const m of Object.values(s.mistakes)) if (!m.resolved && m.lessonId) mistakesByLesson.set(m.lessonId, (mistakesByLesson.get(m.lessonId) ?? 0) + m.count);
  const stale = Object.entries(s.lessons)
    .filter(([, p]) => p.status === "completed" && p.completedAt && Date.now() - new Date(p.completedAt).getTime() > 14 * 864e5)
    .map(([id]) => Number(id));
  const reviewLessons = Array.from(new Set([...mistakesByLesson.keys(), ...stale])).sort((a, b) => (mistakesByLesson.get(b) ?? 0) - (mistakesByLesson.get(a) ?? 0)).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Studieplanner" subtitle="Standaard 60 minuten: 15 lezen & grammatica · 15 schrijven · 20 spreken & luisteren · 10 woordenschat." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Studietijd per dag</CardTitle>
          <Segmented
            value={s.settings.dailyMinutes}
            onChange={(v) => setSettings({ dailyMinutes: v })}
            options={[20, 30, 45, 60].map((m) => ({ value: m as 20 | 30 | 45 | 60, label: `${m} min` }))}
          />
          <p className="mt-3 text-sm text-muted">Kies je een kortere tijd, dan wisselt de planner de onderdelen af, zodat binnen een week elke vaardigheid aan bod komt.</p>
          <CardTitle className="mt-5">Mijn studiedagen</CardTitle>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const on = s.settings.studyDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => setSettings({ studyDays: on ? s.settings.studyDays.filter((x) => x !== d) : [...s.settings.studyDays, d] })}
                  className={cn("h-10 w-12 rounded-xl border text-sm font-medium capitalize", on ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-muted")}
                >
                  {DAY_NAMES[d]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">{studyDays} dagen × {s.settings.dailyMinutes} min = {studyDays * s.settings.dailyMinutes} min per week.</p>
        </Card>

        <Card>
          <CardTitle>Vandaag</CardTitle>
          <ul className="space-y-2">
            {plan.map((p) => {
              const link = blockHref(p.block, { nextLesson: next, aiOn });
              return (
                <li key={p.block}>
                  <Link href={link.href} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary">
                    <span className={cn("h-3 w-3 rounded-full", COLORS[p.block])} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{BLOCK_LABELS[p.block]}</span>
                      <span className="block text-xs text-muted">{link.label}{p.reason ? ` · ${p.reason}` : ""}</span>
                    </span>
                    <span className="text-sm tabular-nums text-muted">
                      {p.doneMinutes}/{p.minutes}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>Weekoverzicht</CardTitle>
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => {
            const h = s.history[dayKey(d)];
            const total = h ? BLOCKS.reduce((a, b) => a + h.seconds[b], 0) / 60 : 0;
            const planned = s.settings.studyDays.includes(d.getDay()) ? s.settings.dailyMinutes : 0;
            const isToday = dayKey(d) === dayKey(today);
            return (
              <div key={dayKey(d)} className={cn("rounded-xl border p-2 text-center", isToday ? "border-primary" : "border-line")}>
                <div className="text-xs font-medium capitalize">{DAY_NAMES[d.getDay()]}</div>
                <div className="text-[10px] text-muted">{d.getDate()}/{d.getMonth() + 1}</div>
                <div className="mx-auto mt-2 flex h-24 w-6 flex-col-reverse overflow-hidden rounded-md bg-surface-2">
                  {h &&
                    BLOCKS.map((b) => (
                      <div key={b} className={COLORS[b]} style={{ height: `${Math.min(100, (h.seconds[b] / 60 / Math.max(planned, 30)) * 100)}%` }} title={`${BLOCK_LABELS[b]}: ${Math.round(h.seconds[b] / 60)} min`} />
                    ))}
                </div>
                <div className="mt-1 text-xs tabular-nums">{Math.round(total)}m</div>
                <div className="text-[10px] text-muted">{planned ? `doel ${planned}` : "vrij"}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {BLOCKS.map((b) => {
            const target = (BASE_SPLIT[b] / 60) * s.settings.dailyMinutes * studyDays;
            return (
              <div key={b}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", COLORS[b])} /> {BLOCK_LABELS[b]}
                  </span>
                  <span className="tabular-nums text-muted">
                    {Math.round(done[b])} / {Math.round(target)} min
                  </span>
                </div>
                <Progress value={target ? done[b] / target : 0} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Flashcards komende week</CardTitle>
          <div className="flex h-28 items-end gap-2">
            {dueByDay.map((n, i) => {
              const max = Math.max(1, ...dueByDay);
              const d = addDays(today, i);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] tabular-nums text-muted">{n}</span>
                  <div className="w-full rounded-t-md bg-primary/70" style={{ height: `${(n / max) * 80}%`, minHeight: n ? 3 : 0 }} />
                  <span className="text-[10px] capitalize text-muted">{i === 0 ? "nu" : DAY_NAMES[d.getDay()]}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardTitle>Toe aan herhaling</CardTitle>
          {reviewLessons.length ? (
            <ul className="space-y-2 text-sm">
              {reviewLessons.map((id) => (
                <li key={id}>
                  <Link href={`/lessen/${id}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 hover:border-primary">
                    <span>
                      Les {id}: {getLesson(id)?.title}
                    </span>
                    {mistakesByLesson.get(id) ? <Badge tone="danger">{mistakesByLesson.get(id)} fouten</Badge> : <Badge>14+ dagen geleden</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Niets dringends. Je fouten en oude lessen verschijnen hier vanzelf.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
