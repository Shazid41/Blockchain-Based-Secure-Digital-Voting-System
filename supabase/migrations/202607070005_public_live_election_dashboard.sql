create or replace function public.public_live_election_dashboard()
returns table (
  election_id uuid,
  title text,
  status text,
  start_time timestamptz,
  end_time timestamptz,
  region_name text,
  total_votes bigint,
  leader_name text,
  leader_votes bigint,
  candidates jsonb
)
language sql
security definer
set search_path = public
as $$
  with active_elections as (
    select e.id, e.title, e.status, e.start_time, e.end_time, coalesce(r.name, 'All Regions') as region_name
    from public.elections e
    left join public.regions r on r.id = e.region_id
    where e.status = 'active'
      and e.result_visibility = 'live'
  ),
  candidate_votes as (
    select
      ae.id as election_id,
      c.id as candidate_id,
      c.full_name as candidate_name,
      c.party_name,
      count(b.id)::bigint as vote_count
    from active_elections ae
    join public.candidates c on c.election_id = ae.id and c.is_active = true
    left join public.ballots b on b.candidate_id = c.id
    group by ae.id, c.id, c.full_name, c.party_name
  ),
  totals as (
    select election_id, sum(vote_count)::bigint as total_votes
    from candidate_votes
    group by election_id
  ),
  leaders as (
    select distinct on (election_id)
      election_id,
      candidate_name as leader_name,
      vote_count as leader_votes
    from candidate_votes
    order by election_id, vote_count desc, candidate_name asc
  )
  select
    ae.id as election_id,
    ae.title,
    ae.status,
    ae.start_time,
    ae.end_time,
    ae.region_name,
    coalesce(t.total_votes, 0) as total_votes,
    coalesce(l.leader_name, 'No votes yet') as leader_name,
    coalesce(l.leader_votes, 0) as leader_votes,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'candidate_id', cv.candidate_id,
          'candidate_name', cv.candidate_name,
          'party_name', cv.party_name,
          'vote_count', cv.vote_count,
          'percentage', case when coalesce(t.total_votes, 0) = 0 then 0 else round((cv.vote_count::numeric / t.total_votes::numeric) * 100, 2) end
        )
        order by cv.vote_count desc, cv.candidate_name asc
      ) filter (where cv.candidate_id is not null),
      '[]'::jsonb
    ) as candidates
  from active_elections ae
  left join candidate_votes cv on cv.election_id = ae.id
  left join totals t on t.election_id = ae.id
  left join leaders l on l.election_id = ae.id
  group by ae.id, ae.title, ae.status, ae.start_time, ae.end_time, ae.region_name, t.total_votes, l.leader_name, l.leader_votes
  order by ae.end_time asc;
$$;

grant execute on function public.public_live_election_dashboard() to anon, authenticated;
grant execute on function public.election_results_summary(uuid) to anon, authenticated;
