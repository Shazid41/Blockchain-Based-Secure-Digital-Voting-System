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
      and approval_status = 'approved'
  );
$$;

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
select
  users.id,
  'Md. Shazidur Rahaman',
  users.email,
  '0000000000000000',
  null,
  null,
  null,
  'admin',
  'approved'
from auth.users
where lower(users.email) = 'shazidsaharia21@gmail.com'
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = 'admin',
  approval_status = 'approved',
  updated_at = now();

grant execute on function public.is_admin() to anon, authenticated;
