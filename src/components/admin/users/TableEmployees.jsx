export default function TableEmployees({ employees = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Apellidos</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Cargo</th>
            <th className="p-3">Sucursal</th>
            <th className="p-3">Editar</th>
            <th className="p-3">Desactivar</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-t">
              <td className="p-3">{emp.nombre}</td>
              <td className="p-3">{emp.apellido}</td>
              <td className="p-3">{emp.correo}</td>
              <td className="p-3">{emp.cargo}</td>
              <td className="p-3">{emp.sucursal}</td>

              {/* Botón editar */}
              <td className="p-3">
                <button className="text-blue-600 hover:underline">
                  Editar
                </button>
              </td>

              {/* Checkbox desactivar */}
              <td className="p-3">
                <input
                  type="checkbox"
                  defaultChecked={emp.activo}
                  onChange={() => console.log("toggle", emp.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
