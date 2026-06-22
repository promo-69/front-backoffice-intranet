import { Check, Clock, Pencil, Trash2 } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

const CinemaTable = ({
  data,
  onEdit,
  onDelete,
  onSelectBranch,
  selectedId,
  isLoading = false, // ⭐ Nueva propiedad
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const skeletonRows = Array(5).fill(0); // Cantidad de filas de carga

  
  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4 w-10"></th>
            <th className="py-4 px-4">Nombre</th>
            <th className="py-4 px-4">Dirección</th>
            <th className="py-4 px-4">Teléfono</th>
            <th className="py-4 px-4 text-center">Horario</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {/* ESTADO DE CARGA */}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="w-3.5 h-3.5 bg-gray-200 rounded"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div></td>
                <td className="py-4 px-4 flex justify-center gap-3"><div className="h-5 bg-gray-200 rounded w-16"></div></td>
              </tr>
            ))}

          {/* ESTADO VACÍO */}
          {!isLoading && safeData.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400 font-montserrat">
                No hay sucursales disponibles
              </td>
            </tr>
          )}

          {/* DATOS REALES */}
          {!isLoading &&
            safeData.map((item) => {
              const isSelected = String(selectedId) === String(item.id);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectBranch(isSelected ? null : item.id)}
                  className={`
                    transition-colors cursor-pointer group font-montserrat
                    hover:bg-brand-primary/10
                    ${isSelected ? "bg-brand-primary/20" : "bg-transparent"}
                  `}
                >
                  <td className="py-4 px-4">
                    <div
                      className={`
                        w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? "bg-brand-primary border-brand-primary" : "border-gray-400 bg-transparent group-hover:border-brand-primary/50"}
                      `}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-brand-gold" strokeWidth={4} />}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold max-w-32 text-slate-700">{item.name}</td>
                  <td className="py-4 px-4 text-gray-500 max-w-32 truncate">{item.address}</td>
                  <td className="py-4 px-4 text-gray-500 max-w-32 truncate whitespace-nowrap text-xs font-medium">{item.phone}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 font-medium">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>{item.opening_time}</span>
                      <span className="text-brand-primary">-</span>
                      <span>{item.closing_time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-3">
                      <DisableIfNoPermission permission={"CRUD:UPDATE:CINEMAS"} title="No tienes permiso para editar sucursales">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                          className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </DisableIfNoPermission>
                      <DisableIfNoPermission permission={"CRUD:DELETE:CINEMAS"} title="No tienes permiso para eliminar sucursales">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                          className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-400 hover:text-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </DisableIfNoPermission>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default CinemaTable;