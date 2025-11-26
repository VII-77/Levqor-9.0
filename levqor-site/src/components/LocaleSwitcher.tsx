'use client';

import { useLocale } from 'next-intl';
import { usePathname as useNextPathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LANGUAGES, LANGUAGES_BY_REGION, SUPPORTED_LOCALES, DEFAULT_LOCALE, type LanguageCode } from '@/config/languages';
import { useLanguageStore } from '@/stores/languageStore';

/**
 * Handle language change with deterministic navigation.
 * Uses window.location.assign for full page reload to ensure next-intl re-initializes.
 */
function navigateToLocale(nextLocale: LanguageCode, currentPathname: string) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLocalePrefix = SUPPORTED_LOCALES.includes(first as LanguageCode);

  if (nextLocale === DEFAULT_LOCALE) {
    const pathWithoutLocale = hasLocalePrefix
      ? "/" + segments.slice(1).join("/")
      : url.pathname;
    
    url.pathname = pathWithoutLocale === "" ? "/" : pathWithoutLocale;
    window.location.assign(url.toString());
    return;
  }

  if (hasLocalePrefix) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }

  url.pathname = "/" + segments.join("/");
  window.location.assign(url.toString());
}

export function LocaleSwitcher() {
  const currentLocale = useLocale() as LanguageCode;
  const pathname = useNextPathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { displayLanguage, isHydrated, setDisplayLanguage } = useLanguageStore();
  const [localSelection, setLocalSelection] = useState<LanguageCode>(displayLanguage);

  useEffect(() => {
    if (isHydrated) {
      setLocalSelection(displayLanguage);
    }
  }, [displayLanguage, isHydrated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = useCallback((languageCode: LanguageCode) => {
    if (typeof window === "undefined") return;
    
    setLocalSelection(languageCode);
    setDisplayLanguage(languageCode);
    setIsOpen(false);
    
    if (languageCode !== currentLocale) {
      setIsNavigating(true);
      navigateToLocale(languageCode, pathname);
    }
  }, [currentLocale, pathname, setDisplayLanguage]);

  const selectedLanguage = isHydrated ? displayLanguage : localSelection;
  const currentLanguage = LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isNavigating}
        className="flex items-center gap-2 bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-2 text-sm hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:inline">{currentLanguage.nativeLabel}</span>
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        {isNavigating ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            {Object.entries(LANGUAGES_BY_REGION).map(([region, languages]) => (
              <div key={region} className="mb-3 last:mb-0">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {region}
                </div>
                <div className="space-y-0.5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={isNavigating}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-50 ${
                        selectedLanguage === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeLabel}</span>
                      {selectedLanguage === lang.code && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
