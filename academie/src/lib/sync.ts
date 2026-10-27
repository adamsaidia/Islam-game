"use client";
// Optionele synchronisatie met Supabase. Zonder configuratie blijft alles lokaal.
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { snapshot, useStore, type AppState } from "./store";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  client ??= createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export const syncConfigured = () => Boolean(url && anon);

export async function currentUser(): Promise<User | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

export async function sendMagicLink(email: string) {
  const sb = supabase();
  if (!sb) throw new Error("Supabase is niet geconfigureerd.");
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/instellingen` } });
  if (error) throw error;
}

export async function signOut() {
  await supabase()?.auth.signOut();
}

/** Uploadt de lokale stand (en toetsen/gesprekken als losse rijen). */
export async function push(): Promise<void> {
  const sb = supabase();
  const user = await currentUser();
  if (!sb || !user) throw new Error("Niet ingelogd.");
  const s = snapshot();
  const { error } = await sb.from("user_state").upsert({ user_id: user.id, state: s, updated_at: s.updatedAt });
  if (error) throw error;
  if (s.tests.length) {
    const { error: e2 } = await sb.from("test_results").upsert(
      s.tests.map((t) => ({ id: t.id, user_id: user.id, kind: t.kind, title: t.title, lesson_id: t.lessonId ?? null, score: t.score, skills: t.skills ?? null, taken_at: t.date })),
    );
    if (e2) throw e2;
  }
  if (s.transcripts.length) {
    const { error: e3 } = await sb.from("conversation_transcripts").upsert(
      s.transcripts.map((t) => ({ id: t.id, user_id: user.id, scenario: t.scenario, messages: t.messages, corrections: t.corrections, recommendations: t.recommendations, created_at: t.date })),
    );
    if (e3) throw e3;
  }
}

/** Haalt de cloudstand op. Vervangt lokaal alleen als de cloud nieuwer is (of force). */
export async function pull(force = false): Promise<"updated" | "local-newer" | "empty"> {
  const sb = supabase();
  const user = await currentUser();
  if (!sb || !user) throw new Error("Niet ingelogd.");
  const { data, error } = await sb.from("user_state").select("state, updated_at").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!data) return "empty";
  const remote = data.state as AppState;
  const local = snapshot();
  if (!force && local.updatedAt >= remote.updatedAt) return "local-newer";
  useStore.getState().importState(remote);
  return "updated";
}
