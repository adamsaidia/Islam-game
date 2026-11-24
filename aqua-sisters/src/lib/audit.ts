import 'server-only';
import { sql } from './db';

export async function audit(
  actorUserId: string | null,
  action: string,
  entity?: string,
  entityId?: string | null,
  details?: unknown,
  ip?: string,
) {
  try {
    await sql`insert into audit_logs (actor_user_id, action, entity, entity_id, details, ip)
              values (${actorUserId}, ${action}, ${entity ?? null}, ${entityId ?? null},
                      ${details === undefined ? null : sql.json(details as never)}, ${ip ?? null})`;
  } catch (e) {
    console.error('[audit] schrijven mislukt', e);
  }
}
