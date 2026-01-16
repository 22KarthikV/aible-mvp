/**
 * Auth Store
 * 
 * Manages user authentication state using Zustand for performance and ease of use.
 * Replaces or supplements the Auth Context as per project architecture.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
      signOut: () => set({ user: null, loading: false }),
    }),
    {
      name: 'aible-auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist the user object
    }
  )
);
