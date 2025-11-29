# Levqor Auth Domain & Secret Configuration

## Overview

This document explains how authentication is configured for Levqor, including domain handling and secret management.

## Canonical Domain

**Canonical Host:** `www.levqor.ai`

All authentication flows use `www.levqor.ai` as the canonical host. This is enforced by:

1. **next.config.js redirects**: Redirects `levqor.ai` → `www.levqor.ai`
2. **NEXTAUTH_URL environment variable**: Must be set to `https://www.levqor.ai`
3. **OAuth provider callback URLs**: Must use `https://www.levqor.ai/api/auth/callback/[provider]`

## Environment Variables Required

### In Vercel (Production)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_URL` | `https://www.levqor.ai` | Must match canonical host exactly |
| `NEXTAUTH_SECRET` | (32+ character random string) | Same value for all deployments |
| `GOOGLE_CLIENT_ID` | (from Google Cloud Console) | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud Console) | OAuth 2.0 client secret |
| `MICROSOFT_CLIENT_ID` | (from Azure AD) | Optional, for Microsoft auth |
| `MICROSOFT_CLIENT_SECRET` | (from Azure AD) | Optional, for Microsoft auth |

### Critical Notes

1. **NEXTAUTH_SECRET must be identical** across all environments where tokens need to be validated. If you regenerate this, all existing sessions will be invalidated.

2. **NEXTAUTH_URL determines cookie domain**. If this doesn't match the actual domain users access, cookies won't be readable.

3. **Do not set AUTH_SECRET** - Auth.js v5 uses `NEXTAUTH_SECRET` or `AUTH_SECRET`. We standardize on `NEXTAUTH_SECRET`.

## OAuth Provider Configuration

### Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   - `https://www.levqor.ai/api/auth/callback/google`
4. Add these **Authorized JavaScript origins**:
   - `https://www.levqor.ai`
   - `https://levqor.ai` (for redirect handling)

### Azure AD (Microsoft)

1. Go to Azure Portal → App Registrations
2. Select your app → Authentication
3. Add these **Redirect URIs**:
   - `https://www.levqor.ai/api/auth/callback/azure-ad`
4. Ensure the app is configured for "Accounts in any organizational directory and personal Microsoft accounts"

## How Auth.js Uses Secrets

```
                    ┌─────────────────────────────────────┐
                    │         Auth.js (auth.ts)          │
                    │                                     │
                    │  secret: process.env.NEXTAUTH_SECRET│
                    │                                     │
                    │  Creates JWT → Signs with secret    │
                    │  Sets cookie → Domain from URL      │
                    └─────────────────────────────────────┘
                                      │
                                      │ JWT Cookie
                                      ▼
                    ┌─────────────────────────────────────┐
                    │     Middleware (middleware.ts)      │
                    │                                     │
                    │  getToken({ req })                  │
                    │  (uses internal secret resolution)  │
                    │                                     │
                    │  Decodes JWT → Verifies signature   │
                    └─────────────────────────────────────┘
```

## Troubleshooting Sign-in Loops

If users authenticate but are redirected back to `/signin`:

1. **Check cookie domain**: Use browser DevTools → Application → Cookies
   - Cookie should be set on `.www.levqor.ai` or `www.levqor.ai`
   - If it's on `levqor.ai` but user is on `www.levqor.ai`, cookies won't be sent

2. **Check NEXTAUTH_SECRET**: Ensure it's the same in Vercel and matches what was used to sign the JWT

3. **Check NEXTAUTH_URL**: Must be `https://www.levqor.ai` (with www)

4. **Use debug endpoint**: Visit `/api/auth/debug` to see:
   - Which cookies are present
   - Whether `getToken()` can decode them
   - Whether `auth()` returns a valid session

## Files Involved

- `src/auth.ts` - Auth.js configuration
- `src/middleware.ts` - Token verification for protected routes
- `next.config.js` - Domain redirects
- `.env.production` - Environment variable defaults

## DO NOT

- Do not pass `secret` parameter to `getToken()` in middleware - let Auth.js resolve it internally
- Do not set different NEXTAUTH_SECRET values for different environments
- Do not use `levqor.ai` (non-www) as NEXTAUTH_URL
- Do not hardcode secrets in code
