import { supabase, isSupabaseConfigured } from './supabaseClient.js';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export async function registerVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId }) {
  requireSupabase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        voter_number: voterNumber,
        phone,
        date_of_birth: dateOfBirth,
        region_id: regionId,
        role: 'voter',
        approval_status: 'pending',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function loginWithPassword(email, password) {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

function appUrl(path) {
  return new URL(path.replace(/^\//, ''), `${window.location.origin}${import.meta.env.BASE_URL}`).toString();
}

export async function loginWithOtp(email) {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: appUrl('/voter'),
    },
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  requireSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl('/reset-password'),
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  requireSupabase();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}
