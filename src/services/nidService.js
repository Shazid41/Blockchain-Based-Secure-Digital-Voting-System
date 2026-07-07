import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export const demoApprovedNids = [
  { nid: '2394859539', note: 'Demo voter 01', is_active: true },
  { nid: '4212911590', note: 'Demo voter 02', is_active: true },
  { nid: '1029384756', note: 'Demo voter 03', is_active: true },
  { nid: '5647382910', note: 'Demo voter 04', is_active: true },
  { nid: '9182736450', note: 'Demo voter 05', is_active: true },
  { nid: '1234567890', note: 'Demo voter 06', is_active: true },
  { nid: '9876543210', note: 'Demo voter 07', is_active: true },
  { nid: '1122334455', note: 'Demo voter 08', is_active: true },
  { nid: '5566778899', note: 'Demo voter 09', is_active: true },
  { nid: '1234567890123456', note: 'Demo voter 10', is_active: true },
];

export async function listApprovedNids() {
  if (!isSupabaseConfigured) return demoApprovedNids;
  const { data, error } = await supabase
    .from('approved_nids')
    .select('nid, note, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createApprovedNid(row) {
  if (!isSupabaseConfigured) return { ...row, is_active: true, created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('approved_nids').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateApprovedNid(nid, updates) {
  if (!isSupabaseConfigured) return { nid, ...updates };
  const { data, error } = await supabase.from('approved_nids').update(updates).eq('nid', nid).select().single();
  if (error) throw error;
  return data;
}

export async function checkNidForSignup(nid) {
  if (!isSupabaseConfigured) {
    return demoApprovedNids.some((row) => row.nid === nid && row.is_active);
  }
  const { data, error } = await supabase.rpc('is_nid_available_for_signup', { p_nid: nid });
  if (error) throw error;
  return Boolean(data);
}
