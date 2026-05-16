import { Pencil, Trash2, UserCog } from "lucide-react";

export default function UsersTable({
  users,
  onEdit,
  onEditEmployee,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        {/* ⭐ ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Correo
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="text-center py-6 text-gray-500 font-montserrat"
              >
                No hay usuarios registrados.
              </td>
            </tr>
          )}

          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
              {/* ⭐ NOMBRE */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-800">
                {u._People?.first_name} {u._People?.last_name}
              </td>

              {/* ⭐ CORREO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {u.email}
              </td>

              {/* ⭐ ROL */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {u._Roles?.code || "SIN ROL"}
              </td>

              {/* ⭐ ESTADO */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.status === 1 ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/* ⭐ ACCIONES */}
              <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-3">
                {/* EDITAR USUARIO */}
                <button
                  onClick={() => onEdit(u)}
                  className="text-blue-500 hover:scale-110 transition-transform"
                  title="Editar usuario"
                >
                  <Pencil className="w-5 h-5" />
                </button>

                {/* EDITAR EMPLEADO */}
                <button
                  onClick={() => onEditEmployee(u)}
                  className="text-brand-gold hover:scale-110 transition-transform"
                  title="Editar empleado asociado"
                >
                  <UserCog className="w-5 h-5" />
                </button>

                {/* ELIMINAR */}
                <button
                  onClick={() => onDelete(u)}
                  className="text-red-500 hover:scale-110 transition-transform"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
