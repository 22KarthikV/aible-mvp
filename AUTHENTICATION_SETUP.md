# Authentication Setup Guide

This guide explains how to integrate and use the Supabase authentication system in your Aible application.

## Overview

The authentication system uses:
- **Supabase Auth** for backend authentication
- **Google OAuth** for sign-in (can be extended to other providers)
- **React Context API** for state management
- **PKCE flow** for secure OAuth authentication

## File Structure

```
src/
├── lib/
│   ├── supabase.ts    # Supabase client configuration
│   └── auth.tsx       # Authentication context provider ✨ NEW
└── main.tsx           # App entry point (needs update)
```

---

## Step 1: Wrap Your App with AuthProvider

Update `src/main.tsx` to wrap your application with the `AuthProvider`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth.tsx'  // ✨ Import AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>  {/* ✨ Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

---

## Step 2: Configure Supabase Dashboard

Before using Google OAuth, configure your Supabase project:

### A. Enable Google Auth Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and click to configure
5. Enable the provider
6. Add your Google OAuth credentials:
   - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **Client Secret**: Get from Google Cloud Console

### B. Add Redirect URLs

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your redirect URLs to **Site URL** and **Redirect URLs**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

### C. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret to Supabase

---

## Step 3: Use Authentication in Components

### Basic Example: Sign In Button

```tsx
import { useAuth } from './lib/auth';

function SignInButton() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
```

### Complete Example: Protected Component

```tsx
import { useAuth } from './lib/auth';

function Dashboard() {
  const { user, loading, signOut } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <SignInButton />
        </div>
      </div>
    );
  }

  // Show protected content
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <p>Welcome to your dashboard, {user.user_metadata?.full_name || user.email}!</p>
        {/* Your protected content here */}
      </div>
    </div>
  );
}
```

### Example: User Profile

```tsx
import { useAuth } from './lib/auth';

function UserProfile() {
  const { user, session } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Profile</h2>

      <div className="space-y-2">
        <div>
          <strong>Email:</strong> {user.email}
        </div>

        <div>
          <strong>Name:</strong> {user.user_metadata?.full_name || 'Not provided'}
        </div>

        <div>
          <strong>Avatar:</strong>
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full mt-2"
            />
          )}
        </div>

        <div>
          <strong>User ID:</strong> {user.id}
        </div>

        <div>
          <strong>Session expires:</strong>{' '}
          {session?.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString()
            : 'Unknown'}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4: Create a Complete Auth Page

Example of a full authentication page:

```tsx
// src/pages/AuthPage.tsx
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      alert(`Sign in failed: ${error.message}`);
    }
    // If successful, user will be redirected to Google
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Aible</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Google logo SVG path */}
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-700 font-medium">Continue with Google</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
```

---

## Available Data from useAuth()

The `useAuth()` hook provides:

### user
```typescript
User | null
```
- User object containing profile information
- `user.id` - Unique user ID
- `user.email` - User's email address
- `user.user_metadata` - Additional profile data (name, avatar, etc.)
- `null` if not authenticated

### session
```typescript
Session | null
```
- Session object containing tokens
- `session.access_token` - JWT access token
- `session.refresh_token` - Token for refreshing session
- `session.expires_at` - Unix timestamp when session expires
- `null` if not authenticated

### loading
```typescript
boolean
```
- `true` during initial auth check or auth operations
- `false` when auth state is determined

### signInWithGoogle()
```typescript
() => Promise<{ error: AuthError | null }>
```
- Initiates Google OAuth sign-in flow
- Redirects to Google for authentication
- Returns error object if sign-in fails

### signOut()
```typescript
() => Promise<{ error: AuthError | null }>
```
- Signs out the current user
- Clears session from storage
- Returns error object if sign-out fails

---

## Common Patterns

### 1. Protected Route

```tsx
import { useAuth } from './lib/auth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage in your router
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 2. Conditional Navigation

```tsx
function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex gap-4">
        <a href="/">Home</a>
        {user && <a href="/dashboard">Dashboard</a>}
      </div>

      <div>
        {user ? (
          <button onClick={signOut}>Sign Out</button>
        ) : (
          <a href="/login">Sign In</a>
        )}
      </div>
    </nav>
  );
}
```

### 3. Loading State Management

```tsx
function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

---

## Security Best Practices

### ✅ Implemented in auth.tsx

1. **PKCE Flow**: Supabase automatically uses PKCE (Proof Key for Code Exchange) for OAuth, which is more secure than implicit flow

2. **Session Persistence**: Sessions are stored in localStorage with automatic refresh

3. **Token Refresh**: Supabase automatically refreshes expired tokens

4. **Secure Redirects**: OAuth redirects are validated against allowed URLs in Supabase settings

### 🔒 Additional Recommendations

1. **Row Level Security (RLS)**: Enable RLS on your Supabase tables
```sql
-- Example: Only allow users to read their own data
CREATE POLICY "Users can view own data"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

2. **Environment Variables**: Never commit `.env.local` to version control
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **HTTPS Only**: Always use HTTPS in production

4. **Validate on Backend**: Always validate user permissions on the backend, not just in the UI

---

## Troubleshooting

### "useAuth must be used within an AuthProvider"

**Problem**: Using `useAuth()` outside of `<AuthProvider>`

**Solution**: Ensure your app is wrapped with `<AuthProvider>` in `main.tsx`

### Google OAuth Redirect Not Working

**Problem**: After Google authentication, redirect fails

**Solutions**:
1. Check redirect URL is added to Supabase Auth settings
2. Verify Google OAuth credentials in Supabase
3. Ensure authorized redirect URIs are correct in Google Cloud Console

### ⚠️ Vercel / Preview Deployment Redirects to Localhost

**Problem**: When signing in from a Vercel preview link (e.g., `https://project-git-dev.vercel.app`), you are redirected to `localhost`.

**Cause**: Supabase rejects the redirect URL because it's not in the **Redirect URLs** allowlist, so it falls back to the default **Site URL** (usually localhost).

**Solution**:
1. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2. Add your Vercel deployment URLs to **Redirect URLs**.
   - **Specific**: `https://aible-mvp-git-dev-karthik-vetrivels-projects.vercel.app/**`
   - **Wildcard** (Recommended for Vercel): `https://*-karthik-vetrivels-projects.vercel.app/**`
3. Click **Save**.
4. **Wait 1-2 minutes** for changes to propagate.

### Session Not Persisting

**Problem**: User is signed out after page refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify `persistSession: true` in `supabase.ts`
3. Check session expiry time hasn't passed

### Loading State Never Ends

**Problem**: `loading` stays `true` forever

**Solutions**:
1. Check Supabase environment variables are correct
2. Look for console errors from Supabase
3. Verify network requests in browser DevTools

---

## Testing

### Manual Testing Checklist

- [ ] Sign in with Google redirects to Google OAuth
- [ ] After Google auth, redirects back to app
- [ ] User data is displayed correctly
- [ ] Session persists after page refresh
- [ ] Sign out clears session
- [ ] Loading states display during auth operations
- [ ] Protected routes redirect unauthenticated users
- [ ] Tokens refresh automatically before expiry

---

## Next Steps

1. **Database Integration**: Create a `profiles` table to store user data
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Profile Completion**: After first sign-in, prompt user to complete profile

3. **Multi-Provider Auth**: Add more OAuth providers (GitHub, Twitter, etc.)

4. **Email Authentication**: Add email/password sign-in option

5. **Role-Based Access Control**: Implement user roles and permissions

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [React Context API](https://react.dev/reference/react/useContext)
- [Google OAuth Setup](https://console.cloud.google.com/)

---

**Need Help?** Check the console logs for detailed error messages from the auth context provider.
