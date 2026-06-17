import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, color, trend, loading }) {
  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <Skeleton className="h-7 w-20 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground leading-tight font-montserrat">
            {value ?? "—"}
          </p>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
          {label}
        </p>
        {trend !== undefined && !loading && (
          <div
            className={`flex items-center gap-1 text-xs mt-1 font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}
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
