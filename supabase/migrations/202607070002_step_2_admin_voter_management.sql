create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  region_id uuid references public.regions(id),
  result_visibility text not null default 'hidden' check (result_visibility in ('hidden', 'live', 'after_end')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint elections_valid_time_range check (end_time > start_time)
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  full_name text not null,
  party_name text,
  symbol_url text,
  biography text,
  region_id uuid references public.regions(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voter_eligibility (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.profiles(id) on delete cascade,
  election_id uuid not null references public.elections(id) on delete cascade,
  is_eligible boolean not null default false,
  has_voted boolean not null default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  voted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (voter_id, election_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_elections_status on public.elections(status);
create index if not exists idx_elections_region_id on public.elections(region_id);
create index if not exists idx_elections_start_time on public.elections(start_time);
create index if not exists idx_elections_end_time on public.elections(end_time);
create index if not exists idx_candidates_election_id on public.candidates(election_id);
create index if not exists idx_candidates_region_id on public.candidates(region_id);
create index if not exists idx_voter_eligibility_voter_id on public.voter_eligibility(voter_id);
create index if not exists idx_voter_eligibility_election_id on public.voter_eligibility(election_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

drop trigger if exists trg_elections_updated_at on public.elections;
create trigger trg_elections_updated_at
before update on public.elections
for each row execute function public.set_updated_at();

drop trigger if exists trg_candidates_updated_at on public.candidates;
create trigger trg_candidates_updated_at
before update on public.candidates
for each row execute function public.set_updated_at();

create or replace function public.is_auditor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'auditor')
  );
$$;

alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.voter_eligibility enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can read allowed elections" on public.elections;
create policy "Users can read allowed elections"
on public.elections
for select
to authenticated
using (
  public.is_admin()
  or region_id is null
  or region_id = (select region_id from public.profiles where id = auth.uid())
);

drop policy if exists "Admins can manage elections" on public.elections;
create policy "Admins can manage elections"
on public.elections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read active candidates" on public.candidates;
create policy "Users can read active candidates"
on public.candidates
for select
to authenticated
using (
  public.is_admin()
  or (
    is_active = true
    and exists (
      select 1
      from public.elections e
      where e.id = election_id
        and (e.region_id is null or e.region_id = (select region_id from public.profiles where id = auth.uid()))
    )
  )
);

drop policy if exists "Admins can manage candidates" on public.candidates;
create policy "Admins can manage candidates"
on public.candidates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Voters can read own eligibility" on public.voter_eligibility;
create policy "Voters can read own eligibility"
on public.voter_eligibility
for select
to authenticated
using (voter_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage eligibility" on public.voter_eligibility;
create policy "Admins can manage eligibility"
on public.voter_eligibility
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins and auditors can read audit logs" on public.audit_logs;
create policy "Admins and auditors can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_auditor());

drop policy if exists "Admins can insert audit logs" on public.audit_logs;
create policy "Admins can insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (public.is_admin());

grant select on public.elections to authenticated;
grant select on public.candidates to authenticated;
grant select on public.voter_eligibility to authenticated;
grant select on public.audit_logs to authenticated;
grant insert, update, delete on public.elections to authenticated;
grant insert, update, delete on public.candidates to authenticated;
grant insert, update, delete on public.voter_eligibility to authenticated;
grant insert on public.audit_logs to authenticated;
