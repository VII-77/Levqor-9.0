# Levqor OAuth Authentication Setup

## Overview

Levqor uses NextAuth.js v5 for authentication with the following providers:
- **Google** (OAuth 2.0 / OIDC)
- **Microsoft / Azure AD** (OAuth 2.0 / OIDC)
- **Credentials** (Email/Password for admin)

## Production Domain

**Production URL**: `https://www.levqor.ai`

The `NEXTAUTH_URL` environment variable MUST be set to `https://www.levqor.ai` (with www).

---

## Required OAuth Redirect URIs

### Google Cloud Console

Add these **Authorized redirect URIs** in the Google Cloud Console:
- Go to: https://console.cloud.google.com/apis/credentials
- Select your OAuth 2.0 Client ID
- Under "Authorized redirect URIs", add:

```
https://www.levqor.ai/api/auth/callback/google
```

Optional (for development on Vercel preview deployments):
```
https://levqor-site-*.vercel.app/api/auth/callback/google
```

**Authorized JavaScript origins** (if required):
```
https://www.levqor.ai
```

### Microsoft Azure AD / Entra ID

Add these **Redirect URIs** in the Azure Portal:
- Go to: https://portal.azure.com
- Navigate to: Azure Active Directory > App registrations > [Your App] > Authentication
- Under "Redirect URIs", add:

```
https://www.levqor.ai/api/auth/callback/azure-ad
```

Optional (for development):
```
https://levqor-site-*.vercel.app/api/auth/callback/azure-ad
```

**Platform configuration**: Web

---

## Required Environment Variables

These must be set in **Vercel Environment Variables** for production:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXTAUTH_URL` | Must be `https://www.levqor.ai` | Set manually |
| `NEXTAUTH_SECRET` | Random 32+ char string | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Google Cloud Console |
| `MICROSOFT_CLIENT_ID` | Azure app client ID | Azure Portal |
| `MICROSOFT_CLIENT_SECRET` | Azure app client secret | Azure Portal |

### Security Notes

1. **NEVER** commit secrets to `.env.production` or any file in git
2. Secrets must only be stored in Vercel Environment Variables
3. The `NEXTAUTH_SECRET` should be rotated periodically
4. Use different credentials for development vs production

---

## Troubleshooting OAuth Errors

### OAuthCallbackError

**Common causes:**
1. `NEXTAUTH_URL` mismatch (e.g., `https://levqor.ai` vs `https://www.levqor.ai`)
2. Redirect URI not added to provider console
3. Client ID/Secret mismatch between Vercel env and provider console

**How to debug:**
1. Check Vercel logs for `[NextAuth][error]` messages
2. Verify the callback URL in browser network tab during sign-in
3. Confirm redirect URIs in Google/Microsoft consoles match exactly

### Provider Not Appearing

If Google or Microsoft buttons don't appear:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Verify `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` are set
- Check Vercel function logs for "provider not configured" warnings

---

## Verification Checklist

After making changes, verify:

- [ ] `NEXTAUTH_URL` in Vercel is `https://www.levqor.ai` (with www)
- [ ] Google Console has redirect URI: `https://www.levqor.ai/api/auth/callback/google`
- [ ] Azure Portal has redirect URI: `https://www.levqor.ai/api/auth/callback/azure-ad`
- [ ] All secrets are in Vercel env, not in git
- [ ] Test Google sign-in flow end-to-end
- [ ] Test Microsoft sign-in flow end-to-end
- [ ] Check Vercel logs for any auth errors

---

## Last Updated

2025-11-27 - Fixed NEXTAUTH_URL domain mismatch (was `https://levqor.ai`, now `https://www.levqor.ai`)
