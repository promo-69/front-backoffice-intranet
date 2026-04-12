import TableEmployees from "../../../components/admin/users/TableEmployees";

export default function EmployeesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Consulta de empleados</h2>

        <button className="bg-[#D9982F] text-white px-4 py-2 rounded">
          + Agregar empleado
        </button>
      </div>
      <TableEmployees />
    </div>
  );
}
