import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { isFirebaseNidAvailable, listFirebaseApprovedNids, saveFirebaseApprovedNid, updateFirebaseApprovedNid } from './firebaseStore.js';
import { demoApprovedNids, isDemoNidApproved } from './approvedNids.js';

export { demoApprovedNids, isDemoNidApproved };

export async function listApprovedNids() {
  if (isFirebaseConfigured) return listFirebaseApprovedNids();
  if (!isSupabaseConfigured) return demoApprovedNids;
  const { data, error } = await supabase
    .from('approved_nids')
    .select('nid, note, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createApprovedNid(row) {
  if (isFirebaseConfigured) return saveFirebaseApprovedNid(row);
  if (!isSupabaseConfigured) return { ...row, is_active: true, created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('approved_nids').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateApprovedNid(nid, updates) {
  if (isFirebaseConfigured) return updateFirebaseApprovedNid(nid, updates);
  if (!isSupabaseConfigured) return { nid, ...updates };
  const { data, error } = await supabase.from('approved_nids').update(updates).eq('nid', nid).select().single();
  if (error) throw error;
  return data;
}

export async function checkNidForSignup(nid) {
  if (isFirebaseConfigured) return isFirebaseNidAvailable(nid);
  if (!isSupabaseConfigured) {
    return isDemoNidApproved(nid);
  }
  const { data, error } = await supabase.rpc('is_nid_available_for_signup', { p_nid: nid });
  if (error) throw error;
  return Boolean(data);
}
