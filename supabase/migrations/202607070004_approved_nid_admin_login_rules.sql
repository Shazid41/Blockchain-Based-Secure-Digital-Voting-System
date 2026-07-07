create unique index if not exists idx_profiles_phone_unique on public.profiles(phone) where phone is not null;

create table if not exists public.approved_nids (
  nid text primary key,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint approved_nids_format check (nid ~ '^(\d{10}|\d{16})$')
);

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

alter table public.approved_nids enable row level security;

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

drop policy if exists "Admins can manage approved nids" on public.approved_nids;
create policy "Admins can manage approved nids"
on public.approved_nids
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.is_nid_available_for_signup(text) to anon, authenticated;
grant select, insert, update on public.approved_nids to authenticated;
