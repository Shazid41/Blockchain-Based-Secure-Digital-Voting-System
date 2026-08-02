import { createContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { getLocalAuthState, getProfile, logout as logoutUser, saveAuthState } from '../services/authService.js';
import { firebaseAuth, firebaseAuthReady, firebaseDb, isFirebaseConfigured } from '../services/firebaseClient.js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient.js';
import { isTwoFactorSessionVerified } from '../services/twoFactorService.js';

export const AuthContext = createContext(null);

function withTimeout(promise, milliseconds = 4500) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Session request timeout')), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function firebaseSession(user) {
  if (!user) return null;
  return {
    access_token: user.accessToken ?? `firebase-${user.uid}`,
    token_type: 'bearer',
    user: {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      email_confirmed_at: user.emailVerified ? new Date().toISOString() : null,
      app_metadata: { provider: 'firebase' },
      user_metadata: {},
    },
  };
}

function firebaseProfileSnapshot(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    created_at: data.created_at?.toDate?.().toISOString?.() ?? data.created_at,
    updated_at: data.updated_at?.toDate?.().toISOString?.() ?? data.updated_at,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setTwoFactorTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (isFirebaseConfigured) return;

      const localState = getLocalAuthState();
      if (!isSupabaseConfigured && localState.session?.user) {
        setSession(localState.session);
        setProfile(localState.profile);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      let data = { session: null };
      try {
        const response = await withTimeout(supabase.auth.getSession());
        data = response.data;
      } catch {
        if (!active) return;
        setSession(localState.session);
        setProfile(localState.profile);
        setLoading(false);
        return;
      }
      if (!active) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        try {
          setProfile(await withTimeout(getProfile(data.session.user.id)));
        } catch {
          setProfile(null);
        }
      }
      setLoading(false);
    }

    loadSession();

    function loadLocalSession() {
      if (isSupabaseConfigured) return;
      const localState = getLocalAuthState();
      setSession(localState.session);
      setProfile(localState.profile);
      setLoading(false);
    }

    window.addEventListener('secure-voting-auth-change', loadLocalSession);
    const updateTwoFactor = () => setTwoFactorTick((value) => value + 1);
    window.addEventListener('secure-voting-2fa-change', updateTwoFactor);

    if (isFirebaseConfigured) {
      const cachedState = getLocalAuthState();
      if (cachedState.session?.user) {
        setSession(cachedState.session);
        setProfile(cachedState.profile);
        setLoading(false);
      }

      const timer = setTimeout(() => {
        if (!active) return;
        const latestCachedState = getLocalAuthState();
        setSession(latestCachedState.session ?? null);
        setProfile(latestCachedState.profile ?? null);
        setLoading(false);
      }, 7000);

      let unsubscribe = () => {};
      let unsubscribeProfile = () => {};
      firebaseAuthReady.finally(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
          if (!active) return;
          clearTimeout(timer);
          unsubscribeProfile();
          const nextSession = firebaseSession(user);
          const latestCachedState = getLocalAuthState();
          setSession(nextSession ?? latestCachedState.session ?? null);
          try {
            const nextProfile = user?.uid ? await withTimeout(getProfile(user.uid), 7000) : null;
            setProfile(nextProfile ?? latestCachedState.profile ?? null);
            if (nextSession && nextProfile) saveAuthState(nextSession, nextProfile);
            if (user?.uid && firebaseDb) {
              unsubscribeProfile = onSnapshot(doc(firebaseDb, 'profiles', user.uid), (snapshot) => {
                if (!active) return;
                const liveProfile = firebaseProfileSnapshot(snapshot);
                setProfile(liveProfile ?? latestCachedState.profile ?? null);
                if (nextSession && liveProfile) saveAuthState(nextSession, liveProfile);
              }, () => {});
            }
          } catch {
            setProfile(latestCachedState.profile ?? null);
          }
          setLoading(false);
        });
      });

      return () => {
        active = false;
        clearTimeout(timer);
        window.removeEventListener('secure-voting-auth-change', loadLocalSession);
        window.removeEventListener('secure-voting-2fa-change', updateTwoFactor);
        unsubscribe();
        unsubscribeProfile();
      };
    }

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
        window.removeEventListener('secure-voting-auth-change', loadLocalSession);
        window.removeEventListener('secure-voting-2fa-change', updateTwoFactor);
      };
    }
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const localState = getLocalAuthState();
      if (!isSupabaseConfigured && localState.session?.user) {
        setSession(localState.session);
        setProfile(localState.profile);
        setLoading(false);
        return;
      }
      setSession(nextSession);
      try {
        setProfile(nextSession?.user?.id ? await withTimeout(getProfile(nextSession.user.id)) : null);
      } catch {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      window.removeEventListener('secure-voting-auth-change', loadLocalSession);
      window.removeEventListener('secure-voting-2fa-change', updateTwoFactor);
      listener.subscription.unsubscribe();
    };
  }, []);

  const twoFactorVerified = !profile?.two_factor_enabled || isTwoFactorSessionVerified(session?.user?.id);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isAuthenticated: Boolean(session?.user),
      isConfigured: isFirebaseConfigured || isSupabaseConfigured,
      twoFactorVerified,
      logout: logoutUser,
    }),
    [loading, profile, session, twoFactorVerified],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
