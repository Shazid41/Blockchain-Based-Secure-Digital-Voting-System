import { demoBallots, demoElections, demoVoteBlocks } from './demoData.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { listFirebaseReceiptsForVoter, verifyFirebaseVoteReceipt } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function verifyVoteReceipt(receiptHash) {
  const normalizedHash = String(receiptHash ?? '').trim();
  if (isFirebaseConfigured) return verifyFirebaseVoteReceipt(normalizedHash);

  if (!isSupabaseConfigured) {
    const ballot = demoBallots.find((item) => item.receipt_hash === normalizedHash);
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
  const { data, error } = await supabase.rpc('verify_vote_receipt', { p_receipt_hash: normalizedHash });
  if (error) throw error;
  return data?.[0] ?? { receipt_found: false };
}

export async function listVoterReceipts(voterId) {
  if (isFirebaseConfigured) return listFirebaseReceiptsForVoter(voterId);
  if (!voterId) return [];
  return demoBallots.map((ballot) => {
    const election = demoElections.find((item) => item.id === ballot.election_id);
    const block = demoVoteBlocks.find((item) => item.ballot_id === ballot.id);
    return {
      election_id: ballot.election_id,
      election_title: election?.title ?? 'Election',
      cast_at: ballot.cast_at,
      receipt_hash: ballot.receipt_hash,
      block_index: block?.block_index,
      current_block_hash: block?.current_hash ?? ballot.receipt_hash,
      chain_status: 'valid_demo_chain',
    };
  });
}
