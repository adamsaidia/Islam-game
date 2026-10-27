// Dagelijkse studieplanner. Verdeelt de beschikbare tijd over vier blokken op basis van
// de standaardverdeling (15/15/20/10 per 60 min), wat er deze week al gedaan is,
// en de zwakste vaardigheden. Korte dagen schuiven blokken op, maar slaan ze niet
// structureel over: wat vandaag minder krijgt, krijgt morgen meer.
import type { Skill } from "@/content/types";
import type { AppState, Block } from "./store";
import { SKILL_BLOCK } from "./store";
import { addDays, dayKey, weekStart } from "./utils";
import { isDue } from "./srs";
import { LESSONS } from "@/content/lessons";

export const BASE_SPLIT: Record<Block, number> = { read_grammar: 15, writing: 15, speak_listen: 20, vocab: 10 };
const BLOCKS: Block[] = ["read_grammar", "writing", "speak_listen", "vocab"];

export type PlanItem = { block: Block; minutes: number; doneMinutes: number; reason: string };

export function isStudyDay(state: Pick<AppState, "settings">, d = new Date()): boolean {
  return state.settings.studyDays.includes(d.getDay());
}

/** Minuten per blok deze week (maandag t/m vandaag), exclusief vandaag. */
export function weekMinutes(state: Pick<AppState, "history">, today = new Date(), includeToday = false) {
  const res: Record<Block, number> = { read_grammar: 0, writing: 0, speak_listen: 0, vocab: 0 };
  const start = weekStart(today);
  for (let d = start; dayKey(d) <= dayKey(today); d = addDays(d, 1)) {
    if (!includeToday && dayKey(d) === dayKey(today)) break;
    const h = state.history[dayKey(d)];
    if (!h) continue;
    for (const b of BLOCKS) res[b] += h.seconds[b] / 60;
  }
  return res;
}

/** Zwakte per blok: 0 (sterk) .. 1 (zwak), op basis van vaardigheidsscores met genoeg metingen. */
export function blockWeakness(state: Pick<AppState, "skills">): Record<Block, number> {
  const sums: Record<Block, { s: number; n: number }> = {
    read_grammar: { s: 0, n: 0 },
    writing: { s: 0, n: 0 },
    speak_listen: { s: 0, n: 0 },
    vocab: { s: 0, n: 0 },
  };
  for (const [k, v] of Object.entries(state.skills)) {
    if (v.n < 3) continue;
    const b = SKILL_BLOCK[k as Skill];
    sums[b].s += v.score;
    sums[b].n += 1;
  }
  return Object.fromEntries(BLOCKS.map((b) => [b, sums[b].n ? 1 - sums[b].s / sums[b].n : 0.5])) as Record<Block, number>;
}

function measuredBlocks(state: Pick<AppState, "skills">): Record<Block, boolean> {
  const m: Record<Block, boolean> = { read_grammar: false, writing: false, speak_listen: false, vocab: false };
  for (const [k, v] of Object.entries(state.skills)) if (v.n >= 3) m[SKILL_BLOCK[k as Skill]] = true;
  return m;
}

export function dailyPlan(state: Pick<AppState, "settings" | "history" | "skills" | "cards">, today = new Date(), minutesOverride?: number): PlanItem[] {
  const total = minutesOverride ?? state.settings.dailyMinutes;
  const doneWeek = weekMinutes(state, today);
  const weakness = blockWeakness(state);
  const measured = measuredBlocks(state);
  const dueCards = Object.values(state.cards).filter((c) => isDue(c, today)).length;
  const todayH = state.history[dayKey(today)];

  // Hoeveel studiedagen zijn er deze week al voorbij (vóór vandaag), sinds je met de app begon?
  const start = weekStart(today);
  const firstDay = Object.keys(state.history).sort()[0] ?? dayKey(today);
  let pastStudyDays = 0;
  for (let d = start; dayKey(d) < dayKey(today); d = addDays(d, 1))
    if (dayKey(d) >= firstDay && state.settings.studyDays.includes(d.getDay())) pastStudyDays++;

  const weight: Record<Block, number> = { read_grammar: 0, writing: 0, speak_listen: 0, vocab: 0 };
  for (const b of BLOCKS) {
    const share = BASE_SPLIT[b] / 60;
    const expectedSoFar = share * state.settings.dailyMinutes * pastStudyDays;
    const deficit = Math.max(0, expectedSoFar - doneWeek[b]);
    const deficitBoost = expectedSoFar > 0 ? deficit / (share * state.settings.dailyMinutes) : 0; // in 'dagen achterstand'
    weight[b] = share * (1 + 0.6 * Math.min(deficitBoost, 2) + 0.5 * weakness[b]);
  }
  if (dueCards === 0) weight.vocab *= 0.4;

  // Verdeel in blokken van 5 minuten, grootste resterende gewicht eerst.
  const units = Math.max(1, Math.round(total / 5));
  const alloc: Record<Block, number> = { read_grammar: 0, writing: 0, speak_listen: 0, vocab: 0 };
  const sumW = BLOCKS.reduce((a, b) => a + weight[b], 0);
  for (let u = 0; u < units; u++) {
    let best: Block = "read_grammar";
    let bestScore = -Infinity;
    for (const b of BLOCKS) {
      const target = (weight[b] / sumW) * units;
      const score = target - alloc[b];
      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    }
    alloc[best] += 1;
  }

  return BLOCKS.filter((b) => alloc[b] > 0)
    .map((b) => {
      const reasons: string[] = [];
      if (measured[b] && weakness[b] > 0.4) reasons.push("hier scoor je nog wat lager");
      const expectedSoFar = (BASE_SPLIT[b] / 60) * state.settings.dailyMinutes * pastStudyDays;
      if (expectedSoFar - doneWeek[b] > 5) reasons.push("achterstand van deze week");
      if (b === "vocab" && dueCards > 0) reasons.push(`${dueCards} kaarten staan klaar`);
      return {
        block: b,
        minutes: alloc[b] * 5,
        doneMinutes: Math.round((todayH?.seconds[b] ?? 0) / 60),
        reason: reasons.join(" · "),
      };
    })
    .sort((a, b) => BLOCKS.indexOf(a.block) - BLOCKS.indexOf(b.block));
}

/** Eerste les die nog niet voltooid of overgeslagen is. */
export function nextLessonId(state: Pick<AppState, "lessons">): number | null {
  for (const l of LESSONS) {
    const st = state.lessons[l.id]?.status;
    if (st !== "completed" && st !== "tested_out") return l.id;
  }
  return null;
}

/** Eerlijke niveau-inschatting: alleen op basis van behaalde lestoetsen. */
export function levelEstimate(state: Pick<AppState, "lessons">): { level: string; detail: string } {
  const done = (id: number) => {
    const s = state.lessons[id]?.status;
    return s === "completed" || s === "tested_out";
  };
  const count = LESSONS.filter((l) => done(l.id)).length;
  const a0 = LESSONS.filter((l) => l.level === "A0").every((l) => done(l.id));
  const a1 = LESSONS.filter((l) => l.level === "A1").every((l) => done(l.id));
  if (a1 && a0) return { level: "A1 (basis)", detail: "Beginnersdeel afgerond. A1-verdieping en A2 zijn in ontwikkeling." };
  if (a0) return { level: "A0 afgerond → A1", detail: `${count}/30 lessen behaald. Je werkt aan A1.` };
  return { level: "A0", detail: `${count}/30 lessen behaald. Je herstelt de basis.` };
}
