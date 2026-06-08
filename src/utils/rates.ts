import { fallbackData, type CurrencyCode } from '../data/data';

export interface MonthlyPoint {
  label: string;
  value: number | null;
  isoDate: string;
}

const MONTH_LABELS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'Доллар США',
  EUR: 'Евро',
  CNY: 'Юань',
};

const YEAR_OPTIONS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

const formatNumber = (value: number): number => Math.round(value * 100) / 100;

const scaleForYear = (currency: CurrencyCode, year: number): number => {
  const delta = year - 2016;
  const yearlyStep: Record<CurrencyCode, number> = {
    USD: 0.09,
    EUR: 0.085,
    CNY: 0.055,
  };

  return 1 + delta * yearlyStep[currency];
};

const buildFallbackMonthlyTemplate = (currency: CurrencyCode): number[] => {
  const currencyPoints = fallbackData
    .filter((item) => item.currency === currency)
    .sort((a, b) => a.month - b.month);

  const byMonth = new Map<number, number>();
  currencyPoints.forEach((item) => byMonth.set(item.month, item.value));

  const template: number[] = [];

  for (let month = 1; month <= 12; month += 1) {
    const exact = byMonth.get(month);
    if (typeof exact === 'number') {
      template.push(exact);
      continue;
    }

    const previous = [...byMonth.entries()]
      .filter(([m]) => m < month)
      .sort((a, b) => b[0] - a[0])[0];
    const next = [...byMonth.entries()]
      .filter(([m]) => m > month)
      .sort((a, b) => a[0] - b[0])[0];

    if (previous && next) {
      const [prevMonth, prevValue] = previous;
      const [nextMonth, nextValue] = next;
      const t = (month - prevMonth) / (nextMonth - prevMonth);
      template.push(formatNumber(prevValue + (nextValue - prevValue) * t));
      continue;
    }

    if (previous) {
      template.push(previous[1]);
      continue;
    }

    if (next) {
      template.push(next[1]);
      continue;
    }

    template.push(0);
  }

  return template;
};

const createFallbackSeries = (currency: CurrencyCode, year: number): MonthlyPoint[] => {
  const baseTemplate = buildFallbackMonthlyTemplate(currency);
  const scale = scaleForYear(currency, year);

  return baseTemplate.map((value, index) => ({
    label: `${MONTH_LABELS_RU[index]} ${year}`,
    isoDate: `${year}-${String(index + 1).padStart(2, '0')}-01`,
    value: formatNumber(value * scale),
  }));
};

export const loadCurrencySeries = async (currency: CurrencyCode, year: number): Promise<MonthlyPoint[]> => {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const response = await fetch(
    `https://api.frankfurter.dev/v2/rates?from=${start}&to=${end}&base=${currency}&quotes=RUB&group=month&providers=CBR`,
  );

  if (!response.ok) {
    throw new Error(`Frankfurter API responded with ${response.status}`);
  }

  const payload = await response.json();
  console.log(payload);

  if (Array.isArray(payload)) {
    return payload.map((item: any) => ({
      label: `${MONTH_LABELS_RU[Number(item.date.slice(5, 7)) - 1]} ${year}`,
      isoDate: item.date,
      value: formatNumber(item.rate),
    }));
  }

  return createFallbackSeries(currency, year);
  };

export const getAverage = (points: MonthlyPoint[]): number | null => {
  const values = points
    .map((item) => item.value)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  return formatNumber(values.reduce((sum, current) => sum + current, 0) / values.length);
};

export const getAvailablePointCount = (points: MonthlyPoint[]): number =>
  points.filter((point) => point.value !== null).length;

export const getFirstAndLastLabel = (
  points: MonthlyPoint[],
): { first: string; last: string } | null => {
  const available = points.filter((point) => point.value !== null);

  if (available.length === 0) {
    return null;
  }

  return {
    first: available[0].label,
    last: available[available.length - 1].label,
  };
};

export const currencyLabels: Record<CurrencyCode, string> = CURRENCY_LABELS;
export const currencyOptions = (Object.keys(CURRENCY_LABELS) as CurrencyCode[]).map((code) => ({
  id: code,
  label: `${code} — ${CURRENCY_LABELS[code]}`,
}));
export const yearOptions = [...YEAR_OPTIONS].map((year) => ({ id: year, label: String(year) }));
