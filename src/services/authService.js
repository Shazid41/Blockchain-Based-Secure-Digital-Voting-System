import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as updateFirebasePassword,
} from 'firebase/auth';
import { firebaseAuth, firebaseAuthReady, isFirebaseConfigured } from './firebaseClient.js';
import { ensureFirebaseSeed, getFirebaseProfile, upsertFirebaseProfile } from './firebaseStore.js';
import { isDemoNidApproved } from './nidService.js';
import { clearTwoFactorVerified } from './twoFactorService.js';

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

function withTimeout(promise, milliseconds = 4000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timeout')), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function normalizeFirebaseUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    id: user.uid,
    email: user.email,
    email_confirmed_at: user.emailVerified ? new Date().toISOString() : null,
    app_metadata: { provider: 'firebase' },
    user_metadata: {},
  };
}

function firebaseSession(user) {
  const normalized = normalizeFirebaseUser(user);
  return {
    access_token: user?.accessToken ?? `firebase-${user?.uid}`,
    token_type: 'bearer',
    user: normalized,
  };
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

export function saveAuthState(session, profile) {
  writeJson(LOCAL_SESSION_KEY, { session, profile });
  window.dispatchEvent(new Event('secure-voting-auth-change'));
}

function getLocalAccounts() {
  return readJson(LOCAL_ACCOUNTS_KEY, []);
}

export function listLocalVoterProfiles() {
  return getLocalAccounts().map((account) => account.profile);
}

function saveLocalAccount(account) {
  const accounts = getLocalAccounts();
  const exists = accounts.some(
    (item) => item.email.toLowerCase() === account.email.toLowerCase() || item.profile.voter_number === account.profile.voter_number,
  );
  if (exists) throw new Error('This email or NID is already used.');
  writeJson(LOCAL_ACCOUNTS_KEY, [...accounts, account]);
}

export function updateLocalVoterStatus(id, approvalStatus) {
  const accounts = getLocalAccounts();
  let updatedProfile = null;
  const updatedAccounts = accounts.map((account) => {
    if (account.profile.id !== id) return account;
    updatedProfile = { ...account.profile, approval_status: approvalStatus };
    return { ...account, profile: updatedProfile };
  });

  if (!updatedProfile) return null;
  writeJson(LOCAL_ACCOUNTS_KEY, updatedAccounts);

  const localState = getLocalAuthState();
  if (localState.profile?.id === id) {
    saveLocalSession(updatedProfile);
  } else {
    window.dispatchEvent(new Event('secure-voting-auth-change'));
  }

  return updatedProfile;
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

function loginLocalAccount(email, password) {
  if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return saveLocalSession(adminProfile());
  }

  const localAccount = findLocalAccount(email);
  if (localAccount && localAccount.password === password) {
    return saveLocalSession(localAccount.profile);
  }

  return null;
}

export async function registerVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId }) {
  if (isFirebaseConfigured) {
    await firebaseAuthReady;
    const { user } = await withTimeout(createUserWithEmailAndPassword(firebaseAuth, email, password), 10000);
    let profile;
    try {
      profile = await upsertFirebaseProfile(user, { email, fullName, voterNumber, phone, dateOfBirth, regionId });
    } catch (error) {
      try {
        await deleteUser(user);
      } catch {
        // The auth account may already be out of scope; keep the original registration error.
      }
      throw error;
    }
    try {
      await sendEmailVerification(user, { url: appUrl('/verify-email') });
    } catch {
      // Firebase account/profile is already live; users can still login and admins can approve.
    }
    const session = firebaseSession(user);
    saveAuthState(session, profile);
    return { user: normalizeFirebaseUser(user), session, profile, firebase: true };
  }

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
    if (isNetworkError(error)) {
      return createLocalVoter({ email, password, fullName, voterNumber, phone, dateOfBirth, regionId });
    }
    throw error;
  }
}

export async function loginWithPassword(email, password) {
  if (isFirebaseConfigured) {
    await firebaseAuthReady;
    try {
      const { user } = await withTimeout(signInWithEmailAndPassword(firebaseAuth, email, password), 10000);
      const profile = (await getFirebaseProfile(user.uid)) ?? (await upsertFirebaseProfile(user, { email }));
      if (profile?.role === 'admin') await ensureFirebaseSeed();
      const session = firebaseSession(user);
      saveAuthState(session, profile);
      return { user: normalizeFirebaseUser(user), session, profile, firebase: true };
    } catch (error) {
      const code = String(error?.code ?? '');
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD && code.includes('user-not-found')) {
        const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const profile = await upsertFirebaseProfile(user, { email });
        await ensureFirebaseSeed();
        const session = firebaseSession(user);
        saveAuthState(session, profile);
        return { user: normalizeFirebaseUser(user), session, profile, firebase: true };
      }
      throw error;
    }
  }

  if (!isSupabaseConfigured) {
    const localSession = loginLocalAccount(email, password);
    if (localSession) return localSession;

    throw new Error('Invalid email or password.');
  }

  try {
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
    if (error) throw error;
    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      const localSession = loginLocalAccount(email, password);
      if (localSession) return localSession;
      throw new Error('Live backend is unavailable. Existing local accounts still work on this browser, or configure Firebase for permanent live login.');
    }
    throw error;
  }
}

export async function loginWithOtp(email) {
  if (isFirebaseConfigured) return sendPasswordReset(email);
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
  if (isFirebaseConfigured) {
    if (!firebaseAuth?.currentUser) {
      throw new Error('Login once, then request a fresh verification email from your account.');
    }
    if (firebaseAuth.currentUser.email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error('This browser is signed in with a different email.');
    }
    return sendEmailVerification(firebaseAuth.currentUser, { url: appUrl('/verify-email') });
  }

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
  const currentUserId = firebaseAuth?.currentUser?.uid ?? getLocalAuthState().session?.user?.id;
  clearTwoFactorVerified(currentUserId);
  localStorage.removeItem(LOCAL_SESSION_KEY);
  window.dispatchEvent(new Event('secure-voting-auth-change'));
  if (isFirebaseConfigured) {
    await firebaseSignOut(firebaseAuth);
    return;
  }
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error && !isNetworkError(error)) throw error;
}

export async function sendPasswordReset(email) {
  if (isFirebaseConfigured) {
    return sendPasswordResetEmail(firebaseAuth, email, { url: appUrl('/login') });
  }
  requireSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl('/reset-password'),
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  if (isFirebaseConfigured) {
    if (!firebaseAuth?.currentUser) throw new Error('Please login again before changing password.');
    return updateFirebasePassword(firebaseAuth.currentUser, password);
  }
  requireSupabase();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function getProfile(userId) {
  const localState = getLocalAuthState();
  if (localState.profile?.id === userId) return localState.profile;
  if (isFirebaseConfigured && userId) return getFirebaseProfile(userId);
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
