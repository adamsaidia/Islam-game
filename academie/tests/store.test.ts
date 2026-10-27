import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@/lib/store";
import { nextLessonId, levelEstimate } from "@/lib/planner";
import { LESSONS } from "@/content/lessons";

beforeEach(() => useStore.getState().resetAll());

describe("store", () => {
  it("les is pas behaald bij ≥ 80% op de toets", () => {
    const s = useStore.getState();
    expect(s.finishLessonTest(1, "Les 1", 0.75, {})).toBe(false);
    expect(useStore.getState().lessons[1].status).not.toBe("completed");
    expect(useStore.getState().finishLessonTest(1, "Les 1", 0.8, {})).toBe(true);
    expect(useStore.getState().lessons[1].status).toBe("completed");
    expect(useStore.getState().lessons[1].testAttempts).toBe(2);
    expect(useStore.getState().tests).toHaveLength(2);
  });

  it("lessen openen telt niet als behaald", () => {
    useStore.getState().setLessonStep(1, 5);
    expect(useStore.getState().lessons[1].status).toBe("in_progress");
    expect(nextLessonId(useStore.getState())).toBe(1);
    expect(levelEstimate(useStore.getState()).detail).toMatch(/^0\/70/);
    expect(levelEstimate(useStore.getState()).working).toBe("A0");
  });

  it("instaptoets markeert lessen als overgeslagen, niet als behaald", () => {
    useStore.getState().savePlacement({ date: new Date().toISOString(), skills: { letters: 0.9 }, sections: { letters: 0.9 }, startLesson: 9 }, [1, 2, 3, 4, 5, 6, 7, 8]);
    const st = useStore.getState();
    expect(st.lessons[1].status).toBe("tested_out");
    expect(nextLessonId(st)).toBe(9);
    expect(st.skills.letters.score).toBeCloseTo(0.9);
  });

  it("niveau is pas afgerond als alle lessen van dat niveau behaald zijn", () => {
    const a0 = LESSONS.filter((l) => l.level === "A0").map((l) => l.id);
    useStore.getState().savePlacement({ date: new Date().toISOString(), skills: {}, sections: {}, startLesson: 15 }, a0.slice(0, -1));
    expect(levelEstimate(useStore.getState()).reached).toBeNull();
    useStore.getState().finishLessonTest(a0[a0.length - 1], "x", 1, {});
    const est = levelEstimate(useStore.getState());
    expect(est.reached).toBe("A0");
    expect(est.working).toBe("A1");
  });

  it("fouten worden bewaard en na een goed antwoord opgelost", () => {
    const base = { exerciseId: "x", skill: "spelling" as const, prompt: "p", expected: "e", verdict: "" };
    useStore.getState().recordAnswer({ ...base, correct: false });
    useStore.getState().recordAnswer({ ...base, correct: false });
    expect(useStore.getState().mistakes.x.count).toBe(2);
    useStore.getState().recordAnswer({ ...base, correct: true });
    expect(useStore.getState().mistakes.x.resolved).toBe(true);
  });

  it("AI-woorden worden pas flashcards na bevestiging", () => {
    useStore.getState().addWords([{ id: "w-a", ar: "أ", nl: "a", source: "gesprek", verified: false }]);
    expect(Object.keys(useStore.getState().cards)).toHaveLength(0);
    useStore.getState().verifyWord("w-a", true);
    expect(Object.keys(useStore.getState().cards)).toHaveLength(2);
  });
});
