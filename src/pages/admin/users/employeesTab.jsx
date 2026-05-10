import { Pencil, Trash2 } from "lucide-react";

export default function EmployeesTab({ search, employees, onDelete, onEdit }) {
  const filtered = employees.filter((emp) => {
    const text = search.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(text) ||
      emp.lastName.toLowerCase().includes(text) ||
      emp.email.toLowerCase().includes(text)
    );
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
              <th className="py-4 px-4">Nombre completo</th>
              <th className="py-4 px-4">Correo</th>
              <th className="py-4 px-4">Cargo</th>
              <th className="py-4 px-4">Sucursal</th>
              <th className="py-4 px-4 text-center">Estado</th>
              <th className="py-4 px-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50/50 transition-colors font-montserrat"
              >
                <td className="py-4 px-4 font-bold text-slate-700">
                  {emp.firstName} {emp.lastName}
                </td>
                <td className="py-4 px-4 text-gray-500 font-medium">
                  {emp.email}
                </td>
                <td className="py-4 px-4 text-gray-500">
                  {emp.jobPosition || emp.jobPosition}
                </td>
                <td className="py-4 px-4 text-gray-500">
                  {emp.cinema || emp.cinema}
                </td>

                {/* ⭐ Estado */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      emp.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status === 1 ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>

                {/* ⭐ Acciones */}
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    {/* EDITAR */}
                    <button
                      onClick={() => onEdit(emp)}
                      className="text-brand-primary hover:scale-110 transition-transform"
                      title="Editar empleado"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      onClick={() => onDelete(emp)}
                      className="text-red-500 hover:scale-110 transition-transform"
                      title="Eliminar empleado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
