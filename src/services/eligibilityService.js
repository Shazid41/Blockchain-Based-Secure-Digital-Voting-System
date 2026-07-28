import { demoEligibility } from './demoData.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { listFirebaseEligibilityForVoter, setFirebaseEligibility } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listEligibilityForVoter(voterId) {
  if (isFirebaseConfigured) return listFirebaseEligibilityForVoter(voterId);
  if (!isSupabaseConfigured) return demoEligibility.filter((item) => item.voter_id === 'demo-voter');
  const { data, error } = await supabase.from('voter_eligibility').select('*').eq('voter_id', voterId);
  if (error) throw error;
  return data;
}

export async function setEligibility(row) {
  if (isFirebaseConfigured) return setFirebaseEligibility(row);
  if (!isSupabaseConfigured) return { ...row, id: row.id ?? crypto.randomUUID() };
  const { data, error } = await supabase.from('voter_eligibility').upsert(row).select().single();
  if (error) throw error;
  return data;
}
