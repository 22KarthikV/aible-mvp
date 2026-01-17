/**
 * Authentication Context Provider for Aible
 *
 * This module provides a React Context for managing authentication state
 * using Supabase Auth with Google OAuth. It handles user sessions,
 * authentication state changes, and provides helper functions for
 * signing in and out.
 *
 * Usage:
 * 1. Wrap your app with <AuthProvider> in main.tsx
 * 2. Use the useAuth() hook in any component to access auth state
 *
 * Example:
 * const { user, loading, signInWithGoogle, signOut } = useAuth();
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Derive Session type from Supabase client
type Session = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Shape of the authentication context
 * This defines all the data and functions available through useAuth()
 */
interface AuthContextType {
  // Current authenticated user (null if not signed in)
  user: User | null;

  // Current session containing access tokens and metadata
  session: Session | null;

  // Loading state - true during initial auth check or auth operations
  loading: boolean;

  // Sign in with Google OAuth
  // Returns an error if sign-in fails, otherwise redirects to Google
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;

  // Sign out the current user
  // Clears session and redirects to sign-in page
  signOut: () => Promise<{ error: AuthError | null }>;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Create the authentication context
 * Initial value is undefined - will be set by AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 *
 * Wraps the application and provides authentication state to all child components.
 * Automatically handles:
 * - Initial session check on mount
 * - Auth state change listeners (login/logout events)
 * - Session persistence across page refreshes
 * - Token refresh when needed
 *
 * @param children - React components to wrap with auth context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ============================================================================
  // LIFECYCLE: INITIALIZE AUTH STATE
  // ============================================================================

  useEffect(() => {
    /**
     * Initialize authentication state
     *
     * This function runs once when the component mounts to:
     * 1. Check if there's an existing session (from localStorage)
     * 2. Set up a listener for auth state changes
     * 3. Handle OAuth redirects from Google
     */
    const initializeAuth = async () => {
      try {
        // Check for existing session
        // Supabase automatically retrieves session from localStorage
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        // Always set loading to false after initial check
        setLoading(false);
      }
    };

    // Run initialization
    initializeAuth();

    // ============================================================================
    // AUTH STATE CHANGE LISTENER
    // ============================================================================

    /**
     * Set up listener for authentication state changes
     *
     * This listener fires whenever:
     * - User signs in
     * - User signs out
     * - Session is refreshed
     * - OAuth redirect completes
     *
     * Supabase uses PKCE (Proof Key for Code Exchange) flow for OAuth,
     * which is a secure authentication flow that doesn't expose tokens in URLs
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);

      // Update session and user state
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Set loading to false after any auth state change
      // This ensures the UI updates after sign-in/sign-out
      setLoading(false);

      // Optional: Handle specific auth events
      switch (event) {
        case "SIGNED_IN":
          console.log("User signed in:", currentSession?.user?.email);
          break;
        case "SIGNED_OUT":
          console.log("User signed out");
          break;
        case "TOKEN_REFRESHED":
          console.log("Session token refreshed");
          break;
        case "USER_UPDATED":
          console.log("User data updated");
          break;
        default:
          break;
      }
    });

    // ============================================================================
    // CLEANUP
    // ============================================================================

    /**
     * Cleanup function - runs when component unmounts
     * Unsubscribes from auth state changes to prevent memory leaks
     */
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // ============================================================================
  // AUTH FUNCTIONS
  // ============================================================================

  /**
   * Sign in with Google OAuth
   *
   * Flow:
   * 1. User clicks "Sign in with Google" button
   * 2. This function redirects to Google OAuth page
   * 3. User authorizes the app on Google
   * 4. Google redirects back to your app with an auth code
   * 5. Supabase exchanges the code for session tokens (PKCE flow)
   * 6. onAuthStateChange listener detects the new session
   * 7. Context updates user and session state
   * 8. App re-renders showing authenticated content
   *
   * @returns Object with error property (null if successful)
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Redirect URL - where Google sends the user after authentication
          // Make sure this URL is added to your Supabase Auth settings
          redirectTo: `${window.location.origin}/`,

          // Optional: Request specific scopes from Google
          // scopes: "email profile",

          // Query parameters to pass to the redirect URL
          queryParams: {
            access_type: "offline", // Request refresh token
            prompt: "consent", // Always show consent screen
          },
        },
      });

      if (error) {
        console.error("Sign in error:", error.message);
        setLoading(false);
        return { error };
      }

      // If successful, Supabase will redirect to Google
      // Don't set loading to false here - the page will redirect
      return { error: null };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      setLoading(false);
      return {
        error: error as AuthError,
      };
    }
  };

  /**
   * Sign out the current user
   *
   * Clears the session from:
   * - React state
   * - localStorage
   * - Supabase Auth
   *
   * The onAuthStateChange listener will automatically update the UI
   *
   * @returns Object with error property (null if successful)
   */
  const signOut = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
        setLoading(false);
        return { error };
      }

      // Session is cleared automatically
      // onAuthStateChange will set user/session to null
      return { error: null };
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      setLoading(false);
      return {
        error: error as AuthError,
      };
    }
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  /**
   * The value provided to all consuming components
   * Memoization not needed as object reference changes trigger re-renders anyway
   */
  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  // ============================================================================
  // RENDER PROVIDER
  // ============================================================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context in any component.
 * Must be used within a component wrapped by <AuthProvider>.
 *
 * @returns AuthContextType with user, session, loading, and auth functions
 * @throws Error if used outside of AuthProvider
 *
 * Example:
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signInWithGoogle, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   if (!user) {
 *     return <button onClick={signInWithGoogle}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  // Ensure hook is used within AuthProvider
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Make sure to wrap your app with <AuthProvider> in main.tsx"
    );
  }

  return context;
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

/**
 * Export types for use in other files
 */
export type { AuthContextType, User, Session };
