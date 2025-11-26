'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, locales as routingLocales } from '@/i18n/routing';
import { useTransition } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { locales, type Locale } from '@/i18n';
import { LANGUAGES, LANGUAGES_BY_REGION, type LanguageCode } from '@/config/languages';
import { useLanguageStore } from '@/stores/languageStore';

function getTargetLocale(languageCode: LanguageCode): Locale {
  if (routingLocales.includes(languageCode as Locale)) {
    return languageCode as Locale;
  }
  return 'en';
}

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
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
    setLocalSelection(languageCode);
    setDisplayLanguage(languageCode);
    
    const targetLocale = getTargetLocale(languageCode);
    
    if (targetLocale !== locale) {
      startTransition(() => {
        router.replace(pathname, { locale: targetLocale });
      });
    }
    
    setIsOpen(false);
  }, [locale, pathname, router, setDisplayLanguage]);

  const selectedLanguage = isHydrated ? displayLanguage : localSelection;
  const currentLanguage = LANGUAGES.find(lang => lang.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-2 text-sm hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:inline">{currentLanguage.nativeLabel}</span>
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
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
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedLanguage === lang.code
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{lang.nativeLabel}</span>
                        {!lang.hasTranslations && (
                          <span className="text-xs opacity-60">(English)</span>
                        )}
                      </span>
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
          <div className="border-t border-slate-700 p-3 text-xs text-slate-400">
            <p>
              {LANGUAGES.filter(l => l.hasTranslations).length} fully translated languages.
              Other languages show English content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
