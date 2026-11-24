import { PageHeader, Flash, Section, TableWrap, Status } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatDateTime } from '@/lib/dates';
import { createUser, reset2fa, resetPassword, setUserActive } from './actions';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const users = await sql<{ id: string; name: string; email: string; is_active: boolean; totp_enabled: boolean; last_login_at: Date | null; roles: string[] }[]>`
    select u.id, u.name, u.email, u.is_active, u.totp_enabled, u.last_login_at, coalesce(array_agg(r.role) filter (where r.role is not null), '{}') as roles
    from users u left join user_roles r on r.user_id = u.id group by u.id order by u.is_active desc, u.name`;
  return (
    <>
      <PageHeader title="Gebruikers" />
      <Flash msg={sp.msg} error={sp.error} />
      <Section title="Nieuw account">
        <form action={createUser} className="grid gap-3 text-sm sm:grid-cols-5 sm:items-end">
          <label><span className="label mb-1">Naam</span><input name="name" className="input" required /></label>
          <label><span className="label mb-1">E-mail</span><input name="email" type="email" className="input" required /></label>
          <label><span className="label mb-1">Rol</span><select name="role" className="input"><option value="staff">Medewerker (alleen scanner)</option><option value="admin">Beheerder</option></select></label>
          <label><span className="label mb-1">Tijdelijk wachtwoord</span><input name="password" type="text" minLength={12} className="input" required autoComplete="new-password" /></label>
          <div><SubmitButton>Aanmaken</SubmitButton></div>
        </form>
        <p className="mt-2 text-xs text-muted">Minimaal 12 tekens, letters en cijfers. Medewerkers hebben uitsluitend toegang tot /scanner.</p>
      </Section>
      <Section title="Accounts">
        <TableWrap>
          <table className="table">
            <thead><tr><th>Naam</th><th>Rol</th><th>2FA</th><th>Laatst ingelogd</th><th>Status</th><th>Acties</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}<div className="text-xs text-muted">{u.email}</div></td>
                  <td>{u.roles.map((r) => (r === 'admin' ? 'Beheerder' : 'Medewerker')).join(', ')}</td>
                  <td>{u.totp_enabled ? 'Aan' : <span className="text-warn">Uit</span>}</td>
                  <td className="text-xs">{u.last_login_at ? formatDateTime(u.last_login_at) : '—'}</td>
                  <td><Status value={u.is_active ? 'valid' : 'inactive'} label={u.is_active ? 'Actief' : 'Gedeactiveerd'} /></td>
                  <td className="space-y-2">
                    {u.id !== me.id && (
                      <form action={setUserActive}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="active" value={String(!u.is_active)} /><SubmitButton className="text-xs underline">{u.is_active ? 'Deactiveren' : 'Activeren'}</SubmitButton></form>
                    )}
                    <details className="text-xs">
                      <summary className="cursor-pointer underline">Wachtwoord / 2FA</summary>
                      <form action={resetPassword} className="mt-2 flex gap-2"><input type="hidden" name="id" value={u.id} /><input name="password" minLength={12} placeholder="Nieuw wachtwoord" className="input" required /><SubmitButton>Zetten</SubmitButton></form>
                      {u.totp_enabled && <form action={reset2fa} className="mt-2"><input type="hidden" name="id" value={u.id} /><SubmitButton className="text-xs text-danger underline" confirm="2FA van deze gebruiker resetten?">2FA resetten</SubmitButton></form>}
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Section>
    </>
  );
}
