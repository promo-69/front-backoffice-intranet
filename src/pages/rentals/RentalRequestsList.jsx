import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRentalRequests, getAdminRentalRequests } from "@/services/rentals.service";
import { usePermission } from "@/hooks/usePermission";

const STATUS_MAP = {
  1: { label: "Pendiente de Revisión", color: "bg-yellow-100 text-yellow-800" },
  2: { label: "Pendiente de Pago", color: "bg-blue-100 text-blue-800" },
  3: { label: "Pagada", color: "bg-green-100 text-green-800" },
  4: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  5: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
};

export default function RentalRequestsList() {
  const { isSuperAdmin } = usePermission();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchRequests() {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = isSuperAdmin
        ? await getAdminRentalRequests(params)
        : await getRentalRequests(params);
      setRequests(data.rows || data.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-VE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            Solicitudes de Alquiler
          </h3>
          <p className="text-xs text-muted-foreground">
            Gestiona las solicitudes de alquiler de salas
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([id, s]) => (
            <option key={id} value={id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-cineflix border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No hay solicitudes</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Evento</th>
                <th className="p-4">Sala</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Inicio</th>
                <th className="p-4">Fin</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Creada</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const st = STATUS_MAP[r.status?.id] || STATUS_MAP[1];
                return (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/rentals/${r.id}`)}
                  >
                    <td className="p-4 font-medium">{r.event_name}</td>
                    <td className="p-4">{r.room?.name || "—"}</td>
                    <td className="p-4">{r.customer?.people?.first_name} {r.customer?.people?.last_name}</td>
                    <td className="p-4">{formatDate(r.requested_start_time)}</td>
                    <td className="p-4">{formatDate(r.requested_end_time)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(r.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
