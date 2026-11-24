import { sql } from '@/lib/db';
import { apiAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { toCsv } from '@/lib/csv';

export const dynamic = 'force-dynamic';

/** Alleen personen die afzonderlijk en vrijwillig toestemming gaven voor marketing. */
export async function GET() {
  const user = await apiAdmin();
  if (!user) return new Response('Geen toegang', { status: 401 });
  const rows = await sql<{ email: string; first_name: string; opted_in_at: Date }[]>`
    select distinct on (lower(email)) lower(email) as email, first_name, marketing_opt_in_at as opted_in_at
    from orders where marketing_opt_in and anonymized_at is null order by lower(email), marketing_opt_in_at desc`;
  await audit(user.id, 'export.newsletter', undefined, null, { count: rows.length });
  return new Response(toCsv(['E-mail', 'Voornaam', 'Toestemming gegeven op'], rows.map((r) => [r.email, r.first_name, r.opted_in_at?.toISOString() ?? ''])), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="nieuwsbrief-optins.csv"', 'Cache-Control': 'no-store' },
  });
}
