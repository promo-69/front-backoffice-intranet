import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Package,
  Users,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { KpiCard } from "@/components/admin/reports/kpiCard";
import { ReportChart } from "@/components/admin/reports/reportChart";
import { DataTableView } from "@/components/admin/reports/dataTableView";
import { ReportSection } from "@/components/admin/reports/reportSection";
import { ReportFilters } from "@/components/admin/reports/reportFilters";
import { ExportButton } from "@/components/admin/reports/exportButton";
import { LiveOccupancyPanel } from "@/components/admin/reports/liveOccupancyPanel";
import { useDashboard } from "@/hooks/useReport";
import { usePermission } from "@/hooks/usePermission";
import { getCinemas } from "@/services/cinema.service";
import { Skeleton } from "@/components/ui/skeleton";
import CinemaSelector from "@/components/admin/inventory/CinemaSelector";

// ── Formateadores ─────────────────────────────────────────────────────────────

const fmt = {
  currency: (v) =>
    v != null
      ? `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
      : "—",
  number: (v) => (v != null ? Number(v).toLocaleString("es-MX") : "—"),
  pct: (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—"),
};

// ── Sub-vistas según nivel de acceso ─────────────────────────────────────────

/**
 * Vista superadmin: selector de sucursal + todos los reportes
 */
function SuperAdminView() {
  const [cinemas, setCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState(); // undefined por defecto
  const [cinemasLoading, setCinemasLoading] = useState(true);

  useEffect(() => {
    setCinemasLoading(true);
    getCinemas()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        setCinemas(list);
        if (list.length) setCinemaId(list[0].id); // seleccionar el primero por defecto
      })
      .catch(() => {})
      .finally(() => setCinemasLoading(false));
  }, []);

  if (cinemasLoading) {
    return <Skeleton className="w-full h-48" />;
  }

  return (
    <SuperAdminContent
      cinemas={cinemas}
      cinemaId={cinemaId}
      setCinemaId={setCinemaId}
    />
  );
}

function SuperAdminContent({ cinemas, cinemaId, setCinemaId }) {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState("day");
  const [chartType, setChartType] = useState(null);

  const { data, loading, refetch } = useDashboard({ cinemaId, from, to });
  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      {/* Controles globales */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Selector de sucursal */}
          <CinemaSelector
            cinemas={cinemas}
            value={cinemaId ?? ""}
            onChange={(id) => setCinemaId(id ? Number(id) : cinemas[0]?.id)}
            showAll={false}
          />

          <ReportFilters
            from={from}
            to={to}
            groupBy={groupBy}
            chartType={chartType}
            onFromChange={setFrom}
            onToChange={setTo}
            onGroupByChange={setGroupBy}
            onChartTypeChange={setChartType}
            onRefresh={refetch}
            loading={loading}
            showChannel={false}
            showGroupBy={true}
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Ingresos totales"
          value={fmt.currency(kpis?.total_revenue)}
          color="bg-primary"
          loading={loading}
        />
        <KpiCard
          icon={ShoppingCart}
          label="Órdenes"
          value={fmt.number(kpis?.total_orders)}
          color="bg-violet-600"
          loading={loading}
        />
        <KpiCard
          icon={Ticket}
          label="Boletos vendidos"
          value={fmt.number(kpis?.total_tickets)}
          color="bg-accent"
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Ingreso neto"
          value={fmt.currency(kpis?.net_revenue)}
          color="bg-emerald-600"
          loading={loading}
        />
        <KpiCard
          icon={Users}
          label="Puntos de lealtad"
          value={fmt.number(kpis?.total_loyalty_points)}
          color="bg-sky-600"
          loading={loading}
        />
        <KpiCard
          icon={Building2}
          label="Ocupación promedio"
          value={fmt.pct(kpis?.avg_occupancy_pct)}
          color="bg-amber-500"
          loading={loading}
        />
        <KpiCard
          icon={Package}
          label="Rentas activas"
          value={fmt.number(kpis?.active_rentals)}
          color="bg-teal-600"
          loading={loading}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas de stock"
          value={fmt.number(kpis?.low_stock_alerts)}
          color="bg-rose-500"
          loading={loading}
        />
      </div>

      {/* Gráfico principal (serie temporal) + ocupación en vivo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Ingresos y boletos
            </h3>
            <ExportButton
              reportType="sales"
              cinemaId={cinemaId}
              filters={{ from, to }}
              disabled={loading}
            />
          </div>
          {loading ? (
            <Skeleton className="w-full h-72" />
          ) : chartType === "table" ? (
            <DataTableView
              data={{ datasets: data?.daily_series ?? [] }}
              reportType="sales"
              filters={{ from, to }}
              cinemaId={cinemaId}
            />
          ) : (
            <ReportChart
              data={{
                type: overrideOrDefault(chartType, "line"),
                period: data?.period,
                datasets: data?.daily_series ?? [],
              }}
              overrideType={chartType}
              height={288}
            />
          )}
        </div>
        <LiveOccupancyPanel cinemaId={cinemaId} />
      </div>

      {/* Top películas — HU-47 */}
      <TopMoviesTable movies={data?.top_movies} loading={loading} />

      {/* Reportes individuales colapsables */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reportes por módulo
        </h2>
        <ReportSection
          title="Ventas"
          reportType="sales"
          cinemaId={cinemaId}
          showChannel
          defaultOpen
        />
        <ReportSection
          title="Películas"
          reportType="movies"
          cinemaId={cinemaId}
        />
        <ReportSection
          title="Eventos"
          reportType="events"
          cinemaId={cinemaId}
        />
        <ReportSection
          title="Inventario"
          reportType="inventory"
          cinemaId={cinemaId}
          showGroupBy={false}
        />
        <ReportSection
          title="Funciones"
          reportType="showtimes"
          cinemaId={cinemaId}
        />
        <ReportSection
          title="Alquileres"
          reportType="rentals"
          cinemaId={cinemaId}
          showGroupBy={false}
        />
      </div>
    </div>
  );
}

// helper para no romper si chartType es null
function overrideOrDefault(override, fallback) {
  return override || fallback;
}

/**
 * Vista gerente de sucursal: sin selector de sucursal (cinemaId viene del JWT)
 */
function ManagerView() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState("day");
  const [chartType, setChart] = useState(null);

  const { data, loading, refetch } = useDashboard({ from, to });
  // El backend deriva la sucursal del JWT; aquí solo se usa para los paneles.
  const cinemaId = data?.cinema_id;
  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ReportFilters
          from={from}
          to={to}
          groupBy={groupBy}
          chartType={chartType}
          onFromChange={setFrom}
          onToChange={setTo}
          onGroupByChange={setGroupBy}
          onChartTypeChange={setChart}
          onRefresh={refetch}
          loading={loading}
          showChannel={false}
          showGroupBy={true}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Ingresos totales"
          value={fmt.currency(kpis?.total_revenue)}
          color="bg-primary"
          loading={loading}
        />
        <KpiCard
          icon={ShoppingCart}
          label="Órdenes"
          value={fmt.number(kpis?.total_orders)}
          color="bg-violet-600"
          loading={loading}
        />
        <KpiCard
          icon={Ticket}
          label="Boletos vendidos"
          value={fmt.number(kpis?.total_tickets)}
          color="bg-accent"
          loading={loading}
        />
        <KpiCard
          icon={Building2}
          label="Ocupación promedio"
          value={fmt.pct(kpis?.avg_occupancy_pct)}
          color="bg-amber-500"
          loading={loading}
        />
      </div>

      {/* Gráfico principal + ocupación */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Ingresos y boletos
            </h3>
            <ExportButton
              reportType="sales"
              filters={{ from, to }}
              disabled={loading}
            />
          </div>
          {loading ? (
            <Skeleton className="w-full h-72" />
          ) : chartType === "table" ? (
            <DataTableView
              data={{ datasets: data?.daily_series ?? [] }}
              reportType="sales"
              filters={{ from, to }}
              cinemaId={cinemaId}
            />
          ) : (
            <ReportChart
              data={{
                type: overrideOrDefault(chartType, "line"),
                period: data?.period,
                datasets: data?.daily_series ?? [],
              }}
              overrideType={chartType}
              height={288}
            />
          )}
        </div>
        {/* cinemaId: undefined aquí — el backend lo extrae del JWT */}
        <LiveOccupancyPanel cinemaId={data?.cinema_id} />
      </div>

      <TopMoviesTable movies={data?.top_movies} loading={loading} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reportes por módulo
        </h2>
        <ReportSection
          title="Ventas"
          reportType="sales"
          showChannel
          defaultOpen
        />
        <ReportSection title="Películas" reportType="movies" />
        <ReportSection
          title="Inventario"
          reportType="inventory"
          showGroupBy={false}
        />
        <ReportSection title="Funciones" reportType="showtimes" />
      </div>
    </div>
  );
}

/**
 * Vista empleado / cierre de caja
 */
function CashierView() {
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ReportFilters
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onRefresh={() => {}}
          showChannel={false}
          showGroupBy={false}
          showChartType={false}
        />
        <ExportButton reportType="cashier" filters={{ from, to }} />
      </div>

      <ReportSection
        title="Reporte de Caja"
        reportType="cashier"
        defaultOpen
        showGroupBy={false}
        showChannel={false}
      />
    </div>
  );
}

// ── Tabla top películas — HU-47 ───────────────────────────────────────────────

function TopMoviesTable({ movies = [], loading }) {
  if (loading) return <Skeleton className="w-full h-40" />;
  if (!movies?.length) return null;

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
          Top películas — período
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Película
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Boletos
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingresos
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ocupación
              </th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m, i) => (
              <tr
                key={m.id ?? i}
                className="border-t border-border hover:bg-secondary/20 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-foreground">
                  {m.title}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {fmt.number(m.total_tickets_sold)}
                </td>
                <td className="px-5 py-3 text-right font-medium text-foreground">
                  {fmt.currency(m.total_revenue)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      m.avg_occupancy_pct >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : m.avg_occupancy_pct >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {fmt.pct(m.avg_occupancy_pct)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal con lógica de rol ───────────────────────────────────

export default function ReportsDashboard() {
  const { isSuperAdmin, can } = usePermission();

  if (isSuperAdmin || can("CRUD:READ:REPORTS-ALL")) {
    return <SuperAdminView />;
  }

  if (can("CRUD:READ:REPORTS-DASHBOARD")) {
    return <ManagerView />;
  }

  if (can("CRUD:READ:REPORTS-CASHIER")) {
    return <CashierView />;
  }

  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      No tienes permisos para ver reportes.
    </div>
  );
}
