-- Eerste evenement van Aqua Sisters (echte configuratie, geen testdata).
-- Leeftijdsgrenzen voor kinderen zijn bewust leeg gelaten tot ze bevestigd zijn.
insert into events (
  slug, title, subtitle, description, starts_at, ends_at,
  venue_name, venue_address, city, pool_name, dress_code, audience_note,
  child_age_min, child_age_max, capacity, status, hold_minutes
) values (
  'utrecht-9-januari-2027',
  'Exclusief vrouwenzwemmen',
  'Twee uur zwemmen in een volledig besloten setting',
  'Een avond in het recreatiebad van Zwembad Den Hommel, exclusief voor vrouwen en toegestane kinderen. Ontspan, zwem en geniet in alle rust en privacy.',
  timestamptz '2027-01-09 18:00:00 Europe/Amsterdam',
  timestamptz '2027-01-09 20:00:00 Europe/Amsterdam',
  'Zwembad Den Hommel', null, 'Utrecht', 'Recreatiebad',
  'Burkini verplicht',
  'Uitsluitend voor vrouwen en toegestane kinderen',
  null, null, 300, 'published', 10
) on conflict (slug) do nothing;

insert into ticket_types (event_id, name, category, price_cents, sort_order)
select e.id, v.name, v.category, v.price, v.sort
from events e
cross join (values ('Volwassene', 'adult', 1350, 1), ('Kind', 'child', 800, 2)) as v(name, category, price, sort)
where e.slug = 'utrecht-9-januari-2027'
  and not exists (select 1 from ticket_types t where t.event_id = e.id);
