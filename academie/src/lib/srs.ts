// Spaced repetition op basis van FSRS (ts-fsrs).
import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";

export type CardDir = "recognize" | "produce";

/** Opslagvorm van een kaart (datums als ISO-strings, JSON-veilig). */
export type StoredCard = {
  id: string;
  wordId: string;
  dir: CardDir;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
};

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true, maximum_interval: 3650 });

export function toStored(id: string, wordId: string, dir: CardDir, c: Card): StoredCard {
  return {
    id,
    wordId,
    dir,
    due: new Date(c.due).toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? new Date(c.last_review).toISOString() : undefined,
  };
}

function fromStored(s: StoredCard): Card {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    learning_steps: s.learning_steps,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state as State,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

export function newCard(wordId: string, dir: CardDir, now = new Date()): StoredCard {
  return toStored(`${wordId}:${dir}`, wordId, dir, createEmptyCard(now));
}

export function review(card: StoredCard, grade: Grade, now = new Date()): StoredCard {
  const next = scheduler.next(fromStored(card), now, grade);
  return toStored(card.id, card.wordId, card.dir, next.card);
}

export function isDue(card: StoredCard, now = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

export type Familiarity = "new" | "learning" | "known" | "mastered";

/** Beheerst = stabiliteit van 21+ dagen; herkend = minstens één keer goed herhaald. */
export function familiarity(card: StoredCard): Familiarity {
  if (card.reps === 0) return "new";
  if (card.state === State.Review && card.stability >= 21) return "mastered";
  if (card.state === State.Review) return "known";
  return "learning";
}

export { Rating };
export type { Grade };
