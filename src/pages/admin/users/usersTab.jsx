import { Pencil, Trash2, UserCog } from "lucide-react";

export default function UsersTab({ users, onEdit, onEditEmployee, onDelete }) {
  return (
    <div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Cargo</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50 transition">
              <td>
                {u._People.first_name} {u._People.last_name}
              </td>
              <td>{u.email}</td>
              <td>{u.roleCode}</td>
              <td>{u.employeeData?.jobPosition || "Sin cargo"}</td>
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
                    onClick={() => onEditEmployee(u.employeeData)}
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
