import { demoCandidates } from './demoData.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { listFirebaseCandidates, saveFirebaseCandidate } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listCandidates(filters = {}) {
  if (isFirebaseConfigured) return listFirebaseCandidates(filters);
  if (!isSupabaseConfigured) {
    return demoCandidates.filter((candidate) => !filters.electionId || candidate.election_id === filters.electionId);
  }
  let query = supabase.from('candidates').select('*, elections(title), regions(name)');
  if (filters.electionId) query = query.eq('election_id', filters.electionId);
  try {
    const { data, error } = await query.order('full_name');
    if (error) throw error;
    return data;
  } catch {
    return demoCandidates.filter((candidate) => !filters.electionId || candidate.election_id === filters.electionId);
  }
}

export async function saveCandidate(candidate) {
  if (isFirebaseConfigured) return saveFirebaseCandidate(candidate);
  if (!isSupabaseConfigured) return { ...candidate, id: candidate.id ?? crypto.randomUUID() };
  const { id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = candidate;
  delete payload.elections;
  delete payload.regions;
  const query = id
    ? supabase.from('candidates').update(payload).eq('id', id)
    : supabase.from('candidates').insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
