import { useState } from "react";
import { Plus } from "lucide-react";
import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";
import { EditUserModal } from "@/components/admin/users/EditUserModal";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import EmployeesTab from "./employeesTab";
import ClientsTab from "./clientsTab";

export default function Users() {
  const [activeTab, setActiveTab] = useState("employees");
  const [openModal, setOpenModal] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false); 

  const [search, setSearch] = useState("");
  
  const [employees, setEmployees] = useState([
    { id: 1, nombre: "Pedro Perez", correo: "pedro.perez@cineflix.com", cargo: "Operador", sucursal: "Sucursal Centro", activo: true },
    { id: 2, nombre: "María Jiménez", correo: "maria.jimenez@cineflix.com", cargo: "Cajero", sucursal: "Sucursal Norte", activo: false },
  ]);

  // Handlers
  const handleEditClick = (employee) => {
    setUserToEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (employee) => {
    setItemToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setEmployees(prev => prev.filter(emp => emp.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de acciones superior */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div >
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestion de personal
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra el acceso de cajeros y operadores por sucursal
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar Empleado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 rounded-cineflix border border-gray-300 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />

          <button
            onClick={() => setOpenModal(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-2 border-purple-400/30 font-montserrat"
          >
            <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />
            Añadir empleado
          </button>
        </div>
      </div>

      {/* Mini menú de pestañas */}
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
            activeTab === "employees"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("employees")}
        >
          Empleados
        </button>

        <button
          className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
            activeTab === "clients"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("clients")}
        >
          Clientes
        </button>
      </div>

      {/* Contenido */}
      {activeTab === "employees" && (
        <EmployeesTab 
          search={search} 
          employees={employees} 
          onDelete={handleDeleteClick} 
          onEdit={handleEditClick} 
        />
      )}
      {activeTab === "clients" && <ClientsTab />}

      {/* MODALES DE ACCIÓN */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.nombre}
      />

      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => {
          setIsSuccessOpen(false);
          setItemToDelete(null);
        }}
        title="Empleado Eliminado"
        message={`El acceso de ${itemToDelete?.nombre} ha sido revocado correctamente.`}
      />

      {/* MODALES DE FORMULARIO */}
      <RegisterUserModal open={openModal} onClose={() => setOpenModal(false)} />
      
        <EditUserModal 
          open={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={userToEdit} 
        />
    </div>
  );
}