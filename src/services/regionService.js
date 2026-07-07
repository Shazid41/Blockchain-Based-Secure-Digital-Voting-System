import { demoRegions } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listRegions() {
  if (!isSupabaseConfigured) return demoRegions;
  const { data, error } = await supabase.from('regions').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createRegion(region) {
  if (!isSupabaseConfigured) return { ...region, id: crypto.randomUUID() };
  const { data, error } = await supabase.from('regions').insert(region).select().single();
  if (error) throw error;
  return data;
}

export async function updateRegion(id, region) {
  if (!isSupabaseConfigured) return { ...region, id };
  const { data, error } = await supabase.from('regions').update(region).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRegion(id) {
  if (!isSupabaseConfigured) return id;
  const { error } = await supabase.from('regions').delete().eq('id', id);
  if (error) throw error;
  return id;
}
