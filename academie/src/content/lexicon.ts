// Opzoeken van woorden: eerst de context-glossen van een tekst, dan alle lesswoorden.
import { normalizeBasic, stripHarakat } from "@/lib/arabic";
import { LESSONS } from "./lessons";
import type { Word } from "./types";

export const keyOf = (s: string) => stripHarakat(normalizeBasic(s)).replace(/[أإآ]/g, "ا");

const lessonWords = new Map<string, Word & { lessonId: number }>();
for (const l of LESSONS) for (const w of l.words) {
  const k = keyOf(w.ar);
  if (!lessonWords.has(k)) lessonWords.set(k, { ...w, lessonId: l.id });
}

export const ALL_LESSON_WORDS = Array.from(lessonWords.values());

/** Probeert ook zonder voorvoegsels (و، ف، ب، ل، ال) en met veelvoorkomende uitgangen. */
export function lookup(surface: string, gloss?: [string, string][]): { ar: string; nl: string; info?: string; lessonId?: number } | null {
  const k = keyOf(surface);
  if (!k) return null;
  if (gloss) {
    const g = gloss.find(([ar]) => keyOf(ar) === k);
    if (g) return { ar: g[0], nl: g[1] };
  }
  const candidates = [k];
  for (const p of ["و", "ف", "ب", "ل", "ك"]) if (k.startsWith(p) && k.length > 2) candidates.push(k.slice(1));
  for (const c of [...candidates]) {
    if (c.startsWith("ال")) candidates.push(c.slice(2));
    if (c.startsWith("لل")) candidates.push(c.slice(2));
  }
  for (const c of [...candidates]) {
    for (const suf of ["ي", "ك", "ه", "ها", "نا", "كم", "هم"]) if (c.endsWith(suf) && c.length > suf.length + 1) {
      const base = c.slice(0, -suf.length);
      candidates.push(base, base.replace(/ت$/, "ة"));
    }
  }
  for (const c of candidates) {
    const w = lessonWords.get(c);
    if (w) return { ar: w.ar, nl: w.nl + (c !== k ? " (grondvorm)" : ""), info: w.info, lessonId: w.lessonId };
  }
  return null;
}
