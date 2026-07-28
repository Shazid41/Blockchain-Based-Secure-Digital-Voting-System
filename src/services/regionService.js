import { demoRegions } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

function fallbackRegions() {
  return demoRegions.map((region) => ({ ...region, isFallback: true }));
}

function withTimeout(promise, milliseconds = 900) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Region request timed out')), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export async function listRegions() {
  if (!isSupabaseConfigured) return fallbackRegions();
  try {
    const { data, error } = await withTimeout(supabase.from('regions').select('*').order('name'));
    if (error) throw error;
    return data?.length ? data : fallbackRegions();
  } catch (error) {
    console.warn('Could not load regions from Supabase. Using fallback registration regions.', error);
    return fallbackRegions();
  }
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
