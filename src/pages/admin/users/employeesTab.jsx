import TableEmployees from "../../../components/admin/users/TableEmployees";
import Button from "../../../components/ui/Button";
import { useState } from "react";

export default function EmployeesTab() {
  const [search, setSearch] = useState("");

  const employees = [
    {
      id: "001",
      nombre: "Pedro",
      apellido: "Pérez",
      correo: "pedro.perez@cineflix.com",
      cargo: "Operador",
      sucursal: "Sucursal Centro",
      activo: true,
    },
    {
      id: "002",
      nombre: "María",
      apellido: "Jiménez",
      correo: "maria.jimenez@cineflix.com",
      cargo: "Cajero",
      sucursal: "Sucursal Norte",
      activo: false,
    },
  ];

  const filtered = employees.filter((emp) => {
    const text = search.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(text) ||
      emp.apellido.toLowerCase().includes(text) ||
      emp.correo.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Consulta de EMPLEADOS</h2>

        <Button
          text="Agregar empleado"
          type="submit"
          className="text-lg font-montserrat font-semibold"
        />
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded mb-4 w-80"
      />

      <TableEmployees employees={filtered} />

    </div>
  );
}
