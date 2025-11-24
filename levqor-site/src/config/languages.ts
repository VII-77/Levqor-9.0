/**
 * Global Language Registry for Levqor X 9.0
 * 
 * This registry defines all languages available in the UI switcher for marketing purposes.
 * Note: Only 4 core locales (en, de, fr, es) have full routing and translations.
 * Other languages use English content as placeholders until translations are added.
 * 
 * SAFETY: This is display-only and does NOT affect routing, pricing, or backend behavior.
 */

export type LanguageCode =
  // Core routed locales (full translation support)
  | "en" | "de" | "fr" | "es"
  // European languages
  | "pt" | "it" | "nl" | "sv" | "no" | "da"
  | "fi" | "pl" | "cs" | "sk" | "hu"
  | "ro" | "bg" | "el" | "ru" | "uk"
  // Middle Eastern languages
  | "tr" | "ar" | "he" | "fa" | "ur"
  // South Asian languages
  | "hi" | "bn" | "ta" | "te" | "ml"
  | "pa" | "gu"
  // East Asian languages
  | "zh-Hans" | "zh-Hant"
  | "ja" | "ko"
  // Southeast Asian languages
  | "vi" | "id" | "ms" | "th";

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  region: "Europe" | "Middle East" | "South Asia" | "East Asia" | "Southeast Asia";
  /** Maps to one of the 4 routed locales (en, de, fr, es) for actual content */
  routedLocale: "en" | "de" | "fr" | "es";
  /** Whether this language has full translation files */
  hasTranslations: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  // Core routed locales (full support)
  { code: "en", label: "English", nativeLabel: "English", region: "Europe", routedLocale: "en", hasTranslations: true },
  { code: "de", label: "German", nativeLabel: "Deutsch", region: "Europe", routedLocale: "de", hasTranslations: true },
  { code: "fr", label: "French", nativeLabel: "Français", region: "Europe", routedLocale: "fr", hasTranslations: true },
  { code: "es", label: "Spanish", nativeLabel: "Español", region: "Europe", routedLocale: "es", hasTranslations: true },
  
  // European languages (English content placeholders)
  { code: "pt", label: "Portuguese", nativeLabel: "Português", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "it", label: "Italian", nativeLabel: "Italiano", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "no", label: "Norwegian", nativeLabel: "Norsk", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "da", label: "Danish", nativeLabel: "Dansk", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "fi", label: "Finnish", nativeLabel: "Suomi", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "pl", label: "Polish", nativeLabel: "Polski", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "cs", label: "Czech", nativeLabel: "Čeština", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "sk", label: "Slovak", nativeLabel: "Slovenčina", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "hu", label: "Hungarian", nativeLabel: "Magyar", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "ro", label: "Romanian", nativeLabel: "Română", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "bg", label: "Bulgarian", nativeLabel: "Български", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "el", label: "Greek", nativeLabel: "Ελληνικά", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "ru", label: "Russian", nativeLabel: "Русский", region: "Europe", routedLocale: "en", hasTranslations: false },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська", region: "Europe", routedLocale: "en", hasTranslations: false },
  
  // Middle Eastern languages (English content placeholders)
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe", region: "Middle East", routedLocale: "en", hasTranslations: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", region: "Middle East", routedLocale: "en", hasTranslations: false },
  { code: "he", label: "Hebrew", nativeLabel: "עברית", region: "Middle East", routedLocale: "en", hasTranslations: false },
  { code: "fa", label: "Persian (Farsi)", nativeLabel: "فارسی", region: "Middle East", routedLocale: "en", hasTranslations: false },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", region: "South Asia", routedLocale: "en", hasTranslations: false },
  
  // South Asian languages (English content placeholders)
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", region: "South Asia", routedLocale: "en", hasTranslations: false },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", region: "South Asia", routedLocale: "en", hasTranslations: false },
  
  // East Asian languages (English content placeholders)
  { code: "zh-Hans", label: "Chinese (Simplified)", nativeLabel: "简体中文", region: "East Asia", routedLocale: "en", hasTranslations: false },
  { code: "zh-Hant", label: "Chinese (Traditional)", nativeLabel: "繁體中文", region: "East Asia", routedLocale: "en", hasTranslations: false },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", region: "East Asia", routedLocale: "en", hasTranslations: false },
  { code: "ko", label: "Korean", nativeLabel: "한국어", region: "East Asia", routedLocale: "en", hasTranslations: false },
  
  // Southeast Asian languages (English content placeholders)
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", region: "Southeast Asia", routedLocale: "en", hasTranslations: false },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", region: "Southeast Asia", routedLocale: "en", hasTranslations: false },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu", region: "Southeast Asia", routedLocale: "en", hasTranslations: false },
  { code: "th", label: "Thai", nativeLabel: "ไทย", region: "Southeast Asia", routedLocale: "en", hasTranslations: false },
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
 * Get the routed locale for a given language code
 * This maps display languages to actual routed locales (en, de, fr, es)
 */
export function getRoutedLocale(code: LanguageCode): "en" | "de" | "fr" | "es" {
  return LANGUAGE_MAP[code]?.routedLocale || "en";
}

/**
 * Check if a language code has full translation support
 */
export function hasFullTranslations(code: LanguageCode): boolean {
  return LANGUAGE_MAP[code]?.hasTranslations || false;
}

/**
 * Get the current language code from localStorage or fallback to English
 * Safe for both client and server environments
 */
export function getCurrentLanguageCode(): LanguageCode {
  // Server-side safety: return default
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  try {
    const storedLang = localStorage.getItem('levqor-display-language');
    if (storedLang && LANGUAGE_MAP[storedLang as LanguageCode]) {
      return storedLang as LanguageCode;
    }
  } catch (error) {
    // Fail safely if localStorage is unavailable
    console.warn('Could not access localStorage for language preference');
  }
  
  return 'en';
}
