import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";
import { EditUserModal } from "@/components/admin/users/EditUserModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import EmployeesTab from "./employeesTab";
import ClientsTab from "./clientsTab";

import { useLoading } from "@/context/LoadingContext";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

export default function Users() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("employees");

  // MODALES
  const [openModal, setOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // BUSCADOR
  const [search, setSearch] = useState("");

  // EMPLEADOS
  const [employees, setEmployees] = useState([]);

  const { showLoader, hideLoader } = useLoading();

  // ⭐ GET REAL DE EMPLEADOS
  const fetchEmployees = async () => {
    showLoader();
    try {
      const res = await api.get("/employees"); // GET real
      setEmployees(res.data);
    } catch (error) {
      console.error("Error cargando empleados:", error);
    } finally {
      hideLoader();
    }
  };

  // ⭐ REFRESCAR TABLA DESPUÉS DE REGISTRAR
  const refreshEmployees = () => fetchEmployees();

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  /*useEffect(() => {
    fetchEmployees();
  }, []);*/

  // ⭐ EDITAR
  const handleEditClick = (employee) => {
    setUserToEdit(employee);
    setIsEditModalOpen(true);
  };

  // ⭐ ELIMINAR
  const handleDeleteClick = (employee) => {
    setItemToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/employees/${itemToDelete.id}`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== itemToDelete.id));
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Error eliminando empleado:", error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de personal
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
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            Añadir empleado
          </button>
        </div>
      </div>

      {/* TABS */}
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

      {/* CONTENIDO */}
      {activeTab === "employees" && (
        <EmployeesTab
          search={search}
          employees={employees}
          onDelete={handleDeleteClick}
          onEdit={handleEditClick}
        />
      )}

      {activeTab === "clients" && <ClientsTab />}

      {/* MODAL ELIMINAR */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.firstName}
      />

      {/* MODAL ÉXITO */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setItemToDelete(null);
        }}
        title="Empleado Eliminado"
        message={`El acceso de ${itemToDelete?.firstName} ha sido revocado correctamente.`}
      />

      {/* MODAL REGISTRO ⭐ AQUÍ VA */}
      <RegisterUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={refreshEmployees} // ⭐ REFRESCA TABLA
      />

      {/* MODAL EDICIÓN */}
      <EditUserModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userToEdit}
      />
    </div>
  );
}
