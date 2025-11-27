"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * LanguageSwitcher - Alternative language switcher component
 * 
 * NOTE: The Header uses LocaleSwitcher.tsx instead.
 * This component is kept for backward compatibility but should NOT be used
 * as the primary language control.
 * 
 * If you need to add language switching elsewhere, prefer using LocaleSwitcher.
 */

const LANGUAGE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  ar: "🇸🇦",
  hi: "🇮🇳",
  "zh-Hans": "🇨🇳",
  de: "🇩🇪",
  fr: "🇫🇷",
  it: "🇮🇹",
  pt: "🇧🇷",
};

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
  hi: "हिन्दी",
  "zh-Hans": "简体中文",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
};

function getCurrentLocale(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return 'en';
}

function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return pathname;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = getCurrentLocale(pathname);
  const [open, setOpen] = useState(false);

  function switchLanguage(locale: Locale) {
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    
    // Set NEXT_LOCALE cookie for next-intl middleware
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    
    startTransition(() => {
      if (locale === 'en') {
        router.push(pathWithoutLocale);
      } else {
        router.push(`/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`);
      }
    });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
        aria-label="Select language"
      >
        <span className="text-lg">{LANGUAGE_FLAGS[currentLocale]}</span>
        <span className="text-sm font-medium">{currentLocale.toUpperCase()}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                disabled={isPending}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 ${
                  currentLocale === locale ? "bg-primary-50 text-primary-700" : ""
                }`}
              >
                <span className="text-lg">{LANGUAGE_FLAGS[locale]}</span>
                <span className="text-sm">{LANGUAGE_NAMES[locale]}</span>
                {currentLocale === locale && (
                  <span className="ml-auto text-primary-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
