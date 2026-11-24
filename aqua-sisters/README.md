# Aqua Sisters – ticketplatform

Complete webapplicatie voor de exclusieve zwemevenementen van Aqua Sisters: publieke website, supersnelle
bestelflow zonder account, Mollie-betalingen, automatische QR-tickets (mobiel + PDF + e-mail),
beheerdersdashboard en een QR-scanner voor medewerkers.

| Onderdeel | Waar |
|---|---|
| Website + bestellen | `/`, `/reserveren/[slug]`, `/bestelling/[token]` |
| Beheerdersdashboard | `/admin` |
| QR-scanner | `/scanner` |
| Database-migraties | `supabase/migrations/` |
| Documentatie | `docs/` |

## Snel starten (lokaal)

```bash
cd aqua-sisters
npm install
cp .env.example .env.local          # vul DATABASE_URL en ENCRYPTION_KEY in; PAYMENT_PROVIDER=mock voor testen
npm run db:migrate
npm run user:create -- --email jij@example.nl --name "Jouw naam" --role admin
npm run dev                          # http://localhost:3000
```

## Tests

```bash
npm test             # unit + integratietests (vereist een lege Postgres-testdatabase, zie docs/INSTALLATIE.md)
npm run test:e2e     # Playwright end-to-end (mobiel + desktop)
```

## Documentatie

- [Installatie](docs/INSTALLATIE.md)
- [Deployment naar productie](docs/DEPLOYMENT.md)
- [Handleiding beheerder](docs/BEHEERDER.md)
- [Handleiding QR-scanner + noodprocedure](docs/SCANNER.md)
- [Externe accounts en terugkerende kosten](docs/ACCOUNTS-EN-KOSTEN.md)
- [Architectuur en keuzes](docs/ARCHITECTUUR.md)
- [Testresultaten](docs/TESTRESULTATEN.md)
- [Resterende beperkingen en open punten](docs/BEPERKINGEN.md)
