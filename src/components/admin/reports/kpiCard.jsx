import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({
  icon: Icon,
  label,
  value,
  color = "bg-[#231640]",
  trend,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div
        className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <Skeleton className="h-7 w-20 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-[#231640] leading-tight font-montserrat">
            {value ?? "—"}
          </p>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-0.5">
          {label}
        </p>
        {trend !== undefined && !loading && (
          <div
            className={`flex items-center gap-1 text-xs mt-1 font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
