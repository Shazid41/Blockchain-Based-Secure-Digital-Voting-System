import { demoElections, demoReceipt } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function castSecureVote(electionId, candidateId) {
  if (!candidateId) throw new Error('Please select a candidate.');
  if (!isSupabaseConfigured) {
    const election = demoElections.find((item) => item.id === electionId);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      election_title: election?.title ?? demoReceipt.electionName,
      cast_at: new Date().toISOString(),
      receipt_hash: `receipt-demo-${Date.now()}`,
      block_index: 1,
      current_block_hash: 'e'.repeat(64),
    };
  }
  const { data, error } = await supabase.rpc('cast_secure_vote', {
    p_election_id: electionId,
    p_candidate_id: candidateId,
  });
  if (error) throw error;
  return data?.[0];
}
