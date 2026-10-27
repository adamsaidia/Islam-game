import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    defaultModel: process.env.AI_MODEL || "claude-opus-5-5",
    accessCodeRequired: Boolean(process.env.APP_ACCESS_CODE),
  });
}
