import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Film,
  CalendarClock,
  Users,
  UserCog,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Ticket,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCinemas } from "@/services/cinema.service";
import { getMovies } from "@/services/movie.service";
import {
  getShowtimes,
  getShowtimesByCinema,
} from "@/services/showtime.service";
import { getEmployees } from "@/services/employees.service";
import { getUsers } from "@/services/users.service";
import { getMyInventory } from "@/services/inventory.service";
import { usePermission } from "@/hooks/usePermission";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

// ── Formateadores ─────────────────────────────────────────────────────────────
const fmtCurrency = (v) =>
  v != null
    ? `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
    : "—";
const fmtNumber = (v) => (v != null ? Number(v).toLocaleString("es-MX") : "—");

// ── Componentes base ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, loading, to }) {
  const inner = (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 ${to ? "cursor-pointer" : ""}`}
    >
      <div
        className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <Skeleton className="h-7 w-14 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-[#3E2186] leading-tight font-montserrat">
            {value ?? "—"}
          </p>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
          {label}
        </p>
      </div>
      {to && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-[#3E2186] mb-3 flex items-center gap-2">
      <span className="inline-block w-3 h-0.5 bg-[#d9982f] rounded" />
      {children}
    </h2>
  );
}

function ShowtimeRow({ showtime }) {
  const start = new Date(showtime.start_time);
  const now = new Date();
  const active = start <= now;
  const room = showtime.room?.name ?? showtime.roomName ?? "—";
  const movie = showtime.movie?.title ?? showtime.movieTitle ?? "—";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {movie}
          </p>
          <p className="text-xs text-muted-foreground">{room}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-xs font-semibold text-[#3E2186]">
          {start.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p
          className={`text-xs ${active ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}
        >
          {active ? "En curso" : "Próxima"}
        </p>
      </div>
    </div>
  );
}

function LowStockRow({ item }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-sm font-medium text-foreground truncate">
        {item.name}
      </p>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-xs text-rose-600 font-semibold">
          {item.stock} uds.
        </span>
        <span className="text-xs text-muted-foreground">
          / mín {item.minimum}
        </span>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, color }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
    >
      <div
        className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-foreground leading-tight">
        {label}
      </span>
    </Link>
  );
}

// ── Vista Superadmin ──────────────────────────────────────────────────────────

function SuperAdminDashboard({ cinemas, loading }) {
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!cinemas?.length) return;
    setSelectedCinema(cinemas[0]);
  }, [cinemas]);

  useEffect(() => {
    if (!selectedCinema?.id) return;
    setLoadingDetail(true);
    const today = new Date();
    getShowtimesByCinema({
      cinemaId: selectedCinema.id,
      startDate: today.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
      onlyFuture: false,
      limit: 8,
    })
      .then((r) => setShowtimes(r.showtimes ?? []))
      .catch(() => setShowtimes([]))
      .finally(() => setLoadingDetail(false));
  }, [selectedCinema]);

  return (
    <div className="space-y-8">
      {/* KPIs globales */}
      <div>
        <SectionTitle>Resumen global</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Building2}
            label="Sucursales"
            value={fmtNumber(cinemas?.length)}
            color="bg-[#3E2186]"
            loading={loading}
            to="/admin/sucursales"
          />
          <StatCard
            icon={Film}
            label="Películas"
            value={null}
            color="bg-violet-600"
            loading={loading}
            to="/admin/billboard"
          />
          <StatCard
            icon={CalendarClock}
            label="Funciones"
            value={null}
            color="bg-amber-500"
            loading={loading}
          />
          <StatCard
            icon={Users}
            label="Empleados"
            value={null}
            color="bg-emerald-500"
            loading={loading}
            to="/admin/personal"
          />
          <StatCard
            icon={UserCog}
            label="Usuarios"
            value={null}
            color="bg-rose-500"
            loading={loading}
            to="/admin/personal"
          />
        </div>
      </div>

      {/* Selector de sucursal + funciones del día */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Funciones de hoy</SectionTitle>
            <select
              value={selectedCinema?.id ?? ""}
              onChange={(e) =>
                setSelectedCinema(
                  cinemas.find((c) => c.id === Number(e.target.value)),
                )
              }
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {cinemas?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {loadingDetail ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))
          ) : showtimes.length ? (
            showtimes.map((s, i) => (
              <ShowtimeRow key={s.id ?? i} showtime={s} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin funciones para hoy en esta sucursal
            </p>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <SectionTitle>Accesos rápidos</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink
              to="/admin/reports"
              icon={TrendingUp}
              label="Reportes"
              color="bg-[#3E2186]"
            />
            <QuickLink
              to="/admin/billboard"
              icon={Film}
              label="Cartelera"
              color="bg-violet-600"
            />
            <QuickLink
              to="/admin/catalogo"
              icon={Ticket}
              label="Funciones"
              color="bg-amber-500"
            />
            <QuickLink
              to="/admin/personal"
              icon={Users}
              label="Empleados"
              color="bg-emerald-500"
            />
            <QuickLink
              to="/admin/inventario"
              icon={Package}
              label="Inventario"
              color="bg-teal-600"
            />
            <QuickLink
              to="/admin/sucursales"
              icon={Building2}
              label="Sucursales"
              color="bg-sky-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vista Empleado / Gerente de sucursal ──────────────────────────────────────

function BranchDashboard({ user }) {
  const cinemaId = user?.cinemaId;
  const [showtimes, setShowtimes] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cinemaId) return;
    setLoading(true);
    const today = new Date();
    Promise.all([
      getShowtimesByCinema({
        cinemaId,
        startDate: today.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10),
        onlyFuture: false,
        limit: 8,
      })
        .then((r) => r.showtimes ?? [])
        .catch(() => []),
      getMyInventory({ cinemaId, page: 1, limit: 50 })
        .then((r) => {
          const items = Array.isArray(r.data) ? r.data : (r.data?.rows ?? []);
          return items
            .filter(
              (i) =>
                (i.stock ?? i.quantity ?? 0) <=
                (i.minimum_stock ?? i.minimumStock ?? 5),
            )
            .slice(0, 6)
            .map((i) => ({
              name: i.name,
              stock: i.stock ?? i.quantity,
              minimum: i.minimum_stock ?? i.minimumStock ?? 5,
            }));
        })
        .catch(() => []),
    ])
      .then(([s, ls]) => {
        setShowtimes(s);
        setLowStock(ls);
      })
      .finally(() => setLoading(false));
  }, [cinemaId]);

  return (
    <div className="space-y-8">
      {/* Encabezado de bienvenida */}
      <div className="bg-gradient-to-r from-[#3E2186] to-[#5B34B3] rounded-xl p-6 text-white">
        <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-1">
          Bienvenido
        </p>
        <h1 className="text-2xl font-bold font-montserrat">
          {user?.name ?? "Administrador"}
        </h1>
        <p className="text-sm text-white/60 mt-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Funciones de hoy + alertas de stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <SectionTitle>Funciones de hoy</SectionTitle>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))
          ) : showtimes.length ? (
            showtimes.map((s, i) => (
              <ShowtimeRow key={s.id ?? i} showtime={s} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin funciones para hoy
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Alertas de stock bajo</SectionTitle>
            {lowStock.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStock.length} productos
              </span>
            )}
          </div>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full mb-2" />
            ))
          ) : lowStock.length ? (
            lowStock.map((item, i) => <LowStockRow key={i} item={item} />)
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin alertas de inventario
            </p>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <SectionTitle>Accesos rápidos</SectionTitle>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickLink
            to="/admin/reports"
            icon={TrendingUp}
            label="Reportes"
            color="bg-[#3E2186]"
          />
          <QuickLink
            to="/admin/billboard"
            icon={Film}
            label="Cartelera"
            color="bg-violet-600"
          />
          <QuickLink
            to="/admin/catalogo"
            icon={Ticket}
            label="Funciones"
            color="bg-amber-500"
          />
          <QuickLink
            to="/admin/personal"
            icon={Users}
            label="Empleados"
            color="bg-emerald-500"
          />
          <QuickLink
            to="/admin/inventario"
            icon={Package}
            label="Inventario"
            color="bg-teal-600"
          />
          <QuickLink
            to="/ticketOffice/dashboard"
            icon={UserCog}
            label="Mi caja"
            color="bg-sky-600"
          />
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isSuperAdmin } = usePermission();
  const { user } = useContext(AuthContext);
  const [cinemas, setCinemas] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([
      getCinemas()
        .then((r) => (Array.isArray(r.data) ? r.data : []))
        .catch(() => []),
      getMovies(1, 1)
        .then((r) => r.metadata?.total ?? r.data?.length ?? 0)
        .catch(() => 0),
      getShowtimes(1, 1)
        .then((r) => r.metadata?.total ?? 0)
        .catch(() => 0),
      getEmployees()
        .then((r) => r?.length ?? 0)
        .catch(() => 0),
      getUsers()
        .then((r) => r?.length ?? 0)
        .catch(() => 0),
    ])
      .then(([cms, movies, showtimes, employees, users]) => {
        setCinemas(cms);
        setCounts({ movies, showtimes, employees, users });
      })
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (isSuperAdmin) {
    const enrichedCinemas = cinemas; // ya tiene todos los campos
    return (
      <SuperAdminDashboard
        cinemas={enrichedCinemas}
        counts={counts}
        loading={loading}
      />
    );
  }

  return <BranchDashboard user={user} />;
}
