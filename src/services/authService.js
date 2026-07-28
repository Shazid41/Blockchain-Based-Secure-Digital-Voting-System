import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { isDemoNidApproved } from './nidService.js';

const productionSiteUrl = 'https://shazid41.github.io/Blockchain-Based-Secure-Digital-Voting-System/';
const ADMIN_EMAIL = 'shazidsaharia21@gmail.com';
const ADMIN_PASSWORD = 'Shazid@961';
const LOCAL_ACCOUNTS_KEY = 'secureVotingLocalAccounts';
const LOCAL_SESSION_KEY = 'secureVotingLocalSession';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

function publicSiteUrl() {
  return import.meta.env.VITE_PUBLIC_SITE_URL || productionSiteUrl;
}

function appUrl(path) {
  return new URL(path.replace(/^\//, ''), publicSiteUrl()).toString();
}

function isNetworkError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('failed to fetch') || message.includes('network') || message.includes('timeout') || message.includes('fetch failed');
}

function withTimeout(promise, milliseconds = 6000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timeout')), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function localUserFromProfile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: 'local-demo' },
    user_metadata: {
      full_name: profile.full_name,
      voter_number: profile.voter_number,
      role: profile.role,
      approval_status: profile.approval_status,
    },
  };
}

function saveLocalSession(profile) {
  const user = localUserFromProfile(profile);
  const session = {
    access_token: `local-${profile.id}`,
    token_type: 'bearer',
    user,
  };
  writeJson(LOCAL_SESSION_KEY, { session, profile });
  window.dispatchEvent(new Event('secure-voting-auth-change'));
  return { session, user, profile, local: true };
}

function adminProfile() {
  return {
    id: 'local-admin',
    full_name: 'Md. Shazidur Rahaman',
    email: ADMIN_EMAIL,
    voter_number: '0000000000000000',
    phone: '',
    date_of_birth: '',
    region_id: null,
    role: 'admin',
    approval_status: 'approved',
    created_at: new Date().toISOString(),
  };
}

export function getLocalAuthState() {
  return readJson(LOCAL_SESSION_KEY, { session: null, profile: null });
}

function getLocalAccounts() {
  return readJson(LOCAL_ACCOUNTS_KEY, []);
}

function saveLocalAccount(account) {
  const accounts = getLocalAccounts();
  const exists = accounts.some(
    (item) => item.email.toLowerCase() === account.email.toLowerCase() || item.profile.voter_number === account.profile.voter_number,
  );
  if (exists) throw new Error('This email or NID is already used.');
  writeJson(LOCAL_ACCOUNTS_KEY, [...accounts, account]);
}

function findLocalAccount(email) {
  return getLocalAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase());
}

function createLocalVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId }) {
  if (!isDemoNidApproved(voterNumber)) {
    throw new Error('This NID is not approved for registration. Please use one of the demo NID numbers or ask admin to add it.');
  }
  const profile = {
    id: `local-voter-${crypto.randomUUID()}`,
    full_name: fullName,
    email,
    voter_number: voterNumber,
    phone,
    date_of_birth: dateOfBirth,
    region_id: regionId || null,
    role: 'voter',
    approval_status: 'pending',
    created_at: new Date().toISOString(),
  };
  saveLocalAccount({ email, password, verified: true, profile });
  return saveLocalSession(profile);
}

export async function registerVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId }) {
  if (!isSupabaseConfigured) return createLocalVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId });

  try {
    const { data, error } = await withTimeout(supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: appUrl('/verify-email'),
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
    }));

    if (error) throw error;
    return data;
  } catch (error) {
    if (isNetworkError(error)) return createLocalVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId });
    throw error;
  }
}

export async function loginWithPassword(email, password) {
  if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return saveLocalSession(adminProfile());
  }

  const localAccount = findLocalAccount(email);
  if (localAccount && localAccount.password === password) {
    return saveLocalSession(localAccount.profile);
  }

  if (!isSupabaseConfigured) throw new Error('Invalid email or password.');

  try {
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
    if (error) throw error;
    return data;
  } catch (error) {
    if (isNetworkError(error)) throw new Error('Connection problem. Please use the local demo account created from registration or try again.');
    throw error;
  }
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

export async function resendSignupVerification(email) {
  const localAccount = findLocalAccount(email);
  if (localAccount) return saveLocalSession(localAccount.profile);

  requireSupabase();
  try {
    const { data, error } = await withTimeout(supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: appUrl('/verify-email'),
      },
    }));
    if (error) throw error;
    return data;
  } catch (error) {
    if (isNetworkError(error)) throw new Error('Email service is temporarily unavailable. Registration is saved locally for demo access.');
    throw error;
  }
}

export async function logout() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  window.dispatchEvent(new Event('secure-voting-auth-change'));
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error && !isNetworkError(error)) throw error;
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
  const localState = getLocalAuthState();
  if (localState.profile?.id === userId) return localState.profile;
  if (!isSupabaseConfigured || !userId) return null;
  try {
    const { data, error } = await withTimeout(supabase.from('profiles').select('*').eq('id', userId).maybeSingle());
    if (error) throw error;
    return data;
  } catch (error) {
    if (isNetworkError(error)) return localState.profile ?? null;
    throw error;
  }
}
