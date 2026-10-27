-- Arabische Academie: opslag per gebruiker. Alle tabellen met Row Level Security:
-- een gebruiker kan alleen zijn/haar eigen rijen lezen en schrijven.

-- Volledige leerstatus (voortgang, flashcards, woordenboek, geschiedenis) als JSON-snapshot.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Toetsresultaten apart, zodat ze ook los te analyseren zijn.
create table if not exists public.test_results (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('placement', 'lesson', 'review')),
  title text not null,
  lesson_id int,
  score real not null check (score >= 0 and score <= 1),
  skills jsonb,
  taken_at timestamptz not null
);
create index if not exists test_results_user_idx on public.test_results (user_id, taken_at desc);

-- Transcripten van AI-gesprekken met correcties.
create table if not exists public.conversation_transcripts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario text not null,
  messages jsonb not null,
  corrections jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null
);
create index if not exists transcripts_user_idx on public.conversation_transcripts (user_id, created_at desc);

alter table public.user_state enable row level security;
alter table public.test_results enable row level security;
alter table public.conversation_transcripts enable row level security;

create policy "eigen state lezen" on public.user_state for select using ((select auth.uid()) = user_id);
create policy "eigen state invoegen" on public.user_state for insert with check ((select auth.uid()) = user_id);
create policy "eigen state wijzigen" on public.user_state for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigen state verwijderen" on public.user_state for delete using ((select auth.uid()) = user_id);

create policy "eigen toetsen lezen" on public.test_results for select using ((select auth.uid()) = user_id);
create policy "eigen toetsen invoegen" on public.test_results for insert with check ((select auth.uid()) = user_id);
create policy "eigen toetsen wijzigen" on public.test_results for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigen toetsen verwijderen" on public.test_results for delete using ((select auth.uid()) = user_id);

create policy "eigen gesprekken lezen" on public.conversation_transcripts for select using ((select auth.uid()) = user_id);
create policy "eigen gesprekken invoegen" on public.conversation_transcripts for insert with check ((select auth.uid()) = user_id);
create policy "eigen gesprekken wijzigen" on public.conversation_transcripts for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigen gesprekken verwijderen" on public.conversation_transcripts for delete using ((select auth.uid()) = user_id);
