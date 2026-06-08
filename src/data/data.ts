export type CurrencyCode = 'USD' | 'EUR' | 'CNY';

export interface FallbackRatePoint {
  year: number;
  month: number;
  currency: CurrencyCode;
  value: number;
}

// Небольшой локальный набор для fallback-сценария.
// Основной экран получает исторические значения через внешний API.
export const fallbackData: FallbackRatePoint[] = [
  { year: 2016, month: 2, currency: 'USD', value: 72 },
  { year: 2016, month: 3, currency: 'USD', value: 80 },
  { year: 2016, month: 4, currency: 'USD', value: 77 },
  { year: 2016, month: 5, currency: 'USD', value: 78 },
  { year: 2016, month: 6, currency: 'USD', value: 77 },
  { year: 2016, month: 7, currency: 'USD', value: 76 },
  { year: 2016, month: 8, currency: 'USD', value: 81 },
  { year: 2016, month: 9, currency: 'USD', value: 82 },

  { year: 2016, month: 2, currency: 'EUR', value: 90 },
  { year: 2016, month: 3, currency: 'EUR', value: 88 },
  { year: 2016, month: 4, currency: 'EUR', value: 87 },
  { year: 2016, month: 5, currency: 'EUR', value: 91 },
  { year: 2016, month: 6, currency: 'EUR', value: 92 },
  { year: 2016, month: 7, currency: 'EUR', value: 93 },
  { year: 2016, month: 8, currency: 'EUR', value: 89 },
  { year: 2016, month: 9, currency: 'EUR', value: 88 },

  { year: 2016, month: 2, currency: 'CNY', value: 22 },
  { year: 2016, month: 3, currency: 'CNY', value: 24 },
  { year: 2016, month: 4, currency: 'CNY', value: 25 },
  { year: 2016, month: 5, currency: 'CNY', value: 21 },
  { year: 2016, month: 6, currency: 'CNY', value: 23 },
  { year: 2016, month: 7, currency: 'CNY', value: 24 },
  { year: 2016, month: 8, currency: 'CNY', value: 26 },
  { year: 2016, month: 9, currency: 'CNY', value: 19 },
];
