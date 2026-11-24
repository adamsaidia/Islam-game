import 'server-only';
import { sql } from './db';
import { env } from './env';
import { getSettings } from './settings';
import { getPaymentProvider } from './payments';
import type { ProviderPaymentStatus } from './payments/types';
import { queueOrderEmail } from './email';
import { audit } from './audit';
import { ORDER_ERRORS, pickUtm, type OrderInput } from './validation';

type CreateOrderResult =
  | { ok: true; orderId: string; accessToken: string; orderNumber: string; totalCents: number; status: string }
  | { ok: false; error: string; message: string; remaining?: number };

export async function createOrderRecord(
  input: Omit<OrderInput, 'acceptTerms'> & { acceptTerms?: boolean },
  opts: { admin?: boolean; free?: boolean; createdBy?: string | null } = {},
): Promise<CreateOrderResult> {
  const settings = await getSettings();
  const bank = input.paymentMethod === 'banktransfer' && (settings.checkout.bankTransferEnabled || !!opts.admin) && !opts.free;
  const items = input.items.filter((i) => i.quantity > 0).map((i) => ({ ticket_type_id: i.ticketTypeId, quantity: i.quantity }));
  const [{ r }] = await sql<{ r: Record<string, unknown> }[]>`
    select create_order(
      ${input.eventId}, ${sql.json(items)}, ${input.firstName}, ${input.lastName}, ${input.email}, ${input.phone || null},
      ${input.discountCode || null}, ${bank}, ${settings.checkout.transferHoldHours * 60},
      ${input.marketingOptIn ?? false}, ${pickUtm(input.utm) ? sql.json(pickUtm(input.utm)!) : null},
      ${opts.createdBy ?? null}, ${opts.admin ?? false}, ${opts.free ?? false}
    ) as r`;
  if (!r.ok) {
    const code = String(r.error);
    return { ok: false, error: code, message: ORDER_ERRORS[code] ?? 'Bestellen is niet gelukt.', remaining: r.remaining as number | undefined };
  }
  return {
    ok: true,
    orderId: r.order_id as string,
    accessToken: r.access_token as string,
    orderNumber: r.order_number as string,
    totalCents: r.total_cents as number,
    status: r.status as string,
  };
}

/** Maakt een betaling aan bij de provider en geeft de checkout-URL terug. */
export async function startPayment(orderId: string): Promise<{ checkoutUrl: string } | { error: string }> {
  const [o] = await sql<{ id: string; order_number: string; total_cents: number; access_token: string; status: string; reserved_until: Date | null; title: string }[]>`
    select o.id, o.order_number, o.total_cents, o.access_token, o.status, o.reserved_until, e.title
    from orders o join events e on e.id = o.event_id where o.id = ${orderId}`;
  if (!o) return { error: 'Bestelling niet gevonden' };
  if (o.status !== 'pending' || !o.reserved_until || o.reserved_until < new Date()) {
    return { error: 'Deze reservering is verlopen. Plaats een nieuwe bestelling.' };
  }
  // Hergebruik een recente openstaande betaling, zodat er niet dubbel betaald kan worden.
  const [open] = await sql<{ checkout_url: string }[]>`
    select checkout_url from payments where order_id = ${o.id} and status = 'open' and checkout_url is not null
      and created_at > now() - interval '12 minutes' order by created_at desc limit 1`;
  if (open) return { checkoutUrl: open.checkout_url };

  const provider = getPaymentProvider();
  const [pay] = await sql<{ id: string }[]>`
    insert into payments (order_id, provider, amount_cents, status) values (${o.id}, ${provider.name}, ${o.total_cents}, 'open') returning id`;
  const webhookUrl = /^https:\/\//.test(env.appUrl) || provider.name === 'mock' ? `${env.appUrl}/api/webhooks/${provider.name}` : null;
  try {
    const created = await provider.createPayment({
      orderId: o.id,
      orderNumber: o.order_number,
      amountCents: o.total_cents,
      description: `Aqua Sisters ${o.order_number}`,
      redirectUrl: `${env.appUrl}/bestelling/${o.access_token}?retour=1`,
      cancelUrl: `${env.appUrl}/bestelling/${o.access_token}?geannuleerd=1`,
      webhookUrl,
      idempotencyKey: `payment-${pay.id}`,
    });
    await sql`update payments set provider_payment_id = ${created.providerPaymentId}, checkout_url = ${created.checkoutUrl},
              status = ${created.status}, mode = ${created.mode} where id = ${pay.id}`;
    return { checkoutUrl: created.checkoutUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[betaling] aanmaken mislukt', msg);
    await sql`update payments set status = 'failed', raw = ${sql.json({ error: msg.slice(0, 300) })} where id = ${pay.id}`;
    return { error: 'De betaalpagina is tijdelijk niet beschikbaar. Probeer het over een paar minuten opnieuw.' };
  }
}

/** Volledige bestelflow voor bezoekers. */
export async function placeOrder(input: OrderInput) {
  const settings = await getSettings();
  const persons = input.items.reduce((s, i) => s + i.quantity, 0);
  if (persons > settings.checkout.maxPersonsPerOrder * 1) {
    // persons_per_unit wordt in de database meegewogen; dit is een snelle extra grens.
    return { ok: false as const, message: `Je kunt maximaal ${settings.checkout.maxPersonsPerOrder} tickets per bestelling kopen.` };
  }
  const created = await createOrderRecord(input);
  if (!created.ok) return { ok: false as const, message: created.message, code: created.error, remaining: created.remaining };

  const orderUrl = `${env.appUrl}/bestelling/${created.accessToken}`;

  if (created.totalCents === 0) {
    await finalizePaidOrder(created.orderId, 0, 'free');
    return { ok: true as const, redirectUrl: orderUrl };
  }
  if (created.status === 'awaiting_transfer') {
    await queueOrderEmail('order_received', created.orderId);
    return { ok: true as const, redirectUrl: orderUrl };
  }
  const pay = await startPayment(created.orderId);
  if ('error' in pay) {
    // Plekken direct vrijgeven als de betaalprovider onbereikbaar is.
    await sql`update orders set status = 'cancelled', reserved_until = now() where id = ${created.orderId} and status = 'pending'`;
    return { ok: false as const, message: pay.error };
  }
  return { ok: true as const, redirectUrl: pay.checkoutUrl };
}

/** Roept de atomaire databasefunctie aan en verstuurt tickets precies één keer. */
export async function finalizePaidOrder(orderId: string, amountCents: number, method: string | null) {
  const [{ r }] = await sql<{ r: { result: string; tickets?: number; expected?: number; received?: number } }[]>`
    select confirm_order_paid(${orderId}, ${amountCents}, ${method}) as r`;
  if (r.result === 'paid') {
    await queueOrderEmail('tickets', orderId);
  } else if (r.result === 'over_capacity') {
    await audit(null, 'order.over_capacity', 'order', orderId, { amountCents });
    const refund = await refundOrder(orderId, { amountCents, reason: 'Automatisch: betaling na verlopen reservering, evenement vol', actorId: null, ticketIds: [], silent: true });
    if (refund.ok) await queueOrderEmail('over_capacity', orderId, { amountCents });
  } else if (r.result === 'amount_mismatch') {
    await audit(null, 'payment.amount_mismatch', 'order', orderId, r);
  }
  return r;
}

const PROVIDER_TO_ORDER_STATUS: Partial<Record<ProviderPaymentStatus, 'cancelled' | 'expired'>> = {
  canceled: 'cancelled',
  failed: 'cancelled',
  expired: 'expired',
};

/**
 * Verwerkt de actuele status van een betaling. Wordt aangeroepen door de webhook én
 * door de bevestigingspagina. De status wordt altijd server-side bij de provider
 * opgehaald – de redirect of de webhook-payload zelf wordt nooit vertrouwd.
 */
export async function syncPayment(providerName: string, providerPaymentId: string) {
  const [payment] = await sql<{ id: string; order_id: string; amount_cents: number; status: string }[]>`
    select id, order_id, amount_cents, status from payments where provider = ${providerName} and provider_payment_id = ${providerPaymentId}`;
  if (!payment) return { result: 'unknown_payment' as const };

  const provider = getPaymentProvider(providerName);
  const remote = await provider.getPayment(providerPaymentId);

  if (remote.orderId && remote.orderId !== payment.order_id) {
    await audit(null, 'payment.order_mismatch', 'payment', payment.id, { remoteOrder: remote.orderId });
    return { result: 'order_mismatch' as const };
  }
  await sql`update payments set status = ${remote.status}, method = ${remote.method}, mode = ${remote.mode},
            raw = coalesce(raw, '{}'::jsonb) || ${sql.json({ last_sync: new Date().toISOString(), refunded: remote.amountRefundedCents, charged_back: remote.amountChargedBackCents })}
            where id = ${payment.id}`;

  if (remote.status === 'paid') {
    if (remote.currency !== 'EUR' || remote.amountCents !== payment.amount_cents) {
      await audit(null, 'payment.amount_mismatch', 'payment', payment.id, { remote: remote.amountCents, expected: payment.amount_cents, currency: remote.currency });
      return { result: 'amount_mismatch' as const };
    }
    if (remote.amountChargedBackCents > 0) {
      await audit(null, 'payment.chargeback', 'payment', payment.id, { amount: remote.amountChargedBackCents });
    }
    const r = await finalizePaidOrder(payment.order_id, remote.amountCents, remote.method);
    if (r.result === 'paid') await sql`update payments set raw = coalesce(raw, '{}'::jsonb) || '{"settled_order": true}'::jsonb where id = ${payment.id}`;
    if (r.result === 'already_paid') await refundDuplicatePayment(payment.id, payment.order_id, providerName, providerPaymentId, remote.amountCents);
    return { result: r.result };
  }

  const orderStatus = PROVIDER_TO_ORDER_STATUS[remote.status];
  if (orderStatus) {
    // Alleen afsluiten als er geen andere lopende of geslaagde betaling voor deze bestelling is.
    await sql`
      update orders set status = ${orderStatus}, reserved_until = least(reserved_until, now())
      where id = ${payment.order_id} and status = 'pending'
        and not exists (select 1 from payments p where p.order_id = ${payment.order_id} and p.id <> ${payment.id}
                        and p.status in ('open', 'pending', 'authorized', 'paid'))`;
  }
  return { result: remote.status };
}

/** Synchroniseert de meest recente betaling van een bestelling (bijv. na terugkeer van de betaalpagina). */
export async function syncLatestPaymentForOrder(orderId: string) {
  const [p] = await sql<{ provider: string; provider_payment_id: string }[]>`
    select provider, provider_payment_id from payments where order_id = ${orderId} and provider_payment_id is not null
    order by created_at desc limit 1`;
  if (!p) return null;
  try {
    return await syncPayment(p.provider, p.provider_payment_id);
  } catch (e) {
    console.error('[betaling] synchroniseren mislukt', e);
    return null;
  }
}

/** Volledige of gedeeltelijke terugbetaling, optioneel met annulering van specifieke tickets. */
export async function refundOrder(
  orderId: string,
  opts: { amountCents: number; reason: string; actorId: string | null; ticketIds: string[]; silent?: boolean },
): Promise<{ ok: true; status: string } | { ok: false; message: string }> {
  const [o] = await sql<{ id: string; total_cents: number; refunded_cents: number; status: string }[]>`select id, total_cents, refunded_cents, status from orders where id = ${orderId}`;
  if (!o) return { ok: false, message: 'Bestelling niet gevonden' };
  const refundable = o.total_cents - o.refunded_cents;
  if (opts.amountCents < 0 || opts.amountCents > refundable) return { ok: false, message: `Maximaal terug te betalen: ${(refundable / 100).toFixed(2)}` };
  if (opts.amountCents === 0 && opts.ticketIds.length === 0) return { ok: false, message: 'Geen bedrag of tickets gekozen' };

  let providerRefund: { id: string; status: string } | null = null;
  let paymentId: string | null = null;
  let providerName: string | null = null;

  if (opts.amountCents > 0) {
    const [p] = await sql<{ id: string; provider: string; provider_payment_id: string }[]>`
      select id, provider, provider_payment_id from payments where order_id = ${orderId} and status = 'paid' order by created_at desc limit 1`;
    if (p) {
      try {
        providerRefund = await getPaymentProvider(p.provider).createRefund(p.provider_payment_id, opts.amountCents, `Terugbetaling ${orderId.slice(0, 8)}`);
        paymentId = p.id;
        providerName = p.provider;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await audit(opts.actorId, 'refund.failed', 'order', orderId, { msg, amount: opts.amountCents });
        return { ok: false, message: `Terugbetaling bij de betaalprovider mislukt: ${msg}` };
      }
    }
  }

  await sql.begin(async (tx) => {
    if (opts.amountCents > 0) {
      await tx`insert into refunds (order_id, payment_id, provider, provider_refund_id, amount_cents, status, reason, ticket_ids, created_by)
               values (${orderId}, ${paymentId}, ${providerName}, ${providerRefund?.id ?? null}, ${opts.amountCents},
                       ${providerRefund ? providerRefund.status : 'manual'}, ${opts.reason}, ${opts.ticketIds}, ${opts.actorId})`;
    }
    if (opts.ticketIds.length) {
      await tx`update tickets set status = 'refunded' where order_id = ${orderId} and id = any(${opts.ticketIds}::uuid[]) and status = 'valid'`;
    }
    const newRefunded = o.refunded_cents + opts.amountCents;
    const [{ remaining }] = await tx<{ remaining: number }[]>`select count(*)::int as remaining from tickets where order_id = ${orderId} and status in ('valid','checked_in')`;
    // Volledig terugbetaald = geld volledig terug (betaalde bestelling) of alle tickets vervallen (gratis bestelling).
    const full = o.total_cents > 0 ? newRefunded >= o.total_cents : remaining === 0;
    if (full) {
      await tx`update tickets set status = 'refunded' where order_id = ${orderId} and status = 'valid'`;
    }
    const status = o.status === 'over_capacity' ? 'over_capacity' : full ? 'refunded' : newRefunded > 0 || opts.ticketIds.length ? 'partially_refunded' : o.status;
    await tx`update orders set refunded_cents = ${newRefunded}, status = ${full ? 'refunded' : status} where id = ${orderId}`;
  });

  await audit(opts.actorId, 'order.refund', 'order', orderId, { amountCents: opts.amountCents, ticketIds: opts.ticketIds, reason: opts.reason });
  if (!opts.silent && opts.amountCents > 0) await queueOrderEmail('refund', orderId, { amountCents: opts.amountCents });
  return { ok: true, status: providerRefund?.status ?? 'manual' };
}

/** Als een bestelling twee keer betaald is (twee betaalpogingen), wordt de extra betaling automatisch teruggestort. */
async function refundDuplicatePayment(paymentId: string, orderId: string, providerName: string, providerPaymentId: string, amountCents: number) {
  const [{ paid }] = await sql<{ paid: number }[]>`select count(*)::int as paid from payments where order_id = ${orderId} and status = 'paid'`;
  if (paid < 2) return;
  const [winner] = await sql<{ id: string }[]>`select id from payments where order_id = ${orderId} and raw->>'settled_order' = 'true' limit 1`;
  if (!winner || winner.id === paymentId) return;
  const [existing] = await sql`select 1 from refunds where payment_id = ${paymentId}`;
  if (existing) return;
  try {
    const r = await getPaymentProvider(providerName).createRefund(providerPaymentId, amountCents, 'Dubbele betaling');
    await sql`insert into refunds (order_id, payment_id, provider, provider_refund_id, amount_cents, status, reason)
              values (${orderId}, ${paymentId}, ${providerName}, ${r.id}, ${amountCents}, ${r.status}, 'Automatisch: dubbele betaling')`;
    await audit(null, 'payment.duplicate_refunded', 'payment', paymentId, { amountCents });
  } catch (e) {
    await audit(null, 'payment.duplicate_refund_failed', 'payment', paymentId, { error: String(e) });
  }
}
