import { Pencil, Trash2, UserCog } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

export default function EmployeeTable({ employees, onEdit, onDelete, isLoading = false }) {
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Documento
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Cargo
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Sucursal
            </th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          {/* ⭐ ESTADO DE CARGA (SKELETON) */}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
                </td>
              </tr>
            ))}

          {/* ⭐ ESTADO VACÍO (Solo si NO está cargando) */}
          {!isLoading && employees.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="text-center py-6 text-gray-500 font-montserrat"
              >
                No hay empleados registrados.
              </td>
            </tr>
          )}

          {/* ⭐ ESTADO CON DATOS */}
          {!isLoading &&
            employees.map((emp) => {
              const firstName =
                emp.people?.first_name || emp.person?.first_name || "";
              const lastName =
                emp.people?.last_name || emp.person?.last_name || "";
              const documentNumber =
                emp.people?.document_number ||
                emp.person?.document_number ||
                "—";

              
              const firstPos = emp.employee?.positions?.[0] || {};
              const cargo =
                emp._User?._Roles?.code?.replace(/_/g, " ") ||
                firstPos?.job_position?.title ||
                "No asignado";
              const sucursal =
                emp._cinema_name || firstPos?.cinema?.name || "No asignada";

              return (
                <tr
                  key={emp.id || emp.employee?.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                    {firstName} {lastName}
                  </td>
                  <td className="py-4 px-4 text-left text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                    {documentNumber}
                  </td>
                  <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs capitalize">
                    {cargo.toLowerCase()}
                  </td>
                  <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                    {sucursal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center gap-3">
                    <DisableIfNoPermission permission={"CRUD:UPDATE:EMPLOYEES"} title="No tienes permiso para editar empleados">
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </DisableIfNoPermission>
                    <DisableIfNoPermission permission={"CRUD:DELETE:EMPLOYEES"} title="No tienes permiso para eliminar empleados">
                      <button
                        onClick={() => onDelete(emp)}
                        className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-400 hover:text-white transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </DisableIfNoPermission>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}