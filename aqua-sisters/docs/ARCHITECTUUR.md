# Architectuur en keuzes

## Stack
- **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4** – één applicatie voor website, dashboard, scanner en API.
- **PostgreSQL (Supabase)** – via een directe server-side verbinding (`postgres`-driver, Supabase transaction pooler).
- **Mollie** – gehoste checkout, webhooks, terugbetalingen (REST API, geen SDK nodig).
- **Resend** – e-mail (REST API).
- **pdf-lib + qrcode** – PDF-tickets en QR-codes. **@zxing/browser** – camerascanner.
- Geen shadcn/ui: alle componenten zijn op maat gemaakt in de Aqua Sisters-huisstijl (licht en snel).

## Belangrijke ontwerpkeuzes
| Onderwerp | Keuze | Waarom |
|---|---|---|
| Kritieke logica | In **databasefuncties** (`create_order`, `confirm_order_paid`, `check_in_ticket`) | Atomair en met rijvergrendeling: capaciteit en check-ins zijn ook bij gelijktijdige verzoeken correct. |
| Capaciteit | Berekend uit geldige tickets + actieve reserveringen (`reserved_until > now()`) | Verlopen reserveringen komen *vanzelf* vrij, ook zonder cron. |
| Betaalstatus | Altijd server-side opgehaald bij de provider (webhook én retourpagina) | Redirect of webhook-inhoud wordt nooit vertrouwd; bedrag, valuta en bestelling worden gecontroleerd. |
| Idempotentie | `confirm_order_paid` vergrendelt de bestelling en geeft maar één keer `paid` | Herhaalde webhooks → nooit dubbele tickets of e-mails. |
| Beheerdersauth | Eigen sessies (httpOnly-cookie, gehasht in DB) + scrypt + TOTP-2FA | Volledig testbaar, rollen in eigen tabel, 2FA afdwingbaar. Supabase Auth was mogelijk, maar voegt een tweede identiteitssysteem toe zonder voordeel voor een handvol beheerders. |
| Publieke Supabase-API | Volledig dichtgezet (RLS aan, geen policies, functies ingetrokken) | De anon key geeft geen toegang tot gegevens. |
| Realtime | Polling (dashboard 15 s, scanner 4 s) i.p.v. Supabase Realtime | Werkt overal (ook achter de pooler), geen extra configuratie; ruim voldoende voor deze schaal. |
| Afbeeldingen | Opgeslagen in de database (max. 3 MB, magic-bytes-controle), met lange cache | Geen extra opslagdienst nodig voor een handvol evenementfoto's. Kan later naar Supabase Storage. |
| QR-inhoud | Alleen een willekeurig token van ±244 bits | Geen persoonsgegevens, niet te raden. |
| Geld | Overal gehele **eurocenten** (integer) | Geen afrondingsfouten. |
| Rate limiting | Teller in de database (`rate_limit_hit`) | Werkt over meerdere serverinstanties heen. |
| Offline scannen | Noodlijst met SHA-256-hashes per toestel, expliciet in te schakelen; conflicten na synchronisatie gemeld | Zie SCANNER.md. |

## Datamodel (tabellen)
`events`, `ticket_types`, `orders`, `order_items`, `tickets`, `payments`, `payment_webhook_events`, `refunds`,
`users`, `user_roles`, `sessions`, `check_ins`, `discount_codes`, `waitlist`, `expenses`, `email_logs`, `settings`,
`audit_logs`, `images`, `rate_limits`, `schema_migrations`. Met foreign keys, unieke constraints, indexen,
check-constraints, automatische `updated_at`-timestamps en RLS.

## Bestelflow
1. Bezoeker kiest tickets → `POST /api/orders` → `create_order` vergrendelt het evenement, controleert verkoopstatus,
   limieten, kortingscode en capaciteit, en reserveert de plekken (standaard 10 min).
2. Mollie-betaling aangemaakt → bezoeker naar gehoste checkout (iDEAL | Wero, Apple Pay, kaarten…).
3. Mollie roept `/api/webhooks/mollie` aan → status opgehaald → `confirm_order_paid` → tickets aangemaakt → e-mail met PDF.
4. Retourpagina `/bestelling/[token]` toont status; bij vertraging haalt die zelf de status op (vangnet).
5. Mislukt/geannuleerd/verlopen → plekken vrij. Te laat betaald en vol → automatische terugbetaling.

## Beveiliging (samenvatting)
Server-side autorisatie op elke pagina, actie en API-route; rollen admin/staff; scrypt-wachtwoorden; TOTP-2FA
(versleuteld opgeslagen, AES-256-GCM); rate limiting op inloggen, bestellen, kortingscodes, wachtlijst en e-mail;
Zod-validatie; geparametriseerde SQL (geen SQL-injectie); React-escaping + escaping in e-mails (geen XSS);
CSV-formule-injectie geneutraliseerd; uploads op type en inhoud gecontroleerd; security headers (HSTS, nosniff,
frame-deny, permissions-policy); geen geheime sleutels in frontendcode; volledige auditlog.
