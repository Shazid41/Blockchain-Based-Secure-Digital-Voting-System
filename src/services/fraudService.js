import { demoFraudLogs } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listFraudLogs() {
  if (!isSupabaseConfigured) return demoFraudLogs;
  const { data, error } = await supabase.from('fraud_logs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markFraudResolved(id) {
  if (!isSupabaseConfigured) return { id, resolved: true };
  const { data, error } = await supabase.from('fraud_logs').update({ resolved: true }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
