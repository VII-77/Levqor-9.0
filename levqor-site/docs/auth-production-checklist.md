# Levqor Auth Production Checklist

## Pre-Deployment Checklist

### 1. Vercel Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value Pattern | Required |
|----------|--------------|----------|
| `NEXTAUTH_URL` | `https://www.levqor.ai` | Yes |
| `NEXTAUTH_SECRET` | 32+ char random string (same as current) | Yes |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Yes |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Yes |
| `MICROSOFT_CLIENT_ID` | UUID format | Optional |
| `MICROSOFT_CLIENT_SECRET` | Secret string | Optional |

### 2. Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Verify these **Redirect URIs**:
   ```
   https://www.levqor.ai/api/auth/callback/google
   ```
4. Verify these **JavaScript Origins**:
   ```
   https://www.levqor.ai
   https://levqor.ai
   ```

### 3. Azure AD (if using Microsoft auth)

1. Go to: Azure Portal → App Registrations
2. Edit your app → Authentication
3. Verify **Redirect URI**:
   ```
   https://www.levqor.ai/api/auth/callback/azure-ad
   ```

### 4. Cloudflare/DNS

1. Ensure both `levqor.ai` and `www.levqor.ai` resolve correctly
2. Verify SSL is active for both
3. If using Cloudflare proxy, ensure it's configured for both

### 5. Vercel Domain Settings

1. Go to: Vercel Dashboard → Project → Settings → Domains
2. Verify:
   - `www.levqor.ai` is the primary domain
   - `levqor.ai` redirects to `www.levqor.ai`

## Post-Deployment Verification

### Step 1: Test Debug Endpoint

Visit: `https://www.levqor.ai/api/auth/debug`

Expected response:
```json
{
  "host": "www.levqor.ai",
  "nextauth_url": "https://www.levqor.ai",
  "has_nextauth_secret": true,
  "has_any_auth_cookie": false,
  ...
}
```

### Step 2: Test Google Sign-in

1. Open incognito window
2. Go to: `https://www.levqor.ai/signin`
3. Click "Continue with Google"
4. Complete Google authentication
5. You should land on: `https://www.levqor.ai/en/dashboard`

### Step 3: Verify Cookie

After successful sign-in:
1. Open DevTools → Application → Cookies
2. Look for `authjs.session-token` or `__Secure-authjs.session-token`
3. Domain should be `www.levqor.ai` or `.www.levqor.ai`

## If Sign-in Loop Persists

1. **Clear all cookies** for levqor.ai domain
2. **Check browser console** for errors
3. **Check Vercel logs** for auth errors
4. Visit `/api/auth/debug` after attempting sign-in to see diagnostic info
5. Compare `NEXTAUTH_SECRET` between Vercel and what was used previously

## Quick Reference: Manual Steps Required

1. Verify NEXTAUTH_URL = `https://www.levqor.ai` in Vercel
2. Verify NEXTAUTH_SECRET is set and hasn't changed
3. Verify Google OAuth redirect URI includes `www.levqor.ai`
4. Verify Vercel domain settings have www as primary
5. Clear browser cookies and test in incognito
