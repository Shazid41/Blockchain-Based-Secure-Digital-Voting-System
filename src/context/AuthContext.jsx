import { createContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getLocalAuthState, getProfile, logout as logoutUser } from '../services/authService.js';
import { firebaseAuth, isFirebaseConfigured } from '../services/firebaseClient.js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient.js';

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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

    if (isFirebaseConfigured) {
      const timer = setTimeout(() => {
        if (!active) return;
        setSession(null);
        setProfile(null);
        setLoading(false);
      }, 7000);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (!active) return;
        clearTimeout(timer);
        const nextSession = firebaseSession(user);
        setSession(nextSession);
        try {
          setProfile(user?.uid ? await withTimeout(getProfile(user.uid), 7000) : null);
        } catch {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        active = false;
        clearTimeout(timer);
        window.removeEventListener('secure-voting-auth-change', loadLocalSession);
        unsubscribe();
      };
    }

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
        window.removeEventListener('secure-voting-auth-change', loadLocalSession);
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
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isAuthenticated: Boolean(session?.user),
      isConfigured: isFirebaseConfigured || isSupabaseConfigured,
      logout: logoutUser,
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
