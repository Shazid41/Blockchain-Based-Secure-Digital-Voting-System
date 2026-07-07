import { demoVoters } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listVoters() {
  if (!isSupabaseConfigured) return demoVoters;
  const { data, error } = await supabase.from('profiles').select('*, regions(name)').eq('role', 'voter').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateVoterStatus(id, approvalStatus) {
  if (!isSupabaseConfigured) return { id, approval_status: approvalStatus };
  const { data, error } = await supabase.from('profiles').update({ approval_status: approvalStatus }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
