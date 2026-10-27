export type Level = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";

export type Skill =
  | "letters"
  | "reading"
  | "reading_unvowelled"
  | "spelling"
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "writing";

export const SKILL_LABELS: Record<Skill, string> = {
  letters: "Letters & uitspraak",
  reading: "Lezen met harakat",
  reading_unvowelled: "Lezen zonder harakat",
  spelling: "Spelling",
  vocabulary: "Woordenschat",
  grammar: "Grammatica",
  listening: "Luisteren",
  speaking: "Spreken",
  writing: "Schrijven",
};

export type Example = { ar: string; tr?: string; nl: string };

export type Word = {
  id: string;
  ar: string;
  tr: string;
  nl: string;
  /** Woordsoort / grammaticale info, bijv. "zn. m., mv. كُتُب" */
  info?: string;
  example?: Example;
};

type Base = {
  id: string;
  skill: Skill;
  prompt: string;
  /** Arabische tekst die bij de vraag getoond wordt. */
  promptAr?: string;
  /** Arabische tekst die wordt voorgelezen (TTS). */
  audio?: string;
  /** Leestekst bij begripsvragen. */
  passage?: string;
  explain?: string;
};

export type McqExercise = Base & { kind: "mcq"; options: string[]; answer: number };
export type TypeExercise = Base & {
  kind: "type";
  answers: string[];
  requireHarakat?: boolean;
  /** Alleen de letters en de laatste klinker (naamvalsuitgang) worden gecontroleerd. */
  checkEnding?: boolean;
  /** Antwoord is Nederlands (bijv. vertalen naar het Nederlands). */
  dutch?: boolean;
  hint?: string;
};
export type OrderExercise = Base & { kind: "order"; tokens: string[] };
export type MatchExercise = Base & { kind: "match"; pairs: [string, string][] };
export type TraceExercise = Base & { kind: "trace"; glyph: string; tip?: string };
export type SpeakExercise = Base & { kind: "speak"; text: string; nl?: string };

export type Exercise = McqExercise | TypeExercise | OrderExercise | MatchExercise | TraceExercise | SpeakExercise;

export type Section = {
  title: string;
  body: string[];
  examples?: Example[];
  /** Tabel: eerste rij is de kop. */
  table?: string[][];
};

export type Lesson = {
  id: number;
  module: string;
  level: Level;
  title: string;
  titleAr: string;
  goal: string;
  minutes: number;
  skills: Skill[];
  sections: Section[];
  words: Word[];
  exercises: Exercise[];
  test: Exercise[];
};

/** Lessen die al gepland maar nog niet geschreven zijn (eerlijk gemarkeerd in de UI). */
export type PlannedModule = { level: Level; title: string; topics: string[] };
