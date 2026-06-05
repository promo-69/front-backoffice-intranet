import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoles } from "@/services/roles.service";

export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  const loadRoles = async () => {
    try {
      const data = await getRoles(); 
      setRoles(data);
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#4B2E83]">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Rol
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>

        {/* CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          {roles.length === 0 && (
            <tr>
              <td
                colSpan="2"
                className="text-center py-6 text-gray-500 font-montserrat"
              >
                No hay roles registrados.
              </td>
            </tr>
          )}

          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
              {/* NOMBRE DEL ROL */}
              <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                {role.code}
              </td>

              {/* ACCIONES */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-end gap-3">
                <button
                  onClick={() =>
                    navigate(`/admin/personal/edit-role?roleId=${role.id}`)
                  }
                  className="text-blue-500 hover:scale-110 transition-transform"
                  title="Editar rol"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}