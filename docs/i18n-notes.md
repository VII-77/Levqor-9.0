# Levqor i18n Architecture Analysis

## Phase 1 Findings (November 2025)

### Locale Sources

| Component | Source of Locale | Notes |
|-----------|------------------|-------|
| `LocaleSwitcher.tsx` (Header) | `useLocale()` from next-intl | Uses window.location.assign() for navigation |
| `LanguageSwitcher.tsx` | Parses pathname | Alternative component, not used in Header |
| `HomepageBrainDemo.tsx` | `useLocale()` from next-intl | Passes locale to Brain API |
| `BrainFixMyWorkflow.tsx` | `useLanguageStore()` | Uses localStorage, NOT next-intl! |
| `BrainErrorDebugger.tsx` | `useLanguageStore()` | Uses localStorage, NOT next-intl! |
| `LanguageProvider` | URL param from layout | Wraps app in context |

### Routing Configuration

- **File**: `src/i18n/routing.ts`
- **Locales**: en, es, ar, hi, zh-Hans, de, fr, it, pt (9 total)
- **Default**: `en`
- **Prefix**: `as-needed` (English at `/`, others at `/{locale}`)

### Cookie Behavior

next-intl by default uses `NEXT_LOCALE` cookie for:
1. Persisting user's language preference
2. Locale detection in middleware

**Current behavior**: LocaleSwitcher does NOT set `NEXT_LOCALE` cookie, causing
potential mismatch between URL and cookie after switching.

## Phase 2 Bug Analysis

### Root Cause
The LocaleSwitcher navigates to the correct URL but does NOT update the NEXT_LOCALE
cookie. This means:
1. User switches from DE → EN (navigates to `/`)
2. NEXT_LOCALE cookie still contains "de"
3. On next navigation or refresh, next-intl middleware may use cookie value
4. User may see German content or get redirected unexpectedly

### Secondary Issue
`BrainFixMyWorkflow.tsx` and `BrainErrorDebugger.tsx` use `useLanguageStore()`
which reads from localStorage, not from the actual route locale. This is a
separate source of truth that can get out of sync.

## Fix Plan

1. **LocaleSwitcher.tsx**: Add `NEXT_LOCALE` cookie update before navigation
2. **Brain components**: Switch from `useLanguageStore()` to `useLocale()` from next-intl
3. **Remove duplicate store logic** if no longer needed
