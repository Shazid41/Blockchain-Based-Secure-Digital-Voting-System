import { demoBallots, demoCandidates, demoEligibility } from './demoData.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { listFirebaseCandidates, listFirebaseEligibility, listFirebaseVoteBlocks } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function getElectionResults(electionId) {
  if (isFirebaseConfigured) {
    const [candidates, voteBlocks, eligibilityRows] = await Promise.all([
      listFirebaseCandidates({ electionId }),
      listFirebaseVoteBlocks({ electionId }),
      listFirebaseEligibility({ electionId }),
    ]);
    const eligible = eligibilityRows.filter((row) => row.election_id === electionId && row.is_eligible);
    const totalVotes = voteBlocks.length;
    return candidates.map((candidate) => {
      const voteCount = voteBlocks.filter((block) => block.candidate_id === candidate.id).length;
      return {
        election_id: electionId,
        candidate_id: candidate.id,
        candidate_name: candidate.full_name,
        vote_count: voteCount,
        percentage: totalVotes ? Math.round((voteCount / totalVotes) * 10000) / 100 : 0,
        total_votes: totalVotes,
        total_eligible_voters: eligible.length,
        turnout_percentage: eligible.length ? Math.round((totalVotes / eligible.length) * 10000) / 100 : 0,
        last_update_time: new Date().toISOString(),
      };
    });
  }

  if (!isSupabaseConfigured) {
    const candidates = demoCandidates.filter((candidate) => candidate.election_id === electionId);
    const ballots = demoBallots.filter((ballot) => ballot.election_id === electionId);
    const eligible = demoEligibility.filter((row) => row.election_id === electionId && row.is_eligible);
    const totalVotes = ballots.length;
    const rows = candidates.map((candidate) => {
      const voteCount = ballots.filter((ballot) => ballot.candidate_id === candidate.id).length;
      return {
        election_id: electionId,
        candidate_id: candidate.id,
        candidate_name: candidate.full_name,
        vote_count: voteCount,
        percentage: totalVotes ? Math.round((voteCount / totalVotes) * 10000) / 100 : 0,
        total_votes: totalVotes,
        total_eligible_voters: eligible.length,
        turnout_percentage: eligible.length ? Math.round((totalVotes / eligible.length) * 10000) / 100 : 0,
        last_update_time: new Date().toISOString(),
      };
    });
    return rows;
  }
  const { data, error } = await supabase.rpc('election_results_summary', { p_election_id: electionId });
  if (error) throw error;
  return data;
}

export function getRegionTurnout() {
  return [];
}
