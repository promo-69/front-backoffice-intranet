import { Pencil, Trash2, UserCog } from "lucide-react";

export default function EmployeeTable({ employees, onEdit, onDelete }) {
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
              Documento
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Cargo
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Sucursal
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
          {employees.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="text-center py-6 text-gray-500 font-montserrat"
              >
                No hay empleados registrados.
              </td>
            </tr>
          )}

          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              {/* ⭐ NOMBRE */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-800">
                {emp.person?.first_name} {emp.person?.last_name}
              </td>

              {/* ⭐ DOCUMENTO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {emp.person?.document_number}
              </td>

              {/* ⭐ CARGO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {emp.jobPositionName || "—"}
              </td>

              {/* ⭐ SUCURSAL */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {emp.cinemaName || "—"}
              </td>

              {/* ⭐ ESTADO */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    emp.status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {emp.status === 1 ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/* ⭐ ACCIONES */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                {/* EDITAR */}
                <button
                  onClick={() => onEdit(emp)}
                  className="text-blue-500 hover:scale-110 transition-transform"
                  title="Editar empleado"
                >
                  <Pencil className="w-5 h-5" />
                </button>

                {/* ELIMINAR */}
                <button
                  onClick={() => onDelete(emp)}
                  className="text-red-500 hover:scale-110 transition-transform"
                  title="Eliminar empleado"
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
