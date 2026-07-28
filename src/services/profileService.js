import { demoProfile } from './demoData.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { getFirebaseProfile, updateFirebaseProfile } from './firebaseStore.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function getCurrentProfile(userId) {
  if (isFirebaseConfigured && userId) return getFirebaseProfile(userId);
  if (!isSupabaseConfigured || !userId) return demoProfile;
  const { data, error } = await supabase.from('profiles').select('*, regions(name, code)').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateCurrentProfile(userId, updates) {
  const safeUpdates = {
    full_name: updates.full_name,
    phone: updates.phone,
    date_of_birth: updates.date_of_birth,
    region_id: updates.region_id,
  };
  if (isFirebaseConfigured && userId) return updateFirebaseProfile(userId, safeUpdates);
  if (!isSupabaseConfigured || !userId) return { ...demoProfile, ...safeUpdates };
  const { data, error } = await supabase.from('profiles').update(safeUpdates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}
