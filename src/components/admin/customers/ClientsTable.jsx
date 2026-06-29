import { Pencil } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

const LEVEL_COLORS = {
  Bronce: "bg-amber-100 text-amber-700 border-amber-200",
  Plata: "bg-slate-100 text-slate-600 border-slate-200",
  Oro: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Platino: "bg-sky-100 text-sky-700 border-sky-200",
  Diamante: "bg-violet-100 text-violet-700 border-violet-200",
};

function LevelBadge({ level }) {
  const color =
    LEVEL_COLORS[level] ?? "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}
    >
      {level ?? "—"}
    </span>
  );
}

export default function ClientsTable({ clients, isLoading = false, onEdit }) {
  const skeletonRows = Array(6).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Documento
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Correo
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nivel
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
              Puntos
            </th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#4B2E83]/40">
          {/* SKELETON */}
          {isLoading &&
            skeletonRows.map((_, i) => (
              <tr key={`sk-${i}`} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 bg-gray-200 rounded w-14" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-10 ml-auto" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-7 bg-gray-200 rounded w-8 mx-auto" />
                </td>
              </tr>
            ))}

          {/* VACÍO */}
          {!isLoading && clients.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="text-center py-8 text-gray-500 font-montserrat text-sm"
              >
                No hay clientes registrados.
              </td>
            </tr>
          )}

          {/* FILAS */}
          {!isLoading &&
            clients.map((c) => (
              <tr
                key={c.customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 font-bold text-slate-700 text-xs">
                  {c.person.first_name} {c.person.last_name}
                </td>
                <td className="py-4 px-4 text-gray-500 text-xs">
                  {c.person.document_number}
                </td>
                <td className="py-4 px-4 text-gray-500 text-xs">
                  {c.person.phone_number ?? "—"}
                </td>
                <td className="py-4 px-4 text-gray-500 text-xs truncate max-w-[160px]">
                  {c.person.personal_email ?? "—"}
                </td>
                <td className="py-4 px-4">
                  <LevelBadge level={c.customer.loyalty?.level_name} />
                </td>
                <td className="py-4 px-4 text-right text-gray-500 text-xs font-semibold">
                  {c.customer.level_progress_points ?? 0}
                </td>
                <td className="py-4 px-4 text-center">
                  <DisableIfNoPermission
                    permission="CRUD:UPDATE:CUSTOMERS"
                    title="No tienes permiso para editar clientes"
                  >
                    <button
                      onClick={() => onEdit(c)}
                      className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </DisableIfNoPermission>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
