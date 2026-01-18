# 🚨 FIX FOR VERCEL LOGIN REDIRECT

You are being redirected to `localhost` because Supabase does not recognize your Vercel preview URLs as authorized redirect targets. When an unauthorized URL is requested, Supabase falls back to your default Site URL (which is set to localhost).

## ⚡ Immediate Fix

1. Open your **Supabase Dashboard**.
2. Go to **Authentication** > **URL Configuration**.
3. Scroll down to **Redirect URLs**.
4. Click **Add URL** and add the following:

```
https://aible-mvp-git-dev-karthik-vetrivels-projects.vercel.app/**
```

and

```
https://aible-mvp-git-qa-karthik-vetrivels-projects.vercel.app/**
```

5. **Highly Recommended**: Add a wildcard URL to support all future Vercel preview deployments automatically:

```
https://*-karthik-vetrivels-projects.vercel.app/**
```

6. Click **Save**.

## 🔄 Verification

After saving, wait about 1 minute, then try logging in again from your Vercel deployment. You should now be redirected back to the Vercel app instead of localhost.
