'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LanguageCode, LanguageMeta, RoutedLocale } from '@/config/languages';
import { LANGUAGE_MAP, LANGUAGES, getRoutedLocale, hasFullTranslations } from '@/config/languages';

const STORAGE_KEY = 'levqor-display-language';

interface LanguageContextValue {
  displayLanguage: LanguageCode;
  isHydrated: boolean;
  setDisplayLanguage: (code: LanguageCode) => void;
  languageMeta: LanguageMeta | undefined;
  routedLocale: RoutedLocale;
  hasTranslations: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export function LanguageProvider({ children, initialLocale = 'en' }: LanguageProviderProps) {
  const [displayLanguage, setDisplayLanguageState] = useState<LanguageCode>(initialLocale as LanguageCode);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGE_MAP[stored as LanguageCode]) {
        setDisplayLanguageState(stored as LanguageCode);
      }
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          const newLang = e.newValue as LanguageCode;
          if (LANGUAGE_MAP[newLang]) {
            setDisplayLanguageState(newLang);
          }
        }
      };
      
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);

  const setDisplayLanguage = useCallback((code: LanguageCode) => {
    if (LANGUAGE_MAP[code]) {
      setDisplayLanguageState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
        window.dispatchEvent(new CustomEvent('levqor-language-change', { 
          detail: { language: code } 
        }));
      }
    }
  }, []);

  const value: LanguageContextValue = {
    displayLanguage,
    isHydrated,
    setDisplayLanguage,
    languageMeta: LANGUAGE_MAP[displayLanguage],
    routedLocale: getRoutedLocale(displayLanguage),
    hasTranslations: hasFullTranslations(displayLanguage),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageStore() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      displayLanguage: 'en' as LanguageCode,
      isHydrated: false,
      setDisplayLanguage: () => {},
      languageMeta: LANGUAGES[0],
      routedLocale: 'en' as const,
      hasTranslations: true,
    };
  }
  return context;
}

export function useDisplayLanguage() {
  const { displayLanguage, isHydrated } = useLanguageStore();
  return { displayLanguage, isHydrated };
}

export function useSetDisplayLanguage() {
  const { setDisplayLanguage } = useLanguageStore();
  return setDisplayLanguage;
}

export function useLanguageMeta() {
  const { languageMeta } = useLanguageStore();
  return languageMeta || LANGUAGES[0];
}

export function useLanguageChange(callback: (language: string) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handler = (e: CustomEvent<{ language: string }>) => {
      callback(e.detail.language);
    };
    
    window.addEventListener('levqor-language-change', handler as EventListener);
    return () => window.removeEventListener('levqor-language-change', handler as EventListener);
  }, [callback]);
}
