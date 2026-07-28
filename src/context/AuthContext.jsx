import { createContext, useEffect, useMemo, useState } from 'react';
import { getLocalAuthState, getProfile, logout as logoutUser } from '../services/authService.js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const localState = getLocalAuthState();
      if (localState.session?.user) {
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
        const response = await supabase.auth.getSession();
        data = response.data;
      } catch {
        setLoading(false);
        return;
      }
      if (!active) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        setProfile(await getProfile(data.session.user.id));
      }
      setLoading(false);
    }

    loadSession();

    function loadLocalSession() {
      const localState = getLocalAuthState();
      setSession(localState.session);
      setProfile(localState.profile);
      setLoading(false);
    }

    window.addEventListener('secure-voting-auth-change', loadLocalSession);

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
        window.removeEventListener('secure-voting-auth-change', loadLocalSession);
      };
    }
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const localState = getLocalAuthState();
      if (localState.session?.user) {
        setSession(localState.session);
        setProfile(localState.profile);
        setLoading(false);
        return;
      }
      setSession(nextSession);
      setProfile(nextSession?.user?.id ? await getProfile(nextSession.user.id) : null);
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
      isConfigured: isSupabaseConfigured,
      logout: logoutUser,
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
