import { Pencil, Trash2, UserCog } from "lucide-react";

export default function EmployeeTable({ employees, onEdit, onDelete, isLoading = false }) {
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#4B2E83]">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ⭐ ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Nombre</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Documento</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Cargo</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Sucursal</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Estado</th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">Acciones</th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          
          {/* ⭐ ESTADO DE CARGA (SKELETON) */}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}

          {/* ⭐ ESTADO VACÍO (Solo si NO está cargando) */}
          {!isLoading && employees.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500 font-montserrat">
                No hay empleados registrados.
              </td>
            </tr>
          )}

          {/* ⭐ ESTADO CON DATOS */}
          {!isLoading &&
            employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                  {emp.person?.first_name} {emp.person?.last_name}
                </td>
                <td className="py-4 px-4 text-left text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                  {emp.person?.document_number}
                </td>
                <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                  {emp.jobPositionName || "—"}
                </td>
                <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                  {emp.cinemaName || "—"}
                </td>
                <td className="px-1 py-4 text-left whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      emp.status === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center gap-3">
                  <button 
                      onClick={() => onEdit(emp)}
                      className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDelete(emp)}
                      className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-50 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}