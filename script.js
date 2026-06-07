import { data } from "./data.js";

const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);

const periods = [...new Set(data.map(d => d.period))];

const getValue = (period, category, type) => {
  const fullName = `${category} ${type}`;
  const item = data.find(d => d.period === period && d.name === fullName);
  return item ? item.value : 0;
};

const series = [
  // «В программе»
  {
    name: "В программе ЦП",
    type: "bar",
    stack: "В программе",
    data: periods.map(p => getValue(p, "В программе", "ЦП"))
  },
  {
    name: "В программе ИТ",
    type: "bar",
    stack: "В программе",
    data: periods.map(p => getValue(p, "В программе", "ИТ")),
    label: {
      show: true,
      position: "top",
      formatter: (params) => {
        const idx = params.dataIndex;
        const val1 = getValue(periods[idx], "В программе", "ЦП");
        const val2 = getValue(periods[idx], "В программе", "ИТ");
        return val1 + val2;
      },
      fontSize: 12,
      fontWeight: "bold"
    }
  },
  // «Вне программ»
  {
    name: "Вне программ ЦП",
    type: "bar",
    stack: "Вне программ",
    data: periods.map(p => getValue(p, "Вне программ", "ЦП"))
  },
  {
    name: "Вне программ ИТ",
    type: "bar",
    stack: "Вне программ",
    data: periods.map(p => getValue(p, "Вне программ", "ИТ")),
    label: {
      show: true,
      position: "top",
      formatter: (params) => {
        const idx = params.dataIndex;
        const val1 = getValue(periods[idx], "Вне программ", "ЦП");
        const val2 = getValue(periods[idx], "Вне программ", "ИТ");
        return val1 + val2;
      },
      fontSize: 12,
      fontWeight: "bold"
    }
  }
];

// Опции
const option = {
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" }
  },
  legend: {
    top: 10,
    type: "scroll",
    orient: "horizontal",
    width: "90%",
    left: "center",
    data: ["В программе ЦП", "В программе ИТ", "Вне программ ЦП", "Вне программ ИТ"]
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    top: "20%",
    containLabel: true
  },
  xAxis: {
    type: "category",
    data: periods,
    axisTick: { alignWithLabel: true }
  },
  yAxis: {
    type: "value"
  },
  color: [
    "#1E90FF", // В программе ЦП (синий)
    "#87CEFA", // В программе ИТ (голубой)
    "#006400", // Вне программ ЦП (тёмно-зелёный)
    "#3CB371"  // Вне программ ИТ (светло-зелёный)
  ],
  series
};

myChart.setOption(option);

myChart.on('legendselectchanged', function() {
  myChart.setOption({
    series: series.map(s => ({
      ...s,
      label: s.label ? { ...s.label } : undefined
    }))
  });
});

window.addEventListener('resize', () => {
  myChart.resize();
});