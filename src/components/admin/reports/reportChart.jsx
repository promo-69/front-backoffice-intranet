import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const PALETTE = [
  "#3E2186",
  "#d9982f",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#0891B2",
  "#7C2D12",
  "#4F46E5",
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#231640",
    border: "1px solid #3E2186",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "12px",
  },
  labelStyle: { color: "#d9982f", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "#ffffff" },
};

function flattenDatasets(datasets = []) {
  if (!datasets?.length) return [];

  const rawLabels = datasets[0].data.map((d) => d.label);

  const labelCount = {};
  const labels = rawLabels.map((label) => {
    if (labelCount[label] === undefined) labelCount[label] = 0;
    labelCount[label] += 1;
    const count = labelCount[label];
    return count > 1 ? `${label} (${count})` : label;
  });

  return labels.map((name, i) => {
    const row = { name };
    datasets.forEach((ds) => {
      row[ds.key] = ds.data[i]?.value ?? 0;
    });
    return row;
  });
}

export function ReportChart({
  data,
  overrideType,
  loading = false,
  height = 320,
}) {
  if (loading) {
    return <Skeleton className="w-full" style={{ height }} />;
  }

  if (!data?.datasets?.length) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        Sin datos para el período seleccionado
      </div>
    );
  }

  const chartType = overrideType || data.type || "bar";
  const flatData = flattenDatasets(data.datasets);

  const ChartComponent =
    chartType === "bar"
      ? BarChart
      : chartType === "area"
        ? AreaChart
        : LineChart;

  const renderSeries = () =>
    data.datasets.map((ds, i) => {
      const color = PALETTE[i % PALETTE.length];
      if (chartType === "area") {
        return (
          <Area
            key={ds.key}
            type="monotone"
            dataKey={ds.key}
            name={ds.label}
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />
        );
      }
      if (chartType === "bar") {
        return (
          <Bar
            key={ds.key}
            dataKey={ds.key}
            name={ds.label}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        );
      }
      return (
        <Line
          key={ds.key}
          type="monotone"
          dataKey={ds.key}
          name={ds.label}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      );
    });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={flatData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {renderSeries()}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
