import React, { useEffect, useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';

import { ReactECharts } from './echarts/ReactECharts';
import { Text } from '@consta/uikit/Text';
import { Select } from '@consta/uikit/Select';
import { Loader } from '@consta/uikit/Loader';
import {
  currencyLabels,
  currencyOptions,
  getAverage,
  getAvailablePointCount,
  getFirstAndLastLabel,
  loadCurrencySeries,
  yearOptions,
  type MonthlyPoint,
} from './utils/rates';
import type { CurrencyCode } from './data/data';

const formatValue = (value: number | null): string => {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getChartPoints = (points: MonthlyPoint[]) => points.filter((point) => point.value !== null);

function App() {
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);

  const [selectedYear, setSelectedYear] = useState(
    yearOptions.find((item) => item.id === 2020) ?? yearOptions[0],
  );
  const [points, setPoints] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const currencyCode = selectedCurrency.id as CurrencyCode;
  const selectedYearValue = selectedYear.id;

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);

      try {
        const series = await loadCurrencySeries(
          currencyCode,
          selectedYearValue,
        );

        if (!active) {
          return;
        }

        setPoints(series);
      } catch {
        if (!active) {
          return;
        }

        setPoints([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [currencyCode, selectedYearValue]);

  const averageValue = useMemo(() => getAverage(points), [points]);
  const availableCount = useMemo(() => getAvailablePointCount(points), [points]);
  const rangeLabel = useMemo(() => getFirstAndLastLabel(points), [points]);
  const chartPoints = useMemo(() => getChartPoints(points), [points]);

  const chartOption = useMemo<EChartsOption>(() => {
    const values = chartPoints.map((point) => point.value as number);
    const axisLabels = chartPoints.map((point) => point.label.split(' ')[0]);
    const color =
      currencyCode === 'USD'
        ? '#2F80ED'
        : currencyCode === 'EUR'
        ? '#9B51E0'
        : '#F2994A';

    return {
      animationDuration: 350,
      grid: {
        left: 48,
        right: 20,
        top: 24,
        bottom: 38,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: 'rgba(17, 24, 39, 0.96)',
        borderWidth: 0,
        textStyle: { color: '#FFFFFF' },
        formatter: (params: unknown) => {
          const item = Array.isArray(params) ? params[0] : params;
          if (!item || typeof item !== 'object') {
            return '';
          }

          const data = item as { axisValueLabel?: string; data?: number | null };
          return [
            `<div style="font-weight:600;margin-bottom:4px;">${data.axisValueLabel ?? ''}</div>`,
            `<div>${currencyLabels[currencyCode]}: ${formatValue(data.data ?? null)} RUB</div>`,
          ].join('');
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: axisLabels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#D0D5DD' } },
        axisLabel: { color: '#667085' },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#667085',
          formatter: (value: number) => `${formatValue(value)} ₽`,
        },
        splitLine: { lineStyle: { color: '#EAECF0' } },
      },
      series: [
        {
          name: currencyLabels[currencyCode],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: values,
          lineStyle: {
            width: 3,
            color,
          },
          itemStyle: {
            color,
          },
          areaStyle: {
            opacity: 0.12,
            color,
          },
          markLine:
            averageValue === null
              ? undefined
              : {
                  symbol: 'none',
                  label: {
                    formatter: `Среднее: ${formatValue(averageValue)} ₽`,
                  },
                  lineStyle: {
                    type: 'dashed',
                    color: '#98A2B3',
                  },
                  data: [{ yAxis: averageValue }],
                },
        },
      ],
    };
  }, [averageValue, chartPoints, currencyCode]);

  const selectedPeriod = rangeLabel
    ? `${rangeLabel.first} — ${rangeLabel.last}`
    : `${selectedYearValue}`;

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="dashboard__header">
          <Text size="xl" weight="bold">
            Курсы валют к рублю
          </Text>
        </header>

        <section className="controls">
          <div className="control-card">
            <Text size="s" view="secondary">
              Валюта
            </Text>
            <Select
              size="s"
              items={currencyOptions}
              value={selectedCurrency}
              onChange={({ value }) => {
                if (value) {
                  setSelectedCurrency(value);
                }
              }}
            />
          </div>

          <div className="control-card">
            <Text size="s" view="secondary">
              Год
            </Text>
            <Select
              size="s"
              items={yearOptions}
              value={selectedYear}
              onChange={({ value }) => {
                if (value) {
                  setSelectedYear(value);
                }
              }}
            />
          </div>
        </section>

        <section className="metrics">
          <div className="metric-card">
            <Text size="xs" view="secondary">
              Среднее значение за период
            </Text>
            <Text size="xl" weight="bold">
              {formatValue(averageValue)} ₽
            </Text>
          </div>

          <div className="metric-card">
            <Text size="xs" view="secondary">
              Доступно точек
            </Text>
            <Text size="xl" weight="bold">
              {availableCount}
            </Text>
          </div>

          <div className="metric-card">
            <Text size="xs" view="secondary">
              Выбранный период
            </Text>
            <Text size="xl" weight="bold">
              {selectedPeriod}
            </Text>
          </div>
        </section>

        <section className="chart-card">
          {loading ? (
            <div className="chart-card__loader">
              <Loader size="m" />
              <Text size="s" view="secondary">
                Загружаем данные…
              </Text>
            </div>
          ) : (
            <ReactECharts option={chartOption} loading={loading} style={{ height: 420 }} />
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
