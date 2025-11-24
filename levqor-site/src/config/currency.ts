export const CURRENCY_RATES = {
  GBP: { symbol: "£", rate: 1.0 },
  USD: { symbol: "$", rate: 1.27 },
  EUR: { symbol: "€", rate: 1.17 },
} as const;

export type Currency = keyof typeof CURRENCY_RATES;

export function convertPrice(gbpPrice: number, currency: Currency): number {
  return Math.round(gbpPrice * CURRENCY_RATES[currency].rate);
}

export function formatPrice(gbpPrice: number, currency: Currency): string {
  const converted = convertPrice(gbpPrice, currency);
  const symbol = CURRENCY_RATES[currency].symbol;
  return `${symbol}${converted}`;
}
