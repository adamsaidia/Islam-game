# Installatie (lokaal)

## Benodigd
- Node.js 20.9 of nieuwer (getest met Node 22)
- PostgreSQL 15+ (lokaal) **of** een Supabase-project

## Stappen

1. **Afhankelijkheden**
   ```bash
   cd aqua-sisters
   npm install
   ```

2. **Omgevingsvariabelen**
   ```bash
   cp .env.example .env.local
   ```
   Minimaal nodig voor lokaal testen:
   ```
   DATABASE_URL=postgres://postgres@localhost:5432/aqua
   APP_URL=http://localhost:3000
   PAYMENT_PROVIDER=mock
   ALLOW_MOCK_PAYMENTS=true
   ENCRYPTION_KEY=<openssl rand -base64 32>
   ADMIN_2FA_OPTIONAL=true
   ```
   Met `PAYMENT_PROVIDER=mock` krijg je een testbetaalpagina (`/test-betaling/…`) waar je kiest
   tussen geslaagd / geannuleerd / mislukt / verlopen. Die pagina doorloopt exact dezelfde webhook-route als Mollie.
   Wil je echt via Mollie testen: `PAYMENT_PROVIDER=mollie` + `MOLLIE_API_KEY=test_…`. Webhooks van Mollie
   bereiken `localhost` niet; de bevestigingspagina haalt de status dan zelf server-side op bij Mollie.

3. **Database**
   ```bash
   npm run db:migrate
   ```
   Dit maakt alle tabellen, functies en het eerste evenement (Utrecht, 9 januari 2027) aan.

4. **Eerste beheerder**
   ```bash
   npm run user:create -- --email jij@example.nl --name "Jouw naam" --role admin
   ```
   Het wachtwoord wordt gevraagd (min. 12 tekens, letters + cijfers). Scanner-medewerkers maak je later aan in het dashboard
   (Gebruikers) of met `--role staff`.

5. **Starten**
   ```bash
   npm run dev
   ```
   - Website: http://localhost:3000
   - Dashboard: http://localhost:3000/admin
   - Scanner: http://localhost:3000/scanner (camera werkt op `localhost` en via HTTPS)

## Tests draaien

Unit- en integratietests gebruiken een **aparte, lege** Postgres-database (de tests wissen het schema):
```bash
createdb aqua_test
TEST_DATABASE_URL=postgres://postgres@localhost:5432/aqua_test npm test
```
End-to-end (bouwt eerst een productieversie):
```bash
createdb aqua_e2e
npm run build
E2E_DATABASE_URL=postgres://postgres@localhost:5432/aqua_e2e npm run test:e2e
```
