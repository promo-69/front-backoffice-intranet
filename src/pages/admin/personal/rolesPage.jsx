import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoles } from "@/services/roles.service";

export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); 

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const skeletonRows = Array(3).fill(0); 

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#4B2E83]">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Rol</th>
            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">Acciones</th>
          </tr>
        </thead>

        {/* CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          
          {/* ⭐ ESTADO DE CARGA (SKELETON) */}
          {loading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="py-4 px-4 flex justify-end"><div className="h-5 bg-gray-200 rounded w-5"></div></td>
              </tr>
            ))}

          {/* ESTADO VACÍO */}
          {!loading && roles.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center py-6 text-gray-500 font-montserrat">
                No hay roles registrados.
              </td>
            </tr>
          )}

          {/* DATOS */}
          {!loading &&
            roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                  {role.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-end gap-3">
                  <button 
                    onClick={() => navigate(`/admin/personal/edit-role?roleId=${role.id}`)}
                    className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                    title="Editar rol"

                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}