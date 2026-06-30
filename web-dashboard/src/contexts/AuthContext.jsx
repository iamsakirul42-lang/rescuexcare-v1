import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!hasSupabase) {
      // Mock user if Supabase is not configured
      const mockedUser = localStorage.getItem('mock_user') ? { id: '1', email: 'admin@rescuex.in' } : null;
      setUser(mockedUser);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [hasSupabase]);

  const value = {
    signUp: (data) => hasSupabase ? supabase.auth.signUp(data) : Promise.resolve({ data: { user: { id: '1' } }, error: null }),
    signIn: async (data) => {
      if (!hasSupabase) {
        localStorage.setItem('mock_user', 'true');
        setUser({ id: '1', email: data.email });
        return { data: { user: { id: '1', email: data.email } }, error: null };
      }
      return supabase.auth.signInWithPassword(data);
    },
    signOut: () => {
      if (!hasSupabase) {
        localStorage.removeItem('mock_user');
        setUser(null);
        return Promise.resolve();
      }
      return supabase.auth.signOut();
    },
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
