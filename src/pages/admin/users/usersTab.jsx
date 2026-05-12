import { Pencil, Trash2 } from "lucide-react";

export default function UsersTab({ search, users, onDelete, onEdit }) {
  const safeUsers = Array.isArray(users) ? users : [];

  const filtered = safeUsers.filter((u) => {
    const text = (search || "").toLowerCase();
    if (!text) return true;

    return (
      u.email?.toLowerCase().includes(text) ||
      u._People?.first_name?.toLowerCase().includes(text) ||
      u._People?.last_name?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b">
            <th className="py-4 px-4">Nombre</th>
            <th className="py-4 px-4">Correo</th>
            <th className="py-4 px-4">Rol</th>
            <th className="py-4 px-4">Estado</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-10 text-gray-400">
                No hay usuarios disponibles
              </td>
            </tr>
          ) : (
            filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                {/* NOMBRE */}
                <td className="py-4 px-4 font-bold">
                  {u._People?.first_name} {u._People?.last_name}
                </td>

                {/* CORREO */}
                <td className="py-4 px-4">{u.email}</td>

                {/* ROL */}
                <td className="py-4 px-4">{u._Roles?.code || "SIN ROL"}</td>

                {/* ESTADO */}
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status === 1 ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>

                {/* ACCIONES */}
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    {/* EDITAR */}
                    <button
                      onClick={() => onEdit(u)}
                      className="text-brand-primary hover:scale-110 transition-transform"
                      title="Editar usuario"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      onClick={() => onDelete(u)}
                      className="text-red-500 hover:scale-110 transition-transform"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
