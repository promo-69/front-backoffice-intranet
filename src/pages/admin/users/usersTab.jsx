import { Pencil, Trash2, UserCog } from "lucide-react";

export default function UsersTab({ users, onEdit, onEditEmployee, onDelete }) {
  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="px-20 py-4 w-20">Nombre</th>
            <th className="px-4 py-4">Correo</th>
            <th className="px-4 py-4">Rol</th>
            <th className="px-4 py-4">Cargo</th>
            <th className="px-1 py-4">Estado</th>
            <th className="px-4 py-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50 transition">
              {/* NOMBRE */}
              <td className="py-4 px-18 font-bold text-slate-700">
                {u._People?.first_name || ""} {u._People?.last_name || ""}
              </td>

              {/* CORREO */}
              <td className="py-4 px-4">{u.email}</td>

              {/* ROL */}
              <td className="py-4 px-4">{u._Roles?.code || "Sin rol"}</td>

              {/* CARGO */}
              <td className="py-4 px-7">
                {u._Employee?.employee_code || "Sin cargo"}
              </td>

              {/* ESTADO */}
              <td>{u.status === 1 ? "Activo" : "Inactivo"}</td>
              
              {/* ⭐ ACCIONES */}
              <td className="py-4 px-4">
                <div className="flex justify-center gap-4">
                  {/* EDITAR USUARIO */}
                  <button
                    onClick={() => onEdit(u)}
                    className="text-brand-primary hover:scale-110 transition-transform"
                    title="Editar usuario"
                  >
                    <UserCog className="w-5 h-5" />
                  </button>

                  {/* EDITAR EMPLEADO */}
                  <button
                    onClick={() => onEditEmployee(u.employeeData || null)}
                    className="text-blue-500 hover:scale-110 transition-transform"
                    title="Editar empleado"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>

                  {/* ELIMINAR */}
                  <button
                    onClick={() => onDelete(u)}
                    className="text-red-500 hover:scale-110 transition-transform"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
