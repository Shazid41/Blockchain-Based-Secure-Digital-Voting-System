create extension if not exists pgcrypto;

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  voter_number text not null unique,
  phone text,
  date_of_birth date,
  region_id uuid references public.regions(id),
  role text not null default 'voter' check (role in ('voter', 'admin', 'auditor')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint voter_number_format check (voter_number ~ '^(\d{10}|\d{16})$')
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_approval_status on public.profiles(approval_status);
create index if not exists idx_profiles_region_id on public.profiles(region_id);
create unique index if not exists idx_profiles_phone_unique on public.profiles(phone) where phone is not null;

create table if not exists public.approved_nids (
  nid text primary key,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint approved_nids_format check (nid ~ '^(\d{10}|\d{16})$')
);

insert into public.regions (name, code, description)
values
  ('North Region', 'NORTH', 'Sample northern voting region.'),
  ('South Region', 'SOUTH', 'Sample southern voting region.'),
  ('Central Region', 'CENTRAL', 'Sample central voting region.')
on conflict (code) do nothing;

insert into public.approved_nids (nid, note, is_active)
values
  ('2394859539', 'Demo voter 01', true),
  ('4212911590', 'Demo voter 02', true),
  ('1029384756', 'Demo voter 03', true),
  ('5647382910', 'Demo voter 04', true),
  ('9182736450', 'Demo voter 05', true),
  ('1234567890', 'Demo voter 06', true),
  ('9876543210', 'Demo voter 07', true),
  ('1122334455', 'Demo voter 08', true),
  ('5566778899', 'Demo voter 09', true),
  ('1234567890123456', 'Demo voter 10', true)
on conflict (nid) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nid text := coalesce(new.raw_user_meta_data ->> 'voter_number', '');
begin
  if lower(coalesce(new.email, '')) = 'shazidsaharia21@gmail.com' then
    insert into public.profiles (
      id,
      full_name,
      email,
      voter_number,
      phone,
      date_of_birth,
      region_id,
      role,
      approval_status
    )
    values (
      new.id,
      'Md. Shazidur Rahaman',
      coalesce(new.email, ''),
      '0000000000000000',
      null,
      null,
      null,
      'admin',
      'approved'
    )
    on conflict (id) do nothing;

    return new;
  end if;

  if not exists (
    select 1
    from public.approved_nids
    where nid = v_nid
      and is_active = true
  ) then
    raise exception 'approved nid required';
  end if;

  if exists (
    select 1
    from public.profiles
    where voter_number = v_nid
  ) then
    raise exception 'nid already registered';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    voter_number,
    phone,
    date_of_birth,
    region_id,
    role,
    approval_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    v_nid,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data ->> 'region_id', '')::uuid,
    'voter',
    'pending'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.regions enable row level security;
alter table public.profiles enable row level security;
alter table public.approved_nids enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_nid_available_for_signup(p_nid text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.approved_nids
    where nid = p_nid
      and is_active = true
  )
  and not exists (
    select 1
    from public.profiles
    where voter_number = p_nid
  );
$$;

drop policy if exists "Anyone can read regions" on public.regions;
drop policy if exists "Authenticated users can read regions" on public.regions;
create policy "Anyone can read regions"
on public.regions
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage regions" on public.regions;
create policy "Admins can manage regions"
on public.regions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage approved nids" on public.approved_nids;
create policy "Admins can manage approved nids"
on public.approved_nids
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update safe own profile fields" on public.profiles;
create policy "Users can update safe own profile fields"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
  and approval_status = (select approval_status from public.profiles where id = auth.uid())
);

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.regions to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.is_nid_available_for_signup(text) to anon, authenticated;
grant select, insert, update on public.approved_nids to authenticated;
