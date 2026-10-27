// Kleine bouwstenen om lessen leesbaar uit te schrijven.
import type { Exercise, Lesson, Skill, Word } from "../types";

type Extra = { promptAr?: string; audio?: string; passage?: string; explain?: string };

export function builder(lessonId: number) {
  let e = 0;
  let t = 0;
  const id = (phase: "e" | "t") => `L${lessonId}-${phase}${phase === "e" ? ++e : ++t}`;
  const make = (phase: "e" | "t") => ({
    mcq: (skill: Skill, prompt: string, options: string[], answer: number, x: Extra = {}): Exercise => ({
      kind: "mcq", id: id(phase), skill, prompt, options, answer, ...x,
    }),
    /** Arabisch typen. Eerste antwoord wordt als modelantwoord getoond. */
    type: (skill: Skill, prompt: string, answers: string[], x: Extra & { requireHarakat?: boolean; hint?: string } = {}): Exercise => ({
      kind: "type", id: id(phase), skill, prompt, answers, ...x,
    }),
    /** Dictee: luister en typ. */
    dictation: (text: string, x: Extra & { requireHarakat?: boolean; answers?: string[] } = {}): Exercise => ({
      kind: "type",
      id: id(phase),
      skill: "spelling",
      prompt: x.requireHarakat ? "Luister en schrijf wat je hoort, mét harakat." : "Luister en schrijf wat je hoort.",
      audio: text,
      answers: x.answers ?? [text],
      requireHarakat: x.requireHarakat,
      explain: x.explain,
    }),
    order: (skill: Skill, prompt: string, tokens: string[], x: Extra = {}): Exercise => ({
      kind: "order", id: id(phase), skill, prompt, tokens, ...x,
    }),
    match: (skill: Skill, prompt: string, pairs: [string, string][]): Exercise => ({
      kind: "match", id: id(phase), skill, prompt, pairs,
    }),
    speak: (text: string, nl?: string, prompt = "Zeg dit hardop."): Exercise => ({
      kind: "speak", id: id(phase), skill: "speaking", prompt, text, nl,
    }),
    trace: (glyph: string, prompt: string, tip?: string): Exercise => ({
      kind: "trace", id: id(phase), skill: "writing", prompt, glyph, tip,
    }),
  });
  return { ex: make("e"), test: make("t") };
}

export function w(ar: string, tr: string, nl: string, info?: string, example?: Word["example"]): Word {
  return { id: `w-${ar}`, ar, tr, nl, info, example };
}

export type LessonDef = Lesson;
