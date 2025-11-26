/**
 * Global Language Registry for Levqor X
 * 
 * Exactly 9 fully-supported languages with complete translation files.
 * All languages have dedicated URL routing via next-intl.
 */

export type LanguageCode = 
  | "en" | "de" | "fr" | "es" | "pt" | "it" | "ar" | "hi" | "zh-Hans";

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: "Europe" | "Middle East" | "South Asia" | "East Asia";
}

export const SUPPORTED_LOCALES: LanguageCode[] = ["en", "de", "fr", "es", "pt", "it", "ar", "hi", "zh-Hans"];
export const DEFAULT_LOCALE: LanguageCode = "en";

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", region: "Europe" },
  { code: "de", label: "German", nativeLabel: "Deutsch", region: "Europe" },
  { code: "fr", label: "French", nativeLabel: "Français", region: "Europe" },
  { code: "es", label: "Spanish", nativeLabel: "Español", region: "Europe" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", region: "Europe" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", region: "Europe" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", region: "Middle East" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "South Asia" },
  { code: "zh-Hans", label: "Chinese (Simplified)", nativeLabel: "简体中文", region: "East Asia" },
];

/**
 * Language lookup map for quick access by code
 */
export const LANGUAGE_MAP: Record<LanguageCode, LanguageMeta> = LANGUAGES.reduce(
  (acc, lang) => ({ ...acc, [lang.code]: lang }),
  {} as Record<LanguageCode, LanguageMeta>
);

/**
 * Group languages by region for organized display
 */
export const LANGUAGES_BY_REGION = LANGUAGES.reduce((acc, lang) => {
  if (!acc[lang.region]) {
    acc[lang.region] = [];
  }
  acc[lang.region].push(lang);
  return acc;
}, {} as Record<string, LanguageMeta[]>);

/**
 * Get the current language code from localStorage or fallback to English
 * Safe for both client and server environments
 */
export function getCurrentLanguageCode(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  try {
    const storedLang = localStorage.getItem('levqor-display-language');
    if (storedLang && LANGUAGE_MAP[storedLang as LanguageCode]) {
      return storedLang as LanguageCode;
    }
  } catch (error) {
    console.warn('Could not access localStorage for language preference');
  }
  
  return 'en';
}

/**
 * Check if a code is a valid supported locale
 */
export function isValidLocale(code: string): code is LanguageCode {
  return SUPPORTED_LOCALES.includes(code as LanguageCode);
}
