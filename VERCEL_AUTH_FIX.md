# Vercel OAuth Redirect Fix

## Problem
After Google OAuth login, users are redirected to `localhost:3000` instead of the Vercel deployment URL, causing `ERR_CONNECTION_REFUSED`.

## Root Cause
Supabase dashboard is not configured with your Vercel deployment URL in the allowed redirect URLs list.

---

## Solution: Update Supabase Settings

### Step 1: Get Your Vercel Deployment URL

Your Vercel URL will be something like:
- **Production**: `https://aible-mvp.vercel.app` (or custom domain)
- **Preview**: `https://aible-mvp-<hash>.vercel.app`

### Step 2: Configure Supabase Redirect URLs

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your **"aible-mvp"** project
3. Navigate to **Authentication** → **URL Configuration** (in left sidebar)
4. Find the **Redirect URLs** section
5. Add BOTH URLs (one per line):
   ```
   http://localhost:3000
   http://localhost:5173
   http://localhost:5174
   http://localhost:5175
   http://localhost:5176
   http://localhost:5177
   http://localhost:5178
   http://localhost:5179
   https://your-vercel-url.vercel.app
   https://aible-mvp.vercel.app
   ```
6. Also update **Site URL** to your production URL:
   ```
   https://your-vercel-url.vercel.app
   ```
7. Click **Save**

### Step 3: Add Wildcard for Vercel Previews (Optional)

If you want preview deployments to work, add:
```
https://aible-mvp-*.vercel.app
```

---

## Alternative: Environment-Based Redirect URL

To make this more robust, we can use environment variables:

### Option A: Use Vercel's Built-in Variables

Vercel automatically provides:
- `VERCEL_URL`: The deployment URL
- `VERCEL_ENV`: The environment (production, preview, development)

### Option B: Set Custom Environment Variable

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add variable:
   - **Name**: `VITE_REDIRECT_URL`
   - **Value**: `https://your-vercel-url.vercel.app`
   - **Environment**: All (Production, Preview, Development)

Then update the code to use it as a fallback.

---

## Quick Fix (Immediate)

**Just update Supabase dashboard with your Vercel URL - this will work immediately!**

---

## Testing After Fix

1. Clear browser cache/cookies
2. Navigate to your Vercel deployment
3. Click "Sign in with Google"
4. Should redirect back to your Vercel URL after authentication
5. You should see the Dashboard

---

## Vercel URLs to Add (Template)

Replace `your-app-name` with your actual Vercel project name:

```
# Development
http://localhost:3000
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:5176
http://localhost:5177
http://localhost:5178
http://localhost:5179

# Production
https://your-app-name.vercel.app

# Preview deployments (wildcard)
https://your-app-name-*.vercel.app

# Custom domain (if you have one)
https://yourdomain.com
```

---

## Common Issues

### Issue: Still redirecting to localhost after adding URL
**Solution**: Clear browser cache and cookies for both Supabase and your app

### Issue: Different URL on each preview deployment
**Solution**: Use the wildcard pattern `https://your-app-name-*.vercel.app`

### Issue: 404 after redirect
**Solution**: Check that your Site URL in Supabase matches your main production URL

---

## Status
- ✅ Code is correct (`window.location.origin`)
- ⚠️  **ACTION REQUIRED**: Update Supabase dashboard settings
- ⏳ Waiting for Supabase configuration update

Once you update Supabase settings, the login will work immediately (no code changes needed).
