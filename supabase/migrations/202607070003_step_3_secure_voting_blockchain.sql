create table if not exists public.ballots (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  anonymous_voter_hash text not null,
  cast_at timestamptz not null default now(),
  receipt_hash text not null unique
);

create table if not exists public.vote_blocks (
  id uuid primary key default gen_random_uuid(),
  ballot_id uuid not null unique references public.ballots(id) on delete restrict,
  election_id uuid not null references public.elections(id) on delete cascade,
  block_index bigint not null,
  previous_hash text not null,
  data_hash text not null,
  current_hash text not null unique,
  created_at timestamptz not null default now(),
  unique (election_id, block_index)
);

create table if not exists public.fraud_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  election_id uuid references public.elections(id),
  event_type text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  details jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  email_hash text,
  ip_hash text,
  success boolean not null default false,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_ballots_election_id on public.ballots(election_id);
create index if not exists idx_ballots_candidate_id on public.ballots(candidate_id);
create index if not exists idx_vote_blocks_election_id on public.vote_blocks(election_id);
create index if not exists idx_vote_blocks_block_index on public.vote_blocks(block_index);
create index if not exists idx_fraud_logs_risk_level on public.fraud_logs(risk_level);
create index if not exists idx_fraud_logs_created_at on public.fraud_logs(created_at);
create index if not exists idx_login_attempts_email_hash on public.login_attempts(email_hash);
create index if not exists idx_login_attempts_attempted_at on public.login_attempts(attempted_at);

alter table public.ballots enable row level security;
alter table public.vote_blocks enable row level security;
alter table public.fraud_logs enable row level security;
alter table public.login_attempts enable row level security;

create or replace function public.sha256_hex(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select encode(digest(input, 'sha256'), 'hex');
$$;

create or replace function public.vote_data_hash(p_election_id uuid, p_ballot_id uuid, p_candidate_id uuid, p_anonymous_voter_hash text, p_cast_at timestamptz)
returns text
language sql
immutable
set search_path = public
as $$
  select public.sha256_hex(
    p_election_id::text || '|' || p_ballot_id::text || '|' || p_candidate_id::text || '|' ||
    p_anonymous_voter_hash || '|' || to_char(p_cast_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  );
$$;

create or replace function public.vote_block_hash(p_block_index bigint, p_election_id uuid, p_ballot_id uuid, p_data_hash text, p_previous_hash text, p_created_at timestamptz)
returns text
language sql
immutable
set search_path = public
as $$
  select public.sha256_hex(
    p_block_index::text || '|' || p_election_id::text || '|' || p_ballot_id::text || '|' ||
    p_data_hash || '|' || p_previous_hash || '|' || to_char(p_created_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  );
$$;

create or replace function public.log_fraud_event(p_user_id uuid, p_election_id uuid, p_event_type text, p_risk_level text, p_details jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.fraud_logs (user_id, election_id, event_type, risk_level, details)
  values (p_user_id, p_election_id, p_event_type, p_risk_level, coalesce(p_details, '{}'::jsonb));
end;
$$;

create or replace function public.cast_secure_vote(p_election_id uuid, p_candidate_id uuid)
returns table (
  election_title text,
  cast_at timestamptz,
  receipt_hash text,
  block_index bigint,
  current_block_hash text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_election public.elections%rowtype;
  v_candidate public.candidates%rowtype;
  v_eligibility public.voter_eligibility%rowtype;
  v_ballot_id uuid := gen_random_uuid();
  v_cast_at timestamptz := now();
  v_anonymous_hash text;
  v_receipt_hash text;
  v_previous_hash text := repeat('0', 64);
  v_block_index bigint := 0;
  v_data_hash text;
  v_block_hash text;
  v_secret text := coalesce(nullif(current_setting('app.vote_salt', true), ''), current_database() || '|vote-salt');
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    raise exception 'PROFILE_MISSING';
  end if;

  if v_profile.role <> 'voter' then
    perform public.log_fraud_event(v_user_id, p_election_id, 'non_voter_vote_attempt', 'high', jsonb_build_object('role', v_profile.role));
    raise exception 'ONLY_VOTERS_CAN_VOTE';
  end if;

  if v_profile.approval_status <> 'approved' then
    perform public.log_fraud_event(v_user_id, p_election_id, v_profile.approval_status || '_voter_trying_to_vote', 'high', jsonb_build_object('approval_status', v_profile.approval_status));
    raise exception 'VOTER_NOT_APPROVED';
  end if;

  select * into v_election from public.elections where id = p_election_id;
  if not found then
    raise exception 'ELECTION_NOT_FOUND';
  end if;

  if v_election.status <> 'active' then
    perform public.log_fraud_event(v_user_id, p_election_id, 'inactive_election_vote_attempt', 'medium', jsonb_build_object('status', v_election.status));
    raise exception 'ELECTION_NOT_ACTIVE';
  end if;

  if now() < v_election.start_time then
    perform public.log_fraud_event(v_user_id, p_election_id, 'vote_before_start', 'medium', '{}');
    raise exception 'ELECTION_NOT_STARTED';
  end if;

  if now() > v_election.end_time then
    perform public.log_fraud_event(v_user_id, p_election_id, 'vote_after_end', 'medium', '{}');
    raise exception 'ELECTION_ENDED';
  end if;

  if v_election.region_id is not null and v_profile.region_id is distinct from v_election.region_id then
    perform public.log_fraud_event(v_user_id, p_election_id, 'wrong_region_vote_attempt', 'high', jsonb_build_object('voter_region', v_profile.region_id, 'election_region', v_election.region_id));
    raise exception 'REGION_MISMATCH';
  end if;

  select * into v_candidate
  from public.candidates
  where id = p_candidate_id and election_id = p_election_id;
  if not found or v_candidate.is_active = false then
    perform public.log_fraud_event(v_user_id, p_election_id, 'invalid_candidate', 'medium', jsonb_build_object('candidate_id', p_candidate_id));
    raise exception 'INVALID_CANDIDATE';
  end if;

  select * into v_eligibility
  from public.voter_eligibility
  where voter_id = v_user_id and election_id = p_election_id
  for update;

  if not found or v_eligibility.is_eligible = false then
    perform public.log_fraud_event(v_user_id, p_election_id, 'ineligible_vote_attempt', 'high', '{}');
    raise exception 'VOTER_NOT_ELIGIBLE';
  end if;

  if v_eligibility.has_voted = true then
    perform public.log_fraud_event(v_user_id, p_election_id, 'duplicate_vote_attempt', 'critical', '{}');
    raise exception 'DUPLICATE_VOTE';
  end if;

  v_anonymous_hash := public.sha256_hex(v_user_id::text || '|' || p_election_id::text || '|' || v_secret);
  v_receipt_hash := public.sha256_hex(v_ballot_id::text || '|' || p_election_id::text || '|' || v_cast_at::text || '|' || gen_random_uuid()::text);

  insert into public.ballots (id, election_id, candidate_id, anonymous_voter_hash, cast_at, receipt_hash)
  values (v_ballot_id, p_election_id, p_candidate_id, v_anonymous_hash, v_cast_at, v_receipt_hash);

  select vb.current_hash, vb.block_index + 1
  into v_previous_hash, v_block_index
  from public.vote_blocks vb
  where vb.election_id = p_election_id
  order by vb.block_index desc
  limit 1
  for update;

  if v_previous_hash is null then
    v_previous_hash := repeat('0', 64);
    v_block_index := 0;
  end if;

  v_data_hash := public.vote_data_hash(p_election_id, v_ballot_id, p_candidate_id, v_anonymous_hash, v_cast_at);
  v_block_hash := public.vote_block_hash(v_block_index, p_election_id, v_ballot_id, v_data_hash, v_previous_hash, v_cast_at);

  insert into public.vote_blocks (ballot_id, election_id, block_index, previous_hash, data_hash, current_hash, created_at)
  values (v_ballot_id, p_election_id, v_block_index, v_previous_hash, v_data_hash, v_block_hash, v_cast_at);

  update public.voter_eligibility
  set has_voted = true, voted_at = v_cast_at
  where id = v_eligibility.id;

  insert into public.audit_logs (actor_id, action, target_table, target_id, metadata)
  values (v_user_id, 'vote.cast', 'ballots', v_ballot_id, jsonb_build_object('election_id', p_election_id, 'block_index', v_block_index));

  return query select v_election.title, v_cast_at, v_receipt_hash, v_block_index, v_block_hash;
exception
  when unique_violation then
    perform public.log_fraud_event(v_user_id, p_election_id, 'duplicate_or_race_vote_attempt', 'critical', jsonb_build_object('sqlstate', SQLSTATE));
    raise exception 'DUPLICATE_VOTE';
end;
$$;

create or replace function public.verify_election_chain(p_election_id uuid)
returns table (
  is_valid boolean,
  total_blocks bigint,
  verified_blocks bigint,
  first_invalid_block bigint,
  error_type text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  expected_previous text := repeat('0', 64);
  expected_data text;
  expected_current text;
  expected_index bigint := 0;
  total bigint;
  verified bigint := 0;
begin
  if not public.is_auditor() then
    raise exception 'PERMISSION_DENIED';
  end if;

  select count(*) into total from public.vote_blocks where election_id = p_election_id;
  if total = 0 then
    return query select false, 0::bigint, 0::bigint, null::bigint, 'chain_empty', 'No vote blocks exist for this election.';
    return;
  end if;

  for r in
    select vb.*, b.candidate_id, b.anonymous_voter_hash, b.cast_at, b.id as ballot_exists
    from public.vote_blocks vb
    left join public.ballots b on b.id = vb.ballot_id
    where vb.election_id = p_election_id
    order by vb.block_index
  loop
    if r.block_index <> expected_index then
      return query select false, total, verified, expected_index, 'missing_block', 'Block index sequence is missing or reordered.';
      return;
    end if;

    if r.ballot_exists is null then
      perform public.log_fraud_event(null, p_election_id, 'missing_vote_block_ballot', 'critical', jsonb_build_object('block_index', r.block_index));
      return query select false, total, verified, r.block_index, 'ballot_missing', 'A vote block references a missing ballot.';
      return;
    end if;

    if r.previous_hash <> expected_previous then
      perform public.log_fraud_event(null, p_election_id, 'blockchain_mismatch', 'critical', jsonb_build_object('error', 'invalid_previous_hash', 'block_index', r.block_index));
      return query select false, total, verified, r.block_index, 'invalid_previous_hash', 'Previous hash does not match the earlier block.';
      return;
    end if;

    expected_data := public.vote_data_hash(r.election_id, r.ballot_id, r.candidate_id, r.anonymous_voter_hash, r.cast_at);
    if r.data_hash <> expected_data then
      return query select false, total, verified, r.block_index, 'invalid_data_hash', 'Data hash does not match the ballot data.';
      return;
    end if;

    expected_current := public.vote_block_hash(r.block_index, r.election_id, r.ballot_id, r.data_hash, r.previous_hash, r.created_at);
    if r.current_hash <> expected_current then
      return query select false, total, verified, r.block_index, 'invalid_current_hash', 'Current hash does not match the canonical block data.';
      return;
    end if;

    verified := verified + 1;
    expected_previous := r.current_hash;
    expected_index := expected_index + 1;
  end loop;

  return query select true, total, verified, null::bigint, 'none', 'Chain is valid.';
end;
$$;

create or replace function public.verify_vote_receipt(p_receipt_hash text)
returns table (
  receipt_found boolean,
  election_name text,
  block_index bigint,
  inclusion_status text,
  chain_status text,
  verification_time timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
begin
  select e.title, vb.block_index, vb.election_id
  into v_record
  from public.ballots b
  join public.elections e on e.id = b.election_id
  join public.vote_blocks vb on vb.ballot_id = b.id
  where b.receipt_hash = p_receipt_hash;

  if not found then
    return query select false, null::text, null::bigint, 'not_found', 'not_checked', now();
    return;
  end if;

  return query select true, v_record.title, v_record.block_index, 'included', 'available_for_admin_audit', now();
end;
$$;

create or replace function public.election_results_summary(p_election_id uuid)
returns table (
  election_id uuid,
  candidate_id uuid,
  candidate_name text,
  vote_count bigint,
  percentage numeric,
  total_votes bigint,
  total_eligible_voters bigint,
  turnout_percentage numeric,
  last_update_time timestamptz
)
language sql
security definer
set search_path = public
as $$
  with totals as (
    select
      count(b.id)::bigint as total_votes,
      (select count(*)::bigint from public.voter_eligibility ve where ve.election_id = p_election_id and ve.is_eligible = true) as total_eligible,
      max(b.cast_at) as last_update
    from public.ballots b
    where b.election_id = p_election_id
  )
  select
    c.election_id,
    c.id,
    c.full_name,
    count(b.id)::bigint,
    case when t.total_votes = 0 then 0 else round((count(b.id)::numeric / t.total_votes::numeric) * 100, 2) end,
    t.total_votes,
    t.total_eligible,
    case when t.total_eligible = 0 then 0 else round((t.total_votes::numeric / t.total_eligible::numeric) * 100, 2) end,
    coalesce(t.last_update, now())
  from public.candidates c
  cross join totals t
  left join public.ballots b on b.candidate_id = c.id and b.election_id = p_election_id
  join public.elections e on e.id = c.election_id
  where c.election_id = p_election_id
    and (
      public.is_admin()
      or e.result_visibility = 'live'
      or (e.result_visibility = 'after_end' and now() > e.end_time)
    )
  group by c.election_id, c.id, c.full_name, t.total_votes, t.total_eligible, t.last_update;
$$;

drop policy if exists "No direct ballot access for clients" on public.ballots;
create policy "Admins and auditors can read ballot audit rows"
on public.ballots
for select
to authenticated
using (public.is_auditor());

drop policy if exists "Admins and auditors can read vote blocks" on public.vote_blocks;
create policy "Admins and auditors can read vote blocks"
on public.vote_blocks
for select
to authenticated
using (public.is_auditor());

drop policy if exists "Admins can read fraud logs" on public.fraud_logs;
create policy "Admins can read fraud logs"
on public.fraud_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can resolve fraud logs" on public.fraud_logs;
create policy "Admins can resolve fraud logs"
on public.fraud_logs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can insert own login attempts" on public.login_attempts;
create policy "Users can insert own login attempts"
on public.login_attempts
for insert
to authenticated
with check (user_id = auth.uid() or user_id is null);

revoke all on public.ballots from anon, authenticated;
revoke all on public.vote_blocks from anon, authenticated;
grant select on public.ballots to authenticated;
grant select on public.vote_blocks to authenticated;
grant select, update on public.fraud_logs to authenticated;
grant insert on public.login_attempts to authenticated;

revoke execute on function public.cast_secure_vote(uuid, uuid) from public;
revoke execute on function public.verify_election_chain(uuid) from public;
revoke execute on function public.verify_vote_receipt(text) from public;
revoke execute on function public.election_results_summary(uuid) from public;
grant execute on function public.cast_secure_vote(uuid, uuid) to authenticated;
grant execute on function public.verify_election_chain(uuid) to authenticated;
grant execute on function public.verify_vote_receipt(text) to anon, authenticated;
grant execute on function public.election_results_summary(uuid) to authenticated;
