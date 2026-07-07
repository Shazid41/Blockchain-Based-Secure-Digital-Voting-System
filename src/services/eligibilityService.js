import { demoEligibility } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listEligibilityForVoter(voterId) {
  if (!isSupabaseConfigured) return demoEligibility.filter((item) => item.voter_id === 'demo-voter');
  const { data, error } = await supabase.from('voter_eligibility').select('*').eq('voter_id', voterId);
  if (error) throw error;
  return data;
}

export async function setEligibility(row) {
  if (!isSupabaseConfigured) return { ...row, id: row.id ?? crypto.randomUUID() };
  const { data, error } = await supabase.from('voter_eligibility').upsert(row).select().single();
  if (error) throw error;
  return data;
}
