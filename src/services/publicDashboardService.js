import { demoBallots, demoCandidates, demoElections, regionName } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

function hoursLeft(endTime) {
  const diffMs = new Date(endTime).getTime() - Date.now();
  if (diffMs <= 0) return 'Ended';
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function demoSnapshots() {
  return demoElections
    .filter((election) => election.status === 'active')
    .map((election) => {
      const candidates = demoCandidates.filter((candidate) => candidate.election_id === election.id);
      const chartRows = candidates.map((candidate, index) => {
        const realVotes = demoBallots.filter((ballot) => ballot.candidate_id === candidate.id).length;
        const boostedVotes = realVotes + [36, 28, 18][index % 3];
        return {
          candidate_id: candidate.id,
          candidate_name: candidate.full_name,
          party_name: candidate.party_name,
          vote_count: boostedVotes,
        };
      });
      const totalVotes = chartRows.reduce((sum, row) => sum + row.vote_count, 0);
      const leader = [...chartRows].sort((a, b) => b.vote_count - a.vote_count)[0];

      return {
        election_id: election.id,
        title: election.title,
        status: election.status,
        start_time: election.start_time,
        end_time: election.end_time,
        region_name: regionName(election.region_id),
        total_votes: totalVotes,
        leader_name: leader?.candidate_name ?? 'No votes yet',
        leader_votes: leader?.vote_count ?? 0,
        candidates: chartRows.map((row) => ({
          ...row,
          percentage: totalVotes ? Math.round((row.vote_count / totalVotes) * 100) : 0,
        })),
        time_left: hoursLeft(election.end_time),
      };
    });
}

export async function listPublicElectionDashboard() {
  if (!isSupabaseConfigured) return demoSnapshots();

  const { data, error } = await supabase.rpc('public_live_election_dashboard');
  if (error) return demoSnapshots();
  if (!data?.length) return demoSnapshots();

  return data.map((row) => ({
    ...row,
    candidates: Array.isArray(row.candidates) ? row.candidates : [],
    time_left: hoursLeft(row.end_time),
  }));
}
