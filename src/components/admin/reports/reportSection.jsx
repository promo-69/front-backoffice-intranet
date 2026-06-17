import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReportChart } from "@/components/admin/reports/reportChart";
import { ExportButton } from "@/components/admin/reports/exportButton";
import { ReportFilters } from "@/components/admin/reports/reportFilters";
import { useChartData } from "@/hooks/useReport";

export function ReportSection({
  title,
  reportType,
  cinemaId,
  defaultOpen = false,
  showChannel = false,
  showGroupBy = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [channel, setChannel] = useState("all");
  const [groupBy, setGroupBy] = useState("day");
  const [chartType, setChart] = useState(null); // null = usa el del backend

  const { data, loading, error, refetch } = useChartData({
    cinemaId,
    reportType,
    from,
    to,
    groupBy,
    channel,
  });

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <span className="font-semibold text-foreground text-sm uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          <div className="flex flex-wrap items-end justify-between gap-3 pt-4">
            <ReportFilters
              from={from}
              to={to}
              channel={channel}
              groupBy={groupBy}
              chartType={chartType}
              onFromChange={setFrom}
              onToChange={setTo}
              onChannelChange={setChannel}
              onGroupByChange={setGroupBy}
              onChartTypeChange={setChart}
              onRefresh={refetch}
              loading={loading}
              showChannel={showChannel}
              showGroupBy={showGroupBy}
            />
            <ExportButton
              reportType={reportType}
              cinemaId={cinemaId}
              filters={{ from, to, channel }}
              disabled={loading}
            />
          </div>

          {error ? (
            <p className="text-sm text-rose-500 py-4">{error}</p>
          ) : (
            <ReportChart
              data={data}
              overrideType={chartType}
              loading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
}
