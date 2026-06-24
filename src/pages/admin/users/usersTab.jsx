import { Pencil, Trash2, UserCog } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

export default function UsersTable({
  users,
  onEdit,
  onEditEmployee,
  onDelete,
  isLoading = false, 
}) {

  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ⭐ ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Nombre</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Correo</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Rol</th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">Acciones</th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          
          {/* ⭐ 3. ESTADO DE CARGA*/}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="py-4 px-8"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}

          {/* ⭐ ESTADO VACÍO */}
          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500 font-montserrat">
                No hay usuarios registrados.
              </td>
            </tr>
          )}

          {/* ⭐ ESTADO CON DATOS */}
          {!isLoading &&
            users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-bold text-gray-700 max-w-32 truncate whitespace-nowrap text-xs">
                  {u._People?.first_name} {u._People?.last_name}
                </td>
                <td className="py-4 px-4 text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                  {u.email}
                </td>
                <td className="py-4 px-4 text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                  {u._Roles?.code || "SIN ROL"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center flex justify-center gap-3">
                  <DisableIfNoPermission permission={"CRUD:UPDATE:USERS"} title="No tienes permiso para editar usuarios">
                    <button 
                      onClick={() => onEdit(u)}
                      className="p-2 bg-white border border-slate-350 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </DisableIfNoPermission>
                  <DisableIfNoPermission permission={"CRUD:UPDATE:EMPLOYEES"} title="No tienes permiso para editar empleados">
                    <button 
                      onClick={() => onEditEmployee(u)}
                      className="p-2 bg-white border border-slate-350 text-brand-gold rounded-lg shadow-sm hover:bg-brand-gold hover:text-white transition-all"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                    </button>
                  </DisableIfNoPermission>
                  <DisableIfNoPermission permission={"CRUD:DELETE:USERS"} title="No tienes permiso para eliminar usuarios">
                    <button 
                      onClick={() => onDelete(u)}
                      className="p-2 bg-white border border-slate-350 text-red-500 rounded-lg shadow-sm hover:bg-red-400 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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