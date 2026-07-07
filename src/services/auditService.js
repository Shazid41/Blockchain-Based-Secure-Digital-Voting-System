import { demoAuditLogs } from './demoData.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export async function listAuditLogs() {
  if (!isSupabaseConfigured) {
    return demoAuditLogs;
  }
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
