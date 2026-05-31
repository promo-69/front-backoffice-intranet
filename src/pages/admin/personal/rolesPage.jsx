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
    <div className="bg-white rounded-cineflix border border-gray-100 shadow-sm p-6">
      {/* ENCABEZADOS */}
      <div className="grid grid-cols-2 text-xs font-semibold text-gray-500 border-b pb-2">
        <span>ROL</span>
        <span className="text-right">ACCIONES</span>
      </div>

      {/* FILAS */}
      <div className="divide-y">
        {roles.map((role) => (
          <div
            key={role.id}
            className="grid grid-cols-2 py-3 text-sm items-center hover:bg-gray-50 transition-colors"
          >
            {/* Nombre del rol */}
            <span className="font-medium text-gray-800">{role.code}</span>

            {/* Acciones */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() =>
                  navigate(`/admin/personal/edit-role?roleId=${role.id}`)
                }
                className="text-brand-primary hover:text-brand-primary/80 transition"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
