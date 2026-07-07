import { demoElections } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listElections() {
  if (!isSupabaseConfigured) return demoElections;
  const { data, error } = await supabase.from('elections').select('*, regions(name, code)').order('start_time');
  if (error) throw error;
  return data;
}

export async function getElection(id) {
  const elections = await listElections();
  return elections.find((election) => election.id === id) ?? null;
}

export async function saveElection(election) {
  if (!isSupabaseConfigured) return { ...election, id: election.id ?? crypto.randomUUID() };
  const query = election.id
    ? supabase.from('elections').update(election).eq('id', election.id)
    : supabase.from('elections').insert(election);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
