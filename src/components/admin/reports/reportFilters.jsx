import { BarChart2, LineChart, RefreshCw, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";

const CHANNELS = [
  { value: "all", label: "Todos los canales" },
  { value: "taquilla", label: "Taquilla" },
  { value: "web", label: "Web" },
  { value: "app", label: "App" },
];

const GROUP_BY = [
  { value: "day", label: "Por día" },
  { value: "week", label: "Por semana" },
  { value: "month", label: "Por mes" },
];

const CHART_TYPES = [
  { value: "line", icon: LineChart, label: "Línea" },
  { value: "bar", icon: BarChart2, label: "Barras" },
  { value: "table", icon: Table, label: "Tabla" },
];

export function ReportFilters({
  from,
  to,
  channel,
  groupBy,
  chartType,
  viewMode,
  onFromChange,
  onToChange,
  onChannelChange,
  onGroupByChange,
  onChartTypeChange,
  onViewModeChange,
  onRefresh,
  loading = false,
  showChannel = true,
  showGroupBy = true,
  showChartType = true,
}) {
  const handleTypeClick = (value) => {
    onChartTypeChange(value);
    const mode = value === "table" ? "table" : "chart";
    onViewModeChange(mode);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Rango de fechas — DatePickerCustom */}
      <DatePickerCustom label="Desde" value={from} onChange={onFromChange} />
      <DatePickerCustom label="Hasta" value={to} onChange={onToChange} />

      {/* Canal */}
      {showChannel && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Canal
          </label>
          <select
            value={channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#231640]"
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Agrupación */}
      {showGroupBy && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Agrupar
          </label>
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#231640]"
          >
            {GROUP_BY.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tipo de gráfico */}
      {showChartType && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Gráfico
          </label>
          <div className="flex gap-1">
            {CHART_TYPES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                title={label}
                onClick={() => handleTypeClick(value)}
                className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors ${
                  chartType === value
                    ? "bg-[#231640] border-[#231640] text-white"
                    : "border-input bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Refrescar */}
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={loading}
        title="Actualizar datos"
        className="h-9 w-9 self-end"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}
