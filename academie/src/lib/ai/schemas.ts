// Gedeelde types en JSON-schema's voor de AI-taken (client én server).

export type AiTask = "tutor" | "conversation" | "correct" | "judge" | "summary";

export type ConversationReply = {
  reply_ar: string;
  reply_nl: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  new_words: { ar: string; nl: string }[];
};

export type CorrectionResult = {
  corrected: string;
  errors: { original: string; corrected: string; type: string; explanation: string }[];
  feedback_nl: string;
  confidence: "hoog" | "middel" | "laag";
};

export type JudgeResult = {
  verdict: "correct" | "bijna" | "fout";
  explanation: string;
  confidence: "hoog" | "middel" | "laag";
};

export type SummaryResult = {
  summary_nl: string;
  weak_points: string[];
  recommendations: string[];
};

const str = { type: "string" } as const;
const conf = { type: "string", enum: ["hoog", "middel", "laag"] } as const;

export const SCHEMAS = {
  conversation: {
    type: "object",
    additionalProperties: false,
    required: ["reply_ar", "reply_nl", "corrections", "new_words"],
    properties: {
      reply_ar: str,
      reply_nl: str,
      corrections: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["original", "corrected", "explanation"], properties: { original: str, corrected: str, explanation: str } },
      },
      new_words: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["ar", "nl"], properties: { ar: str, nl: str } },
      },
    },
  },
  correct: {
    type: "object",
    additionalProperties: false,
    required: ["corrected", "errors", "feedback_nl", "confidence"],
    properties: {
      corrected: str,
      errors: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["original", "corrected", "type", "explanation"],
          properties: { original: str, corrected: str, type: str, explanation: str },
        },
      },
      feedback_nl: str,
      confidence: conf,
    },
  },
  judge: {
    type: "object",
    additionalProperties: false,
    required: ["verdict", "explanation", "confidence"],
    properties: { verdict: { type: "string", enum: ["correct", "bijna", "fout"] }, explanation: str, confidence: conf },
  },
  summary: {
    type: "object",
    additionalProperties: false,
    required: ["summary_nl", "weak_points", "recommendations"],
    properties: { summary_nl: str, weak_points: { type: "array", items: str }, recommendations: { type: "array", items: str } },
  },
} as const;

export const ALLOWED_MODELS = ["claude-opus-5-5", "claude-haiku-5-5"] as const;
export type AllowedModel = (typeof ALLOWED_MODELS)[number];
