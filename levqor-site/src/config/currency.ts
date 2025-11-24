// CRITICAL SAFETY: These rates are for DISPLAY ONLY
// DO NOT use these functions to modify locked Blueprint pricing (£9/£29/£59/£149)
// Pricing page uses hardcoded GBP values only - currency switcher is presentational
export const CURRENCY_RATES = {
  GBP: { symbol: "£", rate: 1.0 },
  USD: { symbol: "$", rate: 1.27 },
  EUR: { symbol: "€", rate: 1.17 },
} as const;

export type Currency = keyof typeof CURRENCY_RATES;

// WARNING: Do NOT use this to change pricing page values
export function convertPrice(gbpPrice: number, currency: Currency): number {
  return Math.round(gbpPrice * CURRENCY_RATES[currency].rate);
}

// WARNING: Do NOT use this to change pricing page values
export function formatPrice(gbpPrice: number, currency: Currency): string {
  const converted = convertPrice(gbpPrice, currency);
  const symbol = CURRENCY_RATES[currency].symbol;
  return `${symbol}${converted}`;
}
