import { demoVoters } from './demoData.js';
import { listLocalVoterProfiles, updateLocalVoterStatus } from './authService.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

function mergedDemoVoters() {
  const localVoters = listLocalVoterProfiles();
  const localIds = new Set(localVoters.map((voter) => voter.id));
  return [...localVoters, ...demoVoters.filter((voter) => !localIds.has(voter.id))];
}

function withTimeout(promise, milliseconds = 900) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Voter request timed out')), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export async function listVoters() {
  if (!isSupabaseConfigured) return mergedDemoVoters();
  try {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('*, regions(name)').eq('role', 'voter').order('created_at', { ascending: false }),
    );
    if (error) throw error;
    const localVoters = listLocalVoterProfiles();
    const remoteIds = new Set((data ?? []).map((voter) => voter.id));
    return [...localVoters.filter((voter) => !remoteIds.has(voter.id)), ...(data ?? [])];
  } catch {
    return mergedDemoVoters();
  }
}

export async function updateVoterStatus(id, approvalStatus) {
  const localUpdated = updateLocalVoterStatus(id, approvalStatus);
  if (localUpdated) return localUpdated;

  const demoVoter = demoVoters.find((voter) => voter.id === id);
  if (!isSupabaseConfigured || demoVoter) return { ...(demoVoter ?? { id }), approval_status: approvalStatus };

  try {
    const { data, error } = await withTimeout(supabase.from('profiles').update({ approval_status: approvalStatus }).eq('id', id).select().single());
    if (error) throw error;
    return data;
  } catch {
    return { id, approval_status: approvalStatus };
  }
}
