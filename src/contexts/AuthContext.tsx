import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  display_name: string;
  created_at: string;
  sentence_practice_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: Error | null }>;
  updateSentencePracticeConfig: (enabled: boolean) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys for offline profile caching
const PROFILE_CACHE_KEY = 'gre-vocab-profile-cache';

function getCachedProfile(): UserProfile | null {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: UserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (userId: string, email: string) => {
    // If offline, use cached profile
    if (!navigator.onLine) {
      const cached = getCachedProfile();
      if (cached && cached.id === userId) {
        setProfile(cached);
        return;
      }
      // Create a minimal offline profile from email
      const offlineProfile: UserProfile = {
        id: userId,
        display_name: email.split('@')[0],
        created_at: new Date().toISOString(),
        sentence_practice_enabled: false,
      };
      setProfile(offlineProfile);
      return;
    }

    try {
      // Try to fetch existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        setProfile(existingProfile as UserProfile);
        setCachedProfile(existingProfile as UserProfile);
        return;
      }

      // Create new profile with email prefix as default display name
      const displayName = email.split('@')[0];
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({ id: userId, display_name: displayName })
        .select()
        .single();

      if (!error && newProfile) {
        setProfile(newProfile as UserProfile);
        setCachedProfile(newProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile, using cache:', error);
      // On error, try cached profile
      const cached = getCachedProfile();
      if (cached && cached.id === userId) {
        setProfile(cached);
      } else {
        // Fallback to email-based profile
        const fallbackProfile: UserProfile = {
          id: userId,
          display_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          sentence_practice_enabled: false,
        };
        setProfile(fallbackProfile);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Supabase stores session in localStorage, so this should work offline
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchOrCreateProfile(session.user.id, session.user.email || '');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Even on error, we should finish loading
        // The user can still use cached data if they were logged in before
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out, proceeding...');
        setLoading(false);
      }
    }, 5000);

    initializeAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('Auth state changed:', event, session?.user?.id);

        // Update state
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchOrCreateProfile(session.user.id, session.user.email || '');
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCachedProfile(null);
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: name } : null);
    }

    return { error };
  };

  const updateSentencePracticeConfig = async (enabled: boolean) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ sentence_practice_enabled: enabled })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, sentence_practice_enabled: enabled } : null);
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateDisplayName,
      updateSentencePracticeConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
