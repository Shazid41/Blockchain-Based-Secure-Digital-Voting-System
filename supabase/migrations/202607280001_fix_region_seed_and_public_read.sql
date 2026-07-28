insert into public.regions (id, name, code, description)
values
  ('11111111-1111-4111-8111-111111111111', 'North Region', 'NORTH', 'Sample northern voting region.'),
  ('22222222-2222-4222-8222-222222222222', 'South Region', 'SOUTH', 'Sample southern voting region.'),
  ('33333333-3333-4333-8333-333333333333', 'Central Region', 'CENTRAL', 'Sample central voting region.')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

alter table public.regions enable row level security;

drop policy if exists "Anyone can read regions" on public.regions;
drop policy if exists "Authenticated users can read regions" on public.regions;

create policy "Anyone can read regions"
on public.regions
for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.regions to anon, authenticated;
