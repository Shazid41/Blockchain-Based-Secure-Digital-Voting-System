import { createContext, useEffect, useMemo, useState } from 'react';
import { getProfile, logout as logoutUser } from '../services/authService.js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        setProfile(await getProfile(data.session.user.id));
      }
      setLoading(false);
    }

    loadSession();

    if (!isSupabaseConfigured) return () => {};
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setProfile(nextSession?.user?.id ? await getProfile(nextSession.user.id) : null);
      setLoading(false);
    });

    return () => {
      active = false;
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
