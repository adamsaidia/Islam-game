import { describe, expect, it } from "vitest";
import { checkArabic, compareSpoken, partialHarakat, stripHarakat, applyHarakatMode } from "@/lib/arabic";
import { dailyPlan } from "@/lib/planner";
import { newCard, review, Rating, familiarity } from "@/lib/srs";
import { lookup } from "@/content/lexicon";
import { TEXTS } from "@/content/texts";
import { dayKey } from "@/lib/utils";

describe("checkArabic", () => {
  it("negeert harakat als die niet vereist zijn", () => {
    expect(checkArabic("كِتَاب", ["كتاب"]).correct).toBe(true);
    expect(checkArabic("كتاب", ["كِتَاب"]).correct).toBe(true);
  });
  it("vereist harakat als dat gevraagd wordt", () => {
    expect(checkArabic("كتب", ["كَتَبَ"], true).verdict).toBe("almost");
    expect(checkArabic("كَتَبَ", ["كَتَبَ"], true).correct).toBe(true);
  });
  it("accepteert shadda en klinker in beide volgordes", () => {
    const a = "سُكَّر"; // sukkar met shadda+fatha
    const b = "سُكَّر"; // fatha+shadda
    expect(checkArabic(b, [a], true).correct).toBe(true);
  });
  it("hamza-fout is bijna goed, maar fout", () => {
    const r = checkArabic("انا", ["أنا"]);
    expect(r.correct).toBe(false);
    expect(r.verdict).toBe("almost");
    expect(r.message).toMatch(/hamza/);
  });
  it("ta marbuta-fout wordt herkend", () => {
    const r = checkArabic("مدرسه", ["مدرسة"]);
    expect(r.verdict).toBe("almost");
    expect(r.message).toMatch(/ta marbuta/);
  });
  it("leestekens en spaties doen er niet toe", () => {
    expect(checkArabic("  ما   هذا ؟ ", ["ما هذا"]).correct).toBe(true);
  });
  it("fout antwoord", () => {
    expect(checkArabic("قلم", ["كتاب"]).verdict).toBe("wrong");
  });
});

describe("harakat-modi", () => {
  it("verwijdert alle harakat", () => {
    expect(stripHarakat("الْكِتَابُ")).toBe("الكتاب");
  });
  it("gedeeltelijk: houdt shadda en tanween, laat eindklinkers en voorspelbare klinkers weg", () => {
    const p = partialHarakat("مُدَرِّسٌ كَبِيرٌ");
    expect(p).toContain("ّ");
    expect(p).toContain("ٌ");
    expect(partialHarakat("كِتَابُ")).toBe("كِتاب"); // kasra blijft: niet voorspelbaar
  });
  it("applyHarakatMode", () => {
    expect(applyHarakatMode("بَيْت", "none")).toBe("بيت");
    expect(applyHarakatMode("بَيْت", "full")).toBe("بَيْت");
  });
});

describe("compareSpoken", () => {
  it("vergelijkt op woordniveau zonder harakat", () => {
    const r = compareSpoken("انا من هولندا", "أَنَا مِنْ هُولَنْدَا");
    expect(r.score).toBe(1);
  });
  it("mist woorden", () => {
    const r = compareSpoken("انا", "أَنَا مِنْ هُولَنْدَا");
    expect(r.score).toBeCloseTo(1 / 3);
  });
});

describe("FSRS", () => {
  it("goed antwoord schuift de kaart naar later", () => {
    const now = new Date("2026-01-01T10:00:00Z");
    const c = newCard("w-x", "produce", now);
    const r1 = review(c, Rating.Good, now);
    expect(new Date(r1.due).getTime()).toBeGreaterThan(now.getTime());
    expect(familiarity(c)).toBe("new");
    expect(familiarity(r1)).not.toBe("new");
  });
});

describe("planner", () => {
  const base = {
    settings: { dailyMinutes: 60 as const, studyDays: [0, 1, 2, 3, 4, 5, 6] } as never,
    history: {},
    skills: {} as never,
    cards: { a: newCard("w", "produce", new Date("2020-01-01")) },
  };
  it("60 minuten: standaardverdeling 15/15/20/10", () => {
    const plan = dailyPlan(base, new Date("2026-10-26T12:00:00")); // maandag, geen achterstand
    const m = Object.fromEntries(plan.map((p) => [p.block, p.minutes]));
    expect(m).toEqual({ read_grammar: 15, writing: 15, speak_listen: 20, vocab: 10 });
  });
  it("totaal klopt bij 20/30/45 minuten", () => {
    for (const t of [20, 30, 45]) {
      const plan = dailyPlan(base, new Date("2026-10-26T12:00:00"), t);
      expect(plan.reduce((a, p) => a + p.minutes, 0)).toBe(t);
    }
  });
  it("een blok dat achterloopt krijgt op een korte dag voorrang", () => {
    // Woensdag; maandag en dinsdag alles gedaan behalve schrijven.
    const history: Record<string, unknown> = {};
    for (const d of ["2026-10-26", "2026-10-27"])
      history[d] = { seconds: { read_grammar: 15 * 60, writing: 0, speak_listen: 20 * 60, vocab: 10 * 60 }, exercises: 0, correct: 0 };
    const plan = dailyPlan({ ...base, history: history as never }, new Date("2026-10-28T12:00:00"), 20);
    const writing = plan.find((p) => p.block === "writing")?.minutes ?? 0;
    expect(writing).toBeGreaterThanOrEqual(10);
  });
  it("dayKey is lokaal", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("lexicon", () => {
  it("vindt woorden met voorvoegsels en uitgangen", () => {
    expect(lookup("وَالْكِتَابُ")?.nl).toMatch(/boek/);
    expect(lookup("كِتَابِي")?.nl).toMatch(/boek/);
    expect(lookup("مَدْرَسَتُنَا")?.nl).toMatch(/school/);
  });
  it("context-glos gaat voor", () => {
    const t = TEXTS.find((x) => x.id === "huis")!;
    expect(lookup("بَيْتِي.", t.gloss)?.nl).toBe("mijn huis");
  });
});
