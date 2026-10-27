// Server-side AI-route. De API-sleutel verlaat de server nooit.
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { ALLOWED_MODELS, SCHEMAS, type AiTask } from "@/lib/ai/schemas";
import { conversationSystem, CORRECT_SYSTEM, JUDGE_SYSTEM, SUMMARY_SYSTEM, tutorSystem } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

type Msg = { role: "user" | "assistant"; content: string };
type Body = {
  task: AiTask;
  model?: string;
  economy?: boolean;
  context?: string;
  messages?: Msg[];
  scenarioRole?: string;
  level?: string;
  text?: string;
  instruction?: string;
  prompt?: string;
  expected?: string;
  answer?: string;
};

const MAX_CHARS = 6000;
const cache = new Map<string, unknown>();
const CACHE_MAX = 300;
const hits = new Map<string, { day: string; n: number }>();
const SERVER_DAILY_LIMIT = Number(process.env.AI_SERVER_DAILY_LIMIT ?? 400);

function bad(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function clip(s: unknown, n = MAX_CHARS): string {
  return typeof s === "string" ? s.slice(0, n) : "";
}

function rateLimited(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) {
    hits.set(ip, { day, n: 1 });
    return false;
  }
  h.n += 1;
  return h.n > SERVER_DAILY_LIMIT;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return bad(503, "AI is niet geconfigureerd: zet ANTHROPIC_API_KEY in de serveromgeving.");
  const code = process.env.APP_ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) return bad(401, "Onjuiste of ontbrekende toegangscode (zie Instellingen).");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return bad(429, "Daglimiet van de server bereikt. Probeer het morgen opnieuw.");

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad(400, "Ongeldige aanvraag.");
  }

  const model = (ALLOWED_MODELS as readonly string[]).includes(body.model ?? "") ? body.model! : process.env.AI_MODEL || "claude-opus-5-5";
  const effort = body.economy ? "low" : "medium";
  const ctx = clip(body.context, 1500) || "Onbekend.";
  const history = (body.messages ?? []).slice(-16).map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: clip(m.content, 2000) }));

  let system = "";
  let messages: { role: "user" | "assistant"; content: string }[] = [];
  let schema: Record<string, unknown> | null = null;
  let maxTokens = body.economy ? 2500 : 6000;

  switch (body.task) {
    case "tutor":
      system = tutorSystem(ctx);
      messages = history;
      break;
    case "conversation":
      system = conversationSystem(clip(body.scenarioRole, 500), clip(body.level, 20) || "A1", ctx);
      messages = history;
      schema = SCHEMAS.conversation;
      maxTokens = body.economy ? 1500 : 3000;
      break;
    case "correct":
      system = CORRECT_SYSTEM;
      messages = [{ role: "user", content: `Opdracht: ${clip(body.instruction, 500) || "vrije tekst"}\n\nTekst van de leerling:\n${clip(body.text)}` }];
      schema = SCHEMAS.correct;
      break;
    case "judge":
      system = JUDGE_SYSTEM;
      messages = [{ role: "user", content: `Opdracht: ${clip(body.prompt, 500)}\nModelantwoord: ${clip(body.expected, 500)}\nAntwoord leerling: ${clip(body.answer, 500)}` }];
      schema = SCHEMAS.judge;
      maxTokens = 1200;
      break;
    case "summary":
      system = SUMMARY_SYSTEM;
      messages = [{ role: "user", content: `Transcript:\n${history.map((m) => `${m.role === "user" ? "Leerling" : "Docent"}: ${m.content}`).join("\n")}` }];
      schema = SCHEMAS.summary;
      maxTokens = 2000;
      break;
    default:
      return bad(400, "Onbekende taak.");
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") return bad(400, "Er ontbreekt een bericht van de leerling.");

  // Cache voor herhaalbare taken (correctie, beoordeling): bespaart kosten.
  const cacheable = body.task === "correct" || body.task === "judge";
  const key = cacheable ? createHash("sha256").update(JSON.stringify([model, body.task, system, messages])).digest("hex") : "";
  if (cacheable && cache.has(key)) return NextResponse.json({ result: cache.get(key), cached: true });

  const client = new Anthropic();
  const supportsFallback = model !== "claude-haiku-5-5";
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: maxTokens,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      output_config: { effort, ...(schema ? { format: { type: "json_schema", schema } } : {}) },
      ...(supportsFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });

    if (response.stop_reason === "refusal") return bad(422, "De AI weigerde deze vraag. Probeer het anders te formuleren.");
    const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    if (response.stop_reason === "max_tokens" && schema) return bad(502, "Het antwoord van de AI was te lang en is afgebroken. Probeer het opnieuw.");

    let result: unknown = text;
    if (schema) {
      try {
        result = JSON.parse(text);
      } catch {
        return bad(502, "De AI gaf een onleesbaar antwoord. Probeer het opnieuw.");
      }
    }
    if (cacheable) {
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
      cache.set(key, result);
    }
    return NextResponse.json({ result, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens }, model });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return bad(503, "De API-sleutel is ongeldig.");
    if (err instanceof Anthropic.RateLimitError) return bad(429, "Te veel aanvragen bij de AI-dienst. Wacht even.");
    if (err instanceof Anthropic.BadRequestError) return bad(400, `AI-aanvraag geweigerd: ${err.message}`);
    if (err instanceof Anthropic.APIConnectionError) return bad(502, "Geen verbinding met de AI-dienst.");
    if (err instanceof Anthropic.APIError) return bad(502, `AI-dienst gaf een fout (${err.status ?? "?"}).`);
    return bad(500, "Onbekende fout bij de AI-aanvraag.");
  }
}
