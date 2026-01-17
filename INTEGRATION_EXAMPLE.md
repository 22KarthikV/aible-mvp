# Quick Integration Guide

## Step 1: Update main.tsx

Replace your current `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

## Step 2: Update App.tsx (Option A - Use Demo Component)

If you want to see the auth system in action immediately:

```tsx
import AuthDemo from './components/AuthDemo'

function App() {
  return <AuthDemo />
}

export default App
```

## Step 3: Or Create Your Own Component (Option B)

Create your own authenticated component:

```tsx
import { useAuth } from './lib/auth'

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <div>
        <h1>Welcome to Aible</h1>
        <button onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

export default App
```

## Step 4: Configure Supabase (IMPORTANT!)

Before testing, you MUST configure Google OAuth in your Supabase dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Enable **Google** provider
5. Add Google OAuth credentials (Client ID & Secret from Google Cloud Console)
6. Add redirect URLs:
   - Development: `http://localhost:5173`
   - Your deployed URL when ready

## Step 5: Test the Integration

```bash
npm run dev
```

Then:
1. Click "Sign in with Google"
2. Authorize with Google
3. You should be redirected back and see your user info
4. Try signing out
5. Refresh the page - you should still be signed in (session persistence)

## Files Created

✅ `src/lib/auth.tsx` - Main authentication context provider
✅ `src/components/AuthDemo.tsx` - Demo component showing auth usage
✅ `src/types/auth.types.ts` - TypeScript types and helpers
✅ `AUTHENTICATION_SETUP.md` - Comprehensive documentation
✅ `INTEGRATION_EXAMPLE.md` - This quick start guide

## Common Issues

**"Missing Supabase environment variables"**
- Check your `.env.local` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**"useAuth must be used within an AuthProvider"**
- Make sure `<AuthProvider>` wraps your `<App />` in `main.tsx`

**Google OAuth not working**
- Verify Google provider is enabled in Supabase dashboard
- Check redirect URLs are configured correctly
- Ensure Google OAuth credentials are valid

## Next Steps

1. Enable Google OAuth in Supabase
2. Test the authentication flow
3. Create protected routes
4. Add user profiles to database
5. Customize the UI to match your design

For detailed documentation, see `AUTHENTICATION_SETUP.md`
