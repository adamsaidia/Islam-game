import { describe, expect, it } from "vitest";
import { LESSONS } from "@/content/lessons";
import { PLACEMENT } from "@/content/placement";
import { TEXTS } from "@/content/texts";
import { SCENARIOS } from "@/content/scenarios";
import { LETTERS } from "@/content/letters";
import { hasArabic, HARAKAT_RE, stripHarakat } from "@/lib/arabic";
import type { Exercise } from "@/content/types";

const MARKS = /[ً-ْ]/;
const VOWELS = /[ً-ِ]/; // tanween + korte klinkers

/** Controleert veelgemaakte fouten in gevocaliseerde tekst. */
function harakatProblems(text: string): string[] {
  const problems: string[] = [];
  for (const word of text.split(/[\s،.؟!:]+/).filter(Boolean)) {
    const ch = Array.from(word);
    if (MARKS.test(ch[0] ?? "")) problems.push(`${word}: begint met een teken`);
    for (let i = 1; i < ch.length; i++) {
      const a = ch[i - 1], b = ch[i];
      if (VOWELS.test(a) && VOWELS.test(b)) problems.push(`${word}: twee klinkers achter elkaar`);
      if (a === "ْ" && MARKS.test(b)) problems.push(`${word}: teken na sukun`);
      if (VOWELS.test(a) && b === "ْ") problems.push(`${word}: sukun na klinker`);
    }
    // Fathatan krijgt een alif, behalve na ة, ء, ى of als hij al op een alif staat.
    for (let i = 0; i < ch.length; i++) {
      if (ch[i] !== "ً") continue;
      let j = i - 1;
      while (j >= 0 && MARKS.test(ch[j])) j--;
      const base = ch[j];
      let k = i + 1;
      while (k < ch.length && MARKS.test(ch[k])) k++;
      const next = ch[k];
      if (!["ة", "ء", "ى", "ا"].includes(base) && next !== "ا") problems.push(`${word}: tanween -an zonder alif`);
    }
    // Damma/kasra-tanween alleen op de laatste letter.
    for (let i = 0; i < ch.length; i++) {
      if (ch[i] === "ٌ" || ch[i] === "ٍ") {
        const rest = ch.slice(i + 1).filter((c) => !MARKS.test(c));
        if (rest.length) problems.push(`${word}: tanween niet aan het eind`);
      }
    }
  }
  return problems;
}

function arabicStrings(e: Exercise): string[] {
  const out: string[] = [];
  if (e.promptAr) out.push(e.promptAr);
  if (e.audio) out.push(e.audio);
  if (e.passage) out.push(e.passage);
  if (e.kind === "type") out.push(...e.answers.filter(hasArabic));
  if (e.kind === "order") out.push(...e.tokens);
  if (e.kind === "speak") out.push(e.text);
  if (e.kind === "mcq") out.push(...e.options.filter(hasArabic));
  if (e.kind === "match") out.push(...e.pairs.flat().filter(hasArabic));
  return out;
}

describe("lessen", () => {
  it("er zijn precies 30 lessen met ids 1..30", () => {
    expect(LESSONS.map((l) => l.id)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("elke les heeft leerdoel, uitleg, oefeningen en een toets", () => {
    for (const l of LESSONS) {
      expect(l.goal.length, `les ${l.id}`).toBeGreaterThan(10);
      expect(l.sections.length, `les ${l.id}`).toBeGreaterThan(0);
      expect(l.exercises.length, `les ${l.id}`).toBeGreaterThanOrEqual(6);
      expect(l.test.length, `les ${l.id}`).toBeGreaterThanOrEqual(4);
      expect(l.words.length, `les ${l.id}`).toBeGreaterThan(0);
    }
  });

  it("oefening-ids zijn uniek", () => {
    const ids = [...LESSONS.flatMap((l) => [...l.exercises, ...l.test].map((e) => e.id)), ...PLACEMENT.flatMap((s) => s.items.map((e) => e.id))];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("oefeningen zijn geldig", () => {
    for (const l of LESSONS)
      for (const e of [...l.exercises, ...l.test]) {
        const tag = `${e.id}`;
        if (e.kind === "mcq") {
          expect(e.answer, tag).toBeGreaterThanOrEqual(0);
          expect(e.answer, tag).toBeLessThan(e.options.length);
          expect(new Set(e.options).size, tag).toBe(e.options.length);
        }
        if (e.kind === "type") {
          expect(e.answers.length, tag).toBeGreaterThan(0);
          for (const a of e.answers) expect(hasArabic(a) || !!e.dutch, tag).toBe(true);
          if (e.requireHarakat) expect(HARAKAT_RE.test(e.answers[0]), tag).toBe(true);
          HARAKAT_RE.lastIndex = 0;
        }
        if (e.kind === "order") expect(e.tokens.length, tag).toBeGreaterThanOrEqual(2);
        if (e.kind === "match") expect(e.pairs.length, tag).toBeGreaterThanOrEqual(2);
      }
  });

  it("niet te veel meerkeuze: minstens 40% productieve oefeningen per les", () => {
    for (const l of LESSONS) {
      const all = [...l.exercises, ...l.test];
      const productive = all.filter((e) => e.kind !== "mcq" && e.kind !== "match").length;
      expect(productive / all.length, `les ${l.id}`).toBeGreaterThanOrEqual(0.4);
    }
  });

  it("gevocaliseerde Arabische tekst volgt de harakat-regels", () => {
    const problems: string[] = [];
    for (const l of LESSONS) {
      for (const e of [...l.exercises, ...l.test]) for (const s of arabicStrings(e)) problems.push(...harakatProblems(s).map((p) => `${e.id} ${p}`));
      for (const s of l.sections) for (const x of s.examples ?? []) problems.push(...harakatProblems(x.ar).map((p) => `les ${l.id} ${p}`));
      for (const w of l.words) problems.push(...harakatProblems(w.ar).map((p) => `les ${l.id} woord ${p}`));
    }
    for (const t of TEXTS) for (const s of t.sentences) problems.push(...harakatProblems(s.ar).map((p) => `tekst ${t.id} ${p}`));
    for (const sc of SCENARIOS) problems.push(...harakatProblems(sc.opener.ar).map((p) => `scenario ${sc.id} ${p}`));
    expect(problems).toEqual([]);
  });

  it("antwoorden zonder harakat-eis bevatten geen harakat (worden toch genegeerd)", () => {
    for (const l of LESSONS)
      for (const e of [...l.exercises, ...l.test])
        if (e.kind === "type" && !e.requireHarakat && !e.audio) for (const a of e.answers) expect(stripHarakat(a), e.id).toBe(a);
  });
});

describe("letters", () => {
  it("alle 28 letters, uniek", () => {
    expect(LETTERS.length).toBe(28);
    expect(new Set(LETTERS.map((l) => l.char)).size).toBe(28);
  });
  it("alle letters komen in de alfabetlessen voor", () => {
    const taught = new Set(LESSONS.filter((l) => l.id <= 7).flatMap((l) => l.exercises.filter((e) => e.kind === "trace").map((e) => (e.kind === "trace" ? e.glyph : ""))));
    for (const l of LETTERS) expect(taught.has(l.char), l.name).toBe(true);
  });
});

describe("leesteksten", () => {
  it("elk woord in een tekst heeft een glos", () => {
    const missing: string[] = [];
    for (const t of TEXTS) {
      const keys = new Set(t.gloss.map(([ar]) => stripHarakat(ar)));
      for (const s of t.sentences)
        for (const w of s.ar.split(/[\s،.؟!:]+/).filter(Boolean)) if (!keys.has(stripHarakat(w))) missing.push(`${t.id}: ${w}`);
    }
    expect(missing).toEqual([]);
  });
  it("vragen zijn geldig", () => {
    for (const t of TEXTS) for (const q of t.questions) expect(q.answer).toBeLessThan(q.options.length);
  });
});
