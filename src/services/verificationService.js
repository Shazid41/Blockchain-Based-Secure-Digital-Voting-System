import { demoBallots, demoElections, demoVoteBlocks } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function verifyVoteReceipt(receiptHash) {
  if (!isSupabaseConfigured) {
    const ballot = demoBallots.find((item) => item.receipt_hash === receiptHash);
    if (!ballot) {
      return { receipt_found: false, inclusion_status: 'not_found', chain_status: 'not_checked', verification_time: new Date().toISOString() };
    }
    const election = demoElections.find((item) => item.id === ballot.election_id);
    const block = demoVoteBlocks.find((item) => item.ballot_id === ballot.id);
    return {
      receipt_found: true,
      election_name: election?.title,
      block_index: block?.block_index,
      inclusion_status: block ? 'included' : 'missing_block',
      chain_status: 'valid_demo_chain',
      verification_time: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase.rpc('verify_vote_receipt', { p_receipt_hash: receiptHash });
  if (error) throw error;
  return data?.[0] ?? { receipt_found: false };
}
