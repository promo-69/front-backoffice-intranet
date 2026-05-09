import { Pencil, Trash2 } from "lucide-react";

export default function EmployeesTab({ search, employees, onDelete, onEdit }) {

  const filtered = employees.filter((emp) => {
    const text = search.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(text) ||
      emp.correo.toLowerCase().includes(text)
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
                <td className="py-4 px-4 font-bold text-slate-700">{emp.nombre}</td>
                <td className="py-4 px-4 text-gray-500 font-medium">{emp.correo}</td>
                <td className="py-4 px-4 text-gray-500">{emp.cargo}</td>
                <td className="py-4 px-4 text-gray-500">{emp.sucursal}</td>

                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    emp.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {emp.activo ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => onEdit(emp)} // <-- Ahora llama a la función de edición
                      className="text-brand-primary hover:scale-110 transition-transform"
                      title="Editar empleado"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

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

