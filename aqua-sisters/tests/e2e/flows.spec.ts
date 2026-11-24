import { expect, test, type Page } from '@playwright/test';
import postgres from 'postgres';

const SLUG = 'utrecht-9-januari-2027';

async function fillOrder(page: Page, opts: { adults: number; children: number; email?: string }) {
  await page.goto(`/reserveren/${SLUG}?utm_source=tiktok&utm_campaign=e2e`);
  // standaard staat er 1 volwassene
  for (let i = 1; i < opts.adults; i++) await page.getByTestId('plus-adult').click();
  for (let i = 0; i < opts.children; i++) await page.getByTestId('plus-child').click();
  await page.getByLabel('Voornaam').fill('Yasmina');
  await page.getByLabel('Achternaam').fill('El Amrani');
  await page.getByLabel('E-mailadres').fill(opts.email ?? 'yasmina@example.com');
  await page.getByTestId('terms').check();
}

async function pay(page: Page) {
  const mobile = await page.getByTestId('pay-mobile').isVisible();
  await page.getByTestId(mobile ? 'pay-mobile' : 'pay-desktop').click();
}

test('homepage toont evenement, prijzen en reserveringsknop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/zaterdag 9 januari 2027/i).first()).toBeVisible();
  await expect(page.getByText('€ 13,50').first()).toBeVisible();
  await expect(page.getByText('€ 8,00').first()).toBeVisible();
  await expect(page.getByText('Burkini verplicht').first()).toBeVisible();
  await page.getByTestId('hero-cta').click();
  await expect(page).toHaveURL(new RegExp(`/reserveren/${SLUG}`));
});

test('volledige bestelling: 2 volwassenen + 1 kind = € 35,00 → betalen → 3 tickets', async ({ page, request }) => {
  await fillOrder(page, { adults: 2, children: 1 });
  await expect(page.getByTestId('total')).toHaveText('€ 35,00');
  await pay(page);
  await expect(page).toHaveURL(/\/test-betaling\//);
  await page.getByTestId('mock-paid').click();
  await expect(page.getByTestId('success-title')).toHaveText('Jouw plekje is gereserveerd!');
  await expect(page.getByTestId('ticket')).toHaveCount(3);
  const href = await page.getByTestId('download-pdf').getAttribute('href');
  const pdf = await request.get(href!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
});

test('geannuleerde betaling toont geen tickets', async ({ page }) => {
  await fillOrder(page, { adults: 1, children: 0 });
  await pay(page);
  await page.getByTestId('mock-canceled').click();
  await expect(page.getByTestId('failed-title')).toBeVisible();
  await expect(page.getByTestId('ticket')).toHaveCount(0);
});

test('formulier toont duidelijke fouten', async ({ page }) => {
  await page.goto(`/reserveren/${SLUG}`);
  await pay(page);
  await expect(page.getByText('Vul je voornaam in')).toBeVisible();
  await expect(page.getByText('Vul een geldig e-mailadres in')).toBeVisible();
  await expect(page.getByText('Ga akkoord met de huisregels en voorwaarden')).toBeVisible();
});

test('dashboard en exports zijn afgeschermd', async ({ page, request }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto('/admin/bestellingen');
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await request.get('/admin/export/orders')).status()).toBe(401);
  expect((await request.get('/api/scanner/stats?eventId=00000000-0000-4000-8000-000000000000')).status()).toBe(401);
  expect((await request.post('/api/scanner/checkin', { data: { token: 'x' } })).status()).toBe(401);
  expect((await request.get('/api/cron')).status()).toBe(401);
});

test('medewerker kan niet in het dashboard', async ({ page }) => {
  await page.goto('/scanner/login');
  await page.getByLabel('E-mailadres').fill('scanner@e2e.test');
  await page.getByLabel('Wachtwoord').fill('e2e-wachtwoord-123');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await expect(page).toHaveURL(/\/scanner$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/scanner$/);
});

test('verkeerd wachtwoord wordt geweigerd', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('E-mailadres').fill('beheer@e2e.test');
  await page.getByLabel('Wachtwoord').fill('fout-wachtwoord-1');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await expect(page.getByText('E-mailadres of wachtwoord klopt niet.')).toBeVisible();
});

test('beheerder ziet verkoop en kan een bestelling openen', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('E-mailadres').fill('beheer@e2e.test');
  await page.getByLabel('Wachtwoord').fill('e2e-wachtwoord-123');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Verkochte tickets')).toBeVisible();
  await page.goto('/admin/bestellingen?q=yasmina');
  await expect(page.locator('td').getByText('Betaald').first()).toBeVisible();
  await page.locator('a[href^="/admin/bestellingen/"]').filter({ hasText: /^AS/ }).first().click();
  await expect(page.getByRole('heading', { name: /Bestelling AS/ })).toBeVisible();
  for (const path of ['/admin/evenementen', '/admin/financien', '/admin/marketing', '/admin/emails', '/admin/instellingen', '/admin/gebruikers', '/admin/privacy', '/admin/logboek', '/admin/account', '/admin/bestellingen/nieuw']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }
});

test('scanner: eerste scan groen, tweede scan rood, handmatig zoeken werkt', async ({ page, browser }) => {
  // Bestelling plaatsen en het QR-token van het eerste ticket uit de klantpagina halen
  await fillOrder(page, { adults: 2, children: 0, email: 'scan@example.com' });
  await pay(page);
  await page.getByTestId('mock-paid').click();
  await expect(page.getByTestId('ticket')).toHaveCount(2);
  const orderUrl = page.url();

  const ctx = await browser.newContext();
  const staff = await ctx.newPage();
  await staff.goto('/scanner/login');
  await staff.getByLabel('E-mailadres').fill('scanner@e2e.test');
  await staff.getByLabel('Wachtwoord').fill('e2e-wachtwoord-123');
  await staff.getByRole('button', { name: 'Inloggen' }).click();
  await expect(staff).toHaveURL(/\/scanner$/);
  const pick = staff.getByTestId('pick-event');
  if (await pick.count()) await pick.first().click();

  await staff.getByRole('button', { name: 'Zoeken' }).click();
  await staff.getByTestId('search-input').fill('El Amrani');
  staff.once('dialog', (d) => d.accept());
  await staff.getByTestId('manual-checkin').first().click();
  await expect(staff.getByTestId('result-ok')).toBeVisible();
  await expect(staff.getByTestId('result-ok').getByText('Yasmina El Amrani')).toBeVisible();
  await staff.getByTestId('next-scan').click();

  // Onbekende QR-code → rood
  await staff.getByRole('button', { name: 'Scannen' }).click();
  await staff.getByTestId('manual-token').fill('ONGELDIG_TOKEN_abcdefghijklmnopqrstuvwxyz0123');
  await staff.getByTestId('manual-token').press('Enter');
  await expect(staff.getByTestId('result-invalid')).toBeVisible();
  await staff.getByTestId('next-scan').click();
  await expect(staff.getByTestId('count-in')).not.toHaveText('0');
  await ctx.close();
  expect(orderUrl).toContain('/bestelling/');
});

test('dubbele QR-scan: twee scanners tegelijk → één groen, één rood', async ({ page }) => {
  // Token rechtstreeks uit de testdatabase (zoals de QR-code op het ticket het bevat).
  const db = postgres(process.env.E2E_DATABASE_URL || 'postgres://postgres@localhost:5433/aqua_e2e', { max: 1 });
  const [t] = await db<{ qr_token: string; event_id: string }[]>`select qr_token, event_id from tickets where status = 'valid' order by created_at desc limit 1`;
  await db.end();
  expect(t).toBeTruthy();
  await page.goto('/scanner/login');
  await page.getByLabel('E-mailadres').fill('scanner@e2e.test');
  await page.getByLabel('Wachtwoord').fill('e2e-wachtwoord-123');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await expect(page).toHaveURL(/\/scanner$/);
  const call = () =>
    page.evaluate(async (b) => (await fetch('/api/scanner/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json(), {
      token: t.qr_token,
      eventId: t.event_id,
      device: 'e2e',
    });
  const [a, b] = await Promise.all([call(), call()]);
  expect([a.result, b.result].sort()).toEqual(['already_used', 'ok']);

  // En via de scanner-UI: dezelfde code nogmaals → rood scherm
  const pick = page.getByTestId('pick-event');
  if (await pick.count()) await pick.first().click();
  await page.getByTestId('manual-token').fill(t.qr_token);
  await page.getByTestId('manual-token').press('Enter');
  await expect(page.getByTestId('result-already_used')).toBeVisible();
});

test('noodprocedure: offline scannen, dubbele scan op hetzelfde toestel, conflict na synchronisatie', async ({ page, context }) => {
  await fillOrder(page, { adults: 1, children: 0, email: 'offline@example.com' });
  await pay(page);
  await page.getByTestId('mock-paid').click();
  await expect(page.getByTestId('ticket')).toHaveCount(1);
  const db = postgres(process.env.E2E_DATABASE_URL || 'postgres://postgres@localhost:5433/aqua_e2e', { max: 1 });
  const [t] = await db<{ qr_token: string; event_id: string }[]>`select t.qr_token, t.event_id from tickets t join orders o on o.id = t.order_id where o.email = 'offline@example.com' order by t.created_at desc limit 1`;

  await page.goto('/scanner/login');
  await page.getByLabel('E-mailadres').fill('scanner@e2e.test');
  await page.getByLabel('Wachtwoord').fill('e2e-wachtwoord-123');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await expect(page).toHaveURL(/\/scanner$/);
  const pick = page.getByTestId('pick-event');
  if (await pick.count()) await pick.first().click();
  await expect(page.getByTestId('online-state')).toHaveText(/Online/);
  await page.waitForTimeout(1500); // noodlijst downloaden

  page.on('dialog', (d) => d.accept());
  await context.setOffline(true);
  const scan = async () => {
    await page.getByTestId('manual-token').fill(t.qr_token);
    await page.getByTestId('manual-token').press('Enter');
  };
  await scan();
  await expect(page.getByTestId('result-network')).toBeVisible();
  await page.getByTestId('result-network').getByRole('button', { name: 'Noodprocedure: offline modus' }).click();
  await scan();
  await expect(page.getByTestId('result-offline_ok')).toBeVisible();
  await page.getByTestId('next-scan').click();
  await scan();
  await expect(page.getByTestId('result-offline_used')).toBeVisible();
  await page.getByTestId('next-scan').click();

  // Intussen scant een ander (online) toestel hetzelfde ticket
  await db`select check_in_ticket(${t.qr_token}, null, ${t.event_id}, null, 'ander-toestel', 'scan')`;
  await db.end();

  await context.setOffline(false);
  await expect(page.getByText(/conflict/i).first()).toBeVisible({ timeout: 20_000 });
});

test('mobiel: betaalknop blijft onderin zichtbaar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'alleen mobiel');
  await page.goto(`/reserveren/${SLUG}`);
  await page.mouse.wheel(0, 400);
  await expect(page.getByTestId('pay-mobile')).toBeInViewport();
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Reserveer jouw tickets/ }).last()).toBeInViewport();
});
