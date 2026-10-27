// Stelt oefensessies samen uit lessen die je al gedaan hebt, met je fouten voorop.
import { LESSONS } from "@/content/lessons";
import type { Exercise, Skill } from "@/content/types";
import { hashString, seeded, shuffle } from "./random";
import type { AppState } from "./store";

const allExercises = new Map<string, { e: Exercise; lessonId: number }>();
for (const l of LESSONS) for (const e of [...l.exercises, ...l.test]) allExercises.set(e.id, { e, lessonId: l.id });

export function exerciseById(id: string) {
  return allExercises.get(id);
}

function unlockedLessonIds(state: Pick<AppState, "lessons">): number[] {
  return LESSONS.filter((l) => state.lessons[l.id] && state.lessons[l.id].status !== "new").map((l) => l.id);
}

export function mistakeExercises(state: Pick<AppState, "mistakes">, skills?: Skill[], limit = 10): Exercise[] {
  return Object.values(state.mistakes)
    .filter((m) => !m.resolved && (!skills || skills.includes(m.skill)))
    .sort((a, b) => b.count - a.count || b.lastAt.localeCompare(a.lastAt))
    .map((m) => allExercises.get(m.id)?.e)
    .filter((e): e is Exercise => !!e)
    .slice(0, limit);
}

/** Een gemengde sessie voor de opgegeven vaardigheden. Fouten eerst, dan willekeurige stof uit gedane lessen. */
export function buildSession(
  state: Pick<AppState, "lessons" | "mistakes" | "dictionary">,
  opts: { skills: Skill[]; kinds?: Exercise["kind"][]; size?: number; seed?: number; includeDictionary?: boolean },
): Exercise[] {
  const size = opts.size ?? 10;
  const rnd = seeded(opts.seed ?? hashString(new Date().toDateString() + opts.skills.join()));
  const fits = (e: Exercise) => opts.skills.includes(e.skill) && (!opts.kinds || opts.kinds.includes(e.kind));
  const mistakes = mistakeExercises(state, opts.skills, Math.ceil(size / 2)).filter(fits);
  const unlocked = new Set(unlockedLessonIds(state));
  const pool = shuffle(
    Array.from(allExercises.values())
      .filter((x) => unlocked.has(x.lessonId) && fits(x.e) && !mistakes.some((m) => m.id === x.e.id))
      .map((x) => x.e),
    rnd,
  );
  const out = [...mistakes, ...pool].slice(0, size);
  if (opts.includeDictionary && out.length < size) {
    const words = shuffle(Object.values(state.dictionary).filter((w) => w.verified), rnd).slice(0, size - out.length);
    for (const w of words)
      out.push({ kind: "type", id: `D-${w.id}`, skill: "spelling", prompt: "Luister en schrijf het woord.", audio: w.ar, answers: [w.ar], explain: `${w.ar} = ${w.nl}` });
  }
  return out;
}

/** Tekst om een oefening in het foutenoverzicht te herkennen. */
export function promptOf(e: Exercise): string {
  return e.promptAr ? `${e.prompt} ${e.promptAr}` : e.prompt;
}
