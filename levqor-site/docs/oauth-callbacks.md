# OAuth Callback URLs for Levqor

This document lists the exact redirect/callback URLs that must be configured in your OAuth provider settings.

## Production Domain

Base URL: `https://www.levqor.ai`

---

## Google OAuth

**Provider ID in Auth.js:** `google`

### Required Callback URL
```
https://www.levqor.ai/api/auth/callback/google
```

### Configuration in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://www.levqor.ai/api/auth/callback/google`
5. Save changes

---

## Microsoft / Azure AD

**Provider ID in Auth.js:** `azure-ad`

### Required Callback URL
```
https://www.levqor.ai/api/auth/callback/azure-ad
```

### Configuration in Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your application
4. Go to **Authentication** → **Platform configurations** → **Web**
5. Under **Redirect URIs**, add:
   - `https://www.levqor.ai/api/auth/callback/azure-ad`
6. Ensure **Supported account types** includes your desired scope (e.g., "Accounts in any organizational directory and personal Microsoft accounts")
7. Save changes

---

## Development/Local Testing (Optional)

If you need to test locally, also add these URLs to each provider:

### Google
```
http://localhost:5000/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### Microsoft
```
http://localhost:5000/api/auth/callback/azure-ad
http://localhost:3000/api/auth/callback/azure-ad
```

---

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error (Google)**
   - The callback URL in Google Cloud Console doesn't exactly match
   - Check for trailing slashes, http vs https, www vs non-www

2. **"AADSTS50011" error (Microsoft)**
   - The reply URL is not registered in Azure AD
   - Ensure the exact URL including `/api/auth/callback/azure-ad` is listed

3. **Session not created after OAuth**
   - Verify `NEXTAUTH_SECRET` is set and consistent across all environments
   - Check that cookies are being set correctly (inspect browser DevTools)

### Debug Endpoints

- Session Debug: `https://www.levqor.ai/api/auth/session-debug`
- Auth Debug: `https://www.levqor.ai/api/auth/debug`
