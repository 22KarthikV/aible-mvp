/**
 * Authentication Type Definitions
 *
 * Extended type definitions for Supabase Auth to provide better
 * TypeScript support and autocomplete for authentication-related code.
 *
 * These types supplement the built-in Supabase types with common
 * patterns and user metadata structures.
 */

import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

// ============================================================================
// USER METADATA TYPES
// ============================================================================

/**
 * Structure of user metadata returned from Google OAuth
 * This data is stored in user.user_metadata
 */
export interface GoogleUserMetadata {
  // Full name from Google profile
  full_name?: string;

  // Google profile picture URL
  avatar_url?: string;

  // Email from Google (same as user.email)
  email?: string;

  // Whether email is verified by Google
  email_verified?: boolean;

  // Google profile picture URL (alternative field)
  picture?: string;

  // Provider sub (Google user ID)
  provider_id?: string;

  // Any additional custom metadata you add
  [key: string]: unknown;
}

/**
 * Extended User type with typed metadata
 * Use this instead of the base Supabase User type for better autocomplete
 */
export interface AuthUser extends Omit<SupabaseUser, "user_metadata"> {
  user_metadata: GoogleUserMetadata;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Extended Session type
 * Re-export with custom User type
 */
export interface AuthSession extends Omit<SupabaseSession, "user"> {
  user: AuthUser;
}

// ============================================================================
// AUTH STATE TYPES
// ============================================================================

/**
 * Possible authentication states
 */
export type AuthState =
  | "loading"           // Initial load or during auth operation
  | "authenticated"     // User is signed in
  | "unauthenticated"   // User is not signed in
  | "error";            // Authentication error occurred

/**
 * Auth error with context
 */
export interface AuthErrorDetails {
  message: string;
  code?: string;
  status?: number;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

/**
 * User Profile (for database storage)
 * Create a 'profiles' table with this structure to store user data
 *
 * SQL to create the table:
 * ```sql
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users(id) PRIMARY KEY,
 *   email TEXT,
 *   full_name TEXT,
 *   avatar_url TEXT,
 *   bio TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Enable Row Level Security
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow users to read their own profile
 * CREATE POLICY "Users can view own profile"
 *   ON profiles FOR SELECT
 *   USING (auth.uid() = id);
 *
 * -- Allow users to update their own profile
 * CREATE POLICY "Users can update own profile"
 *   ON profiles FOR UPDATE
 *   USING (auth.uid() = id);
 * ```
 */
export interface UserProfile {
  id: string;                          // UUID matching auth.users.id
  email: string;                       // User's email
  full_name: string | null;            // Display name
  avatar_url: string | null;           // Profile picture URL
  bio: string | null;                  // User bio/description
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
}

// ============================================================================
// AUTH PROVIDER TYPES
// ============================================================================

/**
 * Supported OAuth providers
 * Add more as you enable them in Supabase
 */
export type AuthProvider =
  | "google"
  | "github"
  | "gitlab"
  | "bitbucket"
  | "azure"
  | "facebook"
  | "twitter"
  | "discord"
  | "twitch"
  | "spotify";

// ============================================================================
// AUTH HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useAuth hook
 * This is already defined in auth.tsx but exported here for convenience
 */
export interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Check if user has completed their profile
 * Useful for onboarding flows
 */
export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
}

/**
 * User role types (if implementing RBAC)
 * Add these to app_metadata or a separate roles table
 */
export type UserRole = "user" | "admin" | "moderator" | "premium";

/**
 * Extended user with role
 */
export interface UserWithRole extends AuthUser {
  role: UserRole;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if user is authenticated
 * Usage: if (isAuthenticated(user)) { ... }
 */
export function isAuthenticated(
  user: AuthUser | null
): user is AuthUser {
  return user !== null;
}

/**
 * Type guard to check if user has a specific role
 * Usage: if (hasRole(user, "admin")) { ... }
 */
export function hasRole(
  user: AuthUser | null,
  role: UserRole
): boolean {
  if (!user) return false;
  return (user.app_metadata?.role as UserRole) === role;
}

/**
 * Type guard to check if session is valid (not expired)
 * Usage: if (isSessionValid(session)) { ... }
 */
export function isSessionValid(
  session: AuthSession | null
): session is AuthSession {
  if (!session || !session.expires_at) return false;

  const expiresAt = session.expires_at * 1000; // Convert to milliseconds
  const now = Date.now();

  return expiresAt > now;
}

/**
 * Check if profile is complete
 * Customize based on your required fields
 */
export function checkProfileCompletion(
  profile: Partial<UserProfile>
): ProfileCompletionStatus {
  const requiredFields = ["full_name", "email"];
  const missingFields = requiredFields.filter(
    (field) => !profile[field as keyof UserProfile]
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract user display name from various sources
 */
export function getUserDisplayName(user: AuthUser): string {
  return (
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Anonymous User"
  );
}

/**
 * Get user avatar with fallback
 */
export function getUserAvatar(user: AuthUser): string {
  return (
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getUserDisplayName(user)
    )}&background=random`
  );
}

/**
 * Format session expiry time
 */
export function formatSessionExpiry(session: AuthSession | null): string {
  if (!session || !session.expires_at) return "Unknown";

  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();

  if (diffMs < 0) return "Expired";

  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  return `${diffMins} minute${diffMins > 1 ? "s" : ""}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Re-export Supabase types for convenience
 */
export type { SupabaseUser, SupabaseSession };
