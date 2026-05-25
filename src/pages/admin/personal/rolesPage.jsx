import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Roles() {
  const navigate = useNavigate();

  const roles = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "GERENT_MANAGER" },
    { id: 3, name: "CASHIER" },
    { id: 4, name: "USHER" },
  ];

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
            <span className="font-medium text-gray-800">{role.name}</span>

            {/* Acciones */}
            <div className="flex justify-end gap-4">
              {/* EDITAR */}
              <button
                onClick={() =>
                  navigate(`/admin/personal/create-role?role=${role.name}`)
                }
                className="text-brand-primary hover:text-brand-primary/80 transition"
              >
                <Pencil className="w-5 h-5" />
              </button>

              {/* ELIMINAR */}
              <button className="text-red-500 hover:text-red-600 transition">
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
