# Arabische Academie

Een webapp (PWA) om zelfstandig **Modern Standaardarabisch** te leren, met Nederlands als instructietaal.
Nadruk op zelf produceren: spreken, schrijven en lezen zonder harakat.

## Wat werkt er nu

| Onderdeel | Status |
|---|---|
| **70 uitgewerkte lessen, A0 t/m C1**, elk met leerdoel, uitleg, voorbeelden, oefeningen, feedback en eindtoets (behaald bij ≥ 80%) | ✅ |
| A0 (1–14): alfabet, verbindingen, harakat, sukun, shadda, tanween, hamza/ة/ى/ال | ✅ |
| A1 (15–40): basiswoordenschat, voornaamwoorden, naamwoordzin, voorzetsels, tegenwoordige en verleden tijd, ontkenning, meervoud, idafa, getallen tot 100, tijd, kleuren | ✅ |
| A2 (41–50): toekomst, gebiedende wijs, أَنْ + werkwoord, boodschappen, de weg vragen, tweevoud, vergelijken, betrekkelijke zinnen, gezondheid | ✅ |
| B1 (51–58): woordwortels, werkwoordsvormen II–X, deelwoorden en masdar, i'rab, werk, nieuws lezen | ✅ |
| B2 (59–64): lijdende vorm, voorwaardelijke zinnen, verbindingswoorden, mening geven, ḥāl | ✅ |
| C1 (65–70): academisch schrijven (Fuṣḥā vs. dialect), retoriek, spreekwoorden en poëzie, discussie, lange teksten zonder harakat | ✅ |
| Niveautoets aan het eind van elk niveau (les 30, 40, 50, 58, 64, 70) | ✅ |
| Instaptoets met 9 onderdelen → persoonlijk startpunt | ✅ |
| Toetsenpagina: wekelijkse voortgangstoets, niveau-evaluaties, toetsgeschiedenis per vaardigheid | ✅ |
| Voortgang, fouten, toetsresultaten en hervatten (lokaal opgeslagen) | ✅ |
| Dashboard, dagelijkse planner (20/30/45/60 min, studiedagen, weekoverzicht, inhalen) | ✅ |
| Flashcards met FSRS (herkennen én zelf schrijven), persoonlijk woordenboek | ✅ |
| Leesmodule in 5 fasen met 18 teksten; harakat aan/deels/uit, klikbare woorden, hardop lezen | ✅ |
| Schrijfbord met eerlijke vormvergelijking, Arabisch toetsenbord, naamvalsoefeningen | ✅ |
| Luistermodule met snelheid, transcript, vertaling, luisterdictee | ✅ |
| Spraak: jezelf opnemen en terugluisteren, handsfree gesprekken, lange teksten betrouwbaar voorlezen | ✅ |
| AI-spreektrainer (11 scenario's), AI-docent, AI-schrijfcorrectie | ✅ code klaar — **werkt pas met `ANTHROPIC_API_KEY`** |
| Supabase-login en synchronisatie | ✅ code klaar — **werkt pas met Supabase-gegevens** |
| PWA (installeerbaar, offline voor bezochte pagina's), licht/donker, mobiel | ✅ |
| GitHub Actions: typecheck, tests en build bij elke wijziging | ✅ |
| Dialectmodules en verdieping na C1 | ⏳ gepland, zichtbaar als "in ontwikkeling" |

### Eerlijke beperkingen

- **Uitspraak** wordt alleen indirect beoordeeld: de spraakherkenning van de browser moet je woorden verstaan. Er is geen fonetische analyse.
- **Spraakherkenning** werkt in Chrome, Edge en Safari, niet in Firefox. De browser stuurt audio naar zijn eigen dienst (Google/Apple).
- **Voorlezen** gebruikt de stem van je apparaat. Zonder Arabische stem kan de uitspraak onjuist zijn; de app waarschuwt dan.
- **Schrijfbord** vergelijkt de vorm van je letter met de voorbeeldletter. Het herkent geen handschrift en beoordeelt de volgorde van de streken niet.
- **Inhoud B2/C1**: langere teksten staan bewust zonder harakat (zoals in kranten). De Arabische inhoud is zorgvuldig geschreven en automatisch gecontroleerd op harakat-regels, maar nog niet door een docent nagekeken.
- **AI-antwoorden** worden nooit automatisch lesstof. Woorden uit AI-gesprekken komen als "niet gecontroleerd" in je woordenboek; pas na jouw bevestiging worden het flashcards.

## Snel starten

```bash
cd academie
npm install
cp .env.example .env.local   # optioneel: vul AI- en Supabase-gegevens in
npm run dev                   # http://localhost:3000
```

Zonder `.env.local` werkt alles behalve AI en cloudsynchronisatie.

## Omgevingsvariabelen

| Variabele | Nodig voor | Waar |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI-gesprekken, AI-docent, correctie | alleen server |
| `AI_MODEL` | standaardmodel (`claude-opus-5-5` of `claude-haiku-5-5`) | server |
| `APP_ACCESS_CODE` | beschermt je AI-routes als de site publiek staat | server (+ zelfde code in Instellingen) |
| `AI_SERVER_DAILY_LIMIT` | max. AI-aanvragen per IP per dag (standaard 400) | server |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | login en sync | publiek (anon key is daarvoor bedoeld) |

De API-sleutel wordt alleen in `src/app/api/ai/route.ts` gebruikt en nooit naar de browser gestuurd.

## Supabase instellen (optioneel, gratis)

1. Maak een project op supabase.com.
2. Open de SQL-editor en voer `supabase/migrations/0001_init.sql` uit (tabellen + Row Level Security).
3. Zet bij Authentication → URL Configuration je site-URL (bijv. `https://jouw-app.vercel.app`).
4. Zet `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` in je omgeving.
5. In de app: Instellingen → Account → inloglink via e-mail → "Upload naar cloud".

## Publiceren op Vercel

1. Importeer de GitHub-repository in Vercel.
2. Zet **Root Directory** op `academie`.
3. Voeg de omgevingsvariabelen toe (minimaal `APP_ACCESS_CODE` als je `ANTHROPIC_API_KEY` gebruikt).
4. Deploy. Op je telefoon: open de site → "Zet op beginscherm".

## Testen

```bash
npm run typecheck   # TypeScript
npm test            # 40+ unittests: lesinhoud, harakat-regels, antwoordcontrole, planner, FSRS, opslag
npm run build && npm start   # in een tweede terminal:
npm run test:e2e    # Chromium: alle pagina's (mobiel + desktop) en een echte oefenflow
```

De inhoudstests controleren o.a.: doorlopende les-ids (70), niveautoetsen per niveau, de vereiste grammaticaonderwerpen, geldige antwoorden, unieke ids, minimaal 40% productieve oefeningen per les,
harakat-regels (geen dubbele klinkers, tanween -an met alif, tanween alleen aan het eind) en een glos voor elk woord in de leesteksten.

## Kosten

| Onderdeel | Kosten |
|---|---|
| Lessen, toetsen, flashcards, planner, lezen, schrijfbord | gratis |
| Voorlezen en spraakherkenning (browser) | gratis |
| Supabase (gratis tier) en Vercel (Hobby) | gratis voor persoonlijk gebruik |
| Claude Opus 5.5 ($4 / $20 per mln tokens) | ca. 1–3 cent per gespreksbeurt |
| Claude Haiku 5.5 ($0,10 / $0,50 per mln tokens) | ca. 0,05 cent per gespreksbeurt |

In Instellingen kies je AI uit / zuinig (40 aanroepen per dag) / normaal (200), en het model.
Correcties en beoordelingen worden op de server gecachet.

## Architectuur

```
src/
  app/                 pagina's (Next.js App Router) + api/ai (server-side Claude)
  components/          UI (shadcn-stijl), Arabische tekst, toetsenbord, schrijfbord, oefeningen
  content/             lessen (per niveau), letters, leesteksten (passages.ts, texts.ts), instaptoets, scenario's
  lib/
    arabic.ts          harakat, normalisatie, antwoordcontrole (hamza/ة/ى apart herkend)
    store.ts           alle leerdata (Zustand, lokaal opgeslagen)
    srs.ts             FSRS-flashcards (ts-fsrs)
    planner.ts         dagplan en niveau-inschatting
    speech.ts          voorlezen en spraakherkenning (Web Speech API)
    sync.ts            Supabase-login en synchronisatie
    ai/                prompts, JSON-schema's, client
supabase/migrations/   databaseschema met RLS
tests/, scripts/       unittests, rooktest, interactieve browsertest
```

Lesinhoud staat als getypeerde TypeScript-data in `src/content`. Een nieuwe les = een object toevoegen; de tests controleren de structuur en de harakat.

Gebruikte techniek: Next.js 15, TypeScript, Tailwind CSS 4, eigen componenten in shadcn/ui-stijl (geen CLI-generatie), Zustand, ts-fsrs, Supabase, Anthropic SDK.

## Ontwikkelfases

| Fase | Status |
|---|---|
| 1. Architectuur en ontwerp | ✅ |
| 2. Werkende beginnersomgeving (30 lessen, dashboard, planner) | ✅ |
| 3. Uitgebreide vaardigheden (lezen, schrijven, luisteren, grammatica, woordenschat) | ✅ |
| 4. AI-spreektrainer + spraak (opnemen, handsfree) | ✅ (AI vereist API-sleutel) |
| 5. Curriculum A2 → C1 | ✅ 70 lessen |
| 6. Optimalisatie en testen | ✅ unit- en browsertests, CI |
| 7. Publicatie | ✅ klaar voor Vercel + Supabase (zie hierboven) |

Mogelijke uitbreidingen: dialectmodules, meer authentieke teksten per niveau, neurale TTS-stem en Whisper-STT (betaald, optioneel), inhoudscontrole door een docent.
