"use client";
// Client-helper voor de AI-route. Houdt rekening met de AI-instellingen en daglimiet.
import { AI_DAILY_LIMIT, useStore } from "@/lib/store";
import { dayKey } from "@/lib/utils";
import { SKILL_LABELS, type Skill } from "@/content/types";
import { levelEstimate } from "@/lib/planner";
import type { AiTask } from "./schemas";

export class AiError extends Error {}

export type AiStatus = { configured: boolean; defaultModel: string; accessCodeRequired: boolean };

let statusPromise: Promise<AiStatus> | null = null;
export function fetchAiStatus(): Promise<AiStatus> {
  statusPromise ??= fetch("/api/ai/status")
    .then((r) => r.json() as Promise<AiStatus>)
    .catch(() => ({ configured: false, defaultModel: "", accessCodeRequired: false }));
  return statusPromise;
}

/** Korte samenvatting van het leerlingprofiel voor de AI (geen persoonsgegevens). */
export function learnerContext(): string {
  const s = useStore.getState();
  const lvl = levelEstimate(s);
  const skills = Object.entries(s.skills)
    .filter(([, v]) => v.n >= 3)
    .sort((a, b) => a[1].score - b[1].score)
    .map(([k, v]) => `${SKILL_LABELS[k as Skill]}: ${Math.round(v.score * 100)}%`);
  const done = Object.entries(s.lessons)
    .filter(([, v]) => v.status === "completed" || v.status === "tested_out")
    .map(([k]) => k);
  const mistakes = Object.values(s.mistakes)
    .filter((m) => !m.resolved)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((m) => `"${m.prompt}" (verwacht: ${m.expected})`);
  return [
    `Moedertaal: Nederlands. Niveau: ${lvl.level}.`,
    `Behaalde lessen (van 70, A0 t/m C1): ${done.join(", ") || "nog geen"}. Werkniveau: ${lvl.working}.`,
    `Vaardigheden (zwakste eerst): ${skills.join("; ") || "nog onbekend"}.`,
    mistakes.length ? `Recente fouten: ${mistakes.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function callAi<T = string>(task: AiTask, payload: Record<string, unknown>): Promise<T> {
  const s = useStore.getState();
  if (s.settings.aiLevel === "off") throw new AiError("AI staat uit in je instellingen.");
  const used = s.aiUsage[dayKey()] ?? 0;
  if (used >= AI_DAILY_LIMIT[s.settings.aiLevel])
    throw new AiError(`Je daglimiet van ${AI_DAILY_LIMIT[s.settings.aiLevel]} AI-aanroepen is bereikt (instelbaar bij Instellingen).`);
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(s.settings.accessCode ? { "x-access-code": s.settings.accessCode } : {}) },
    body: JSON.stringify({ task, model: s.settings.aiModel, economy: s.settings.aiLevel === "zuinig", context: learnerContext(), ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as { result?: T; error?: string; cached?: boolean };
  if (!res.ok || data.result === undefined) throw new AiError(data.error ?? `AI-fout (${res.status}).`);
  if (!data.cached) s.countAiCall();
  return data.result;
}
