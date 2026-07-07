import { demoCandidates } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listCandidates(filters = {}) {
  if (!isSupabaseConfigured) {
    return demoCandidates.filter((candidate) => !filters.electionId || candidate.election_id === filters.electionId);
  }
  let query = supabase.from('candidates').select('*, elections(title), regions(name)');
  if (filters.electionId) query = query.eq('election_id', filters.electionId);
  const { data, error } = await query.order('full_name');
  if (error) throw error;
  return data;
}

export async function saveCandidate(candidate) {
  if (!isSupabaseConfigured) return { ...candidate, id: candidate.id ?? crypto.randomUUID() };
  const query = candidate.id
    ? supabase.from('candidates').update(candidate).eq('id', candidate.id)
    : supabase.from('candidates').insert(candidate);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
