import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  "#3E2186", // primary
  "#d9982f", // accent
  "#7C3AED", // violeta
  "#059669", // esmeralda
  "#DC2626", // rojo
  "#0891B2", // cian
  "#7C2D12", // marrón
  "#4F46E5", // indigo
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e1b4b",
    border: "1px solid #3E2186",
    borderRadius: "8px",
    color: "#f9f9f8",
    fontSize: "12px",
  },
  labelStyle: { color: "#d9982f", fontWeight: 600 },
};

function flattenDatasets(datasets = []) {
  // Convierte [{label, key, data:[{label,value}]}] → [{name, key1, key2...}]
  if (!datasets?.length) return [];
  const labels = datasets[0].data.map((d) => d.label);
  return labels.map((name, i) => {
    const row = { name };
    datasets.forEach((ds) => {
      row[ds.key] = ds.data[i]?.value ?? 0;
    });
    return row;
  });
}

function PieDataset({ dataset, colors }) {
  const data = dataset.data.map((d) => ({ name: d.label, value: d.value }));
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={110}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Pie>
      <Tooltip {...tooltipStyle} />
      <Legend />
    </PieChart>
  );
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

  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieDataset dataset={data.datasets[0]} colors={PALETTE} />
      </ResponsiveContainer>
    );
  }

  const renderLines = () =>
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

  const ChartComponent =
    chartType === "bar"
      ? BarChart
      : chartType === "area"
        ? AreaChart
        : LineChart;

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
        {renderLines()}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
