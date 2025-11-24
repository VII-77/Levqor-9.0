import { Locale, localeCurrencies } from '@/i18n';

export type Currency = 'GBP' | 'EUR' | 'USD';

export const currencySymbols: Record<Currency, string> = {
  GBP: '£',
  EUR: '€',
  USD: '$',
};

export const currencyLocales: Record<Currency, string> = {
  GBP: 'en-GB',
  EUR: 'de-DE',
  USD: 'en-US',
};

export function formatCurrency(
  amount: number,
  currency: Currency = 'GBP',
  locale?: string
): string {
  const localeStr = locale || currencyLocales[currency];
  
  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencyForLocale(locale: Locale): Currency {
  return localeCurrencies[locale] as Currency;
}

export function getCurrencySymbol(currency: Currency): string {
  return currencySymbols[currency];
}
