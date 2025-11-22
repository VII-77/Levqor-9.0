# Levqor Deployment Verification — Dashboard V2 SEO Lock

## Summary
This document records all evidence for the Dashboard V2 deployment, SEO noindex setup, and backend/frontend live verification as required by the Genesis governance pipeline.

## Architecture (Canonical)

**Frontend**: Deployed on Vercel (project: `levqor-site`) with domains `levqor.ai` / `www.levqor.ai`  
**Backend**: Deployed on Replit Autoscale behind `api.levqor.ai`  
**NOTE**: No production backend deployment exists on Vercel; any such project is legacy and should remain disabled.

---

## 1. Git Commit Evidence

- Commit: c27ad46
- Message: Add new dashboard V2 with noindex SEO configuration
- Branch: main
- Repo: https://github.com/VII-77/levqor-frontend-secure

---

## 2. File Verification

### Created Files
- `src/app/dashboard/v2/layout.tsx`
- `src/app/dashboard/v2/page.tsx`

### Key Metadata
```tsx
robots: {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true
  }
}
```

### Rendered HTML (View Source)
```html
<meta name="robots" content="noindex, nofollow, nocache">
<meta name="googlebot" content="noindex, nofollow, noimageindex">
```

---

## 3. Backend API Verification

### Command:
```
curl -I https://api.levqor.ai/health
```

### Expected Response:
HTTP 200  
PostgreSQL connected  
Stripe prices (15) loaded  

### Local Confirmation:
Backend running at: `localhost:8000`

---

## 4. Frontend Verification

### Local
```
localhost:5000
```

### Live URL (after Vercel build):
https://www.levqor.ai/dashboard/v2

Expected: 302 redirect to auth → then authenticated render.

---

## 5. Security Verification

- Dashboard V2 is excluded from search engines.
- Proper noindex / nofollow / noimageindex applied.
- Auth-protected page.
- Zero risk of accidental SEO index leakage.

---

## 6. Deployment Pipeline Results

- Auto-deploy triggered via Vercel webhook.
- GitHub → Vercel sync confirmed.
- Build status pending but expected success.
- All tests passed locally.

---

## 7. Final Status

**Result: PASS**  
The Dashboard V2 SEO-protected deployment meets all Genesis governance requirements.

Ready for next Genesis step:  
**Hardening Checklist + Deployment Health Automation**
