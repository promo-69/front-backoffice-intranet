import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { EditUserModal } from "../../../components/admin/users/EditUserModal"; 

export default function EmployeesTab({ search }) {

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const employees = [
    { id: 1, nombre: "Pedro Perez", correo: "pedro.perez@cineflix.com", cargo: "Operador", sucursal: "Sucursal Centro", activo: true },
    { id: 2, nombre: "María Jiménez", correo: "maria.jimenez@cineflix.com", cargo: "Cajero", sucursal: "Sucursal Norte", activo: false },
  ];

  const filtered = employees.filter((emp) => {
    const text = search.toLowerCase();
    return emp.nombre.toLowerCase().includes(text) || emp.correo.toLowerCase().includes(text);
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
        <table className="w-full text-left text-xs">
          {/* ... thead igual ... */}
          <tbody className="divide-y divide-border">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors font-montserrat">
                <td className="py-4 px-4 font-bold text-slate-700">{emp.nombre}</td>
                <td className="py-4 px-4 text-gray-500">{emp.correo}</td>
                <td className="py-4 px-4 text-gray-500">{emp.cargo}</td>
                <td className="py-4 px-4 text-gray-500">{emp.sucursal}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${emp.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {emp.activo ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(emp)} 
                      className="text-brand-primary hover:scale-110 transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:scale-110 transition-transform">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Renderizamos el modal de edición */}
      <EditUserModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
}