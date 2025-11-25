import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'ar', 'hi', 'zh-Hans', 'de', 'fr', 'it', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  hi: 'हिन्दी',
  'zh-Hans': '简体中文',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
};

export const localeCurrencies: Record<Locale, string> = {
  en: 'GBP',
  es: 'EUR',
  ar: 'USD',
  hi: 'INR',
  'zh-Hans': 'CNY',
  de: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pt: 'EUR',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  ar: 'rtl',
  hi: 'ltr',
  'zh-Hans': 'ltr',
  de: 'ltr',
  fr: 'ltr',
  it: 'ltr',
  pt: 'ltr',
};

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale && locales.includes(locale as Locale) 
    ? (locale as Locale) 
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
