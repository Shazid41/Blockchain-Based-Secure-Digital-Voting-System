import { demoElections, demoVoteBlocks } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function verifyElectionChain(electionId) {
  if (!isSupabaseConfigured) {
    const blocks = demoVoteBlocks.filter((block) => block.election_id === electionId);
    return {
      is_valid: blocks.length > 0,
      total_blocks: blocks.length,
      verified_blocks: blocks.length,
      first_invalid_block: null,
      error_type: blocks.length ? 'none' : 'chain_empty',
      message: blocks.length ? 'Demo chain is valid.' : 'No demo blocks for this election.',
      verified_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase.rpc('verify_election_chain', { p_election_id: electionId });
  if (error) throw error;
  return { ...data?.[0], verified_at: new Date().toISOString() };
}

export async function listVoteBlocks(electionId) {
  if (!isSupabaseConfigured) return demoVoteBlocks.filter((block) => block.election_id === electionId);
  const { data, error } = await supabase.from('vote_blocks').select('*').eq('election_id', electionId).order('block_index');
  if (error) throw error;
  return data;
}

export function auditReportText(electionId, result, blocks) {
  const election = demoElections.find((item) => item.id === electionId);
  return [
    `Election: ${election?.title ?? electionId}`,
    `Valid: ${result?.is_valid}`,
    `Total blocks: ${result?.total_blocks}`,
    `Verified blocks: ${result?.verified_blocks}`,
    `Error type: ${result?.error_type}`,
    `Generated: ${new Date().toISOString()}`,
    `Blocks: ${blocks.map((block) => block.block_index).join(', ')}`,
  ].join('\n');
}
