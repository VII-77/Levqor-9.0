import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'de', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

export const localeCurrencies: Record<Locale, string> = {
  en: 'GBP',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
};

export default getRequestConfig(async ({ locale }) => {
  // Default to 'en' for routes that bypass i18n middleware (/, /status, etc.)
  // This prevents notFound() from being called when no locale context exists
  const resolvedLocale = locale && locales.includes(locale as Locale) 
    ? (locale as Locale) 
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
