import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";
import  EditUserModal from "@/components/admin/users/EditUserModal";
import EditEmployeeModal from "@/components/admin/users/EditEmployeeModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import UsersTab from "@/pages/admin/users/usersTab";

import { useLoading } from "@/context/LoadingContext";
import { getUsers, deleteUser, getRoles } from "@/services/users.service";
import { getEmployeeById } from "@/services/employees.service";

export default function Users() {
  const { showLoader, hideLoader } = useLoading();

  const [users, setUsers] = useState([]);
  const [search] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);

  const [userToEdit, setUserToEdit] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchUsers = async () => {
  try {
    showLoader();

    // 1. Obtener usuarios
    const usersRaw = await getUsers();

    // 2. Obtener roles
    const roles = await getRoles();

    // 3. Cruzar usuarios con roles
    const usersWithEmployeeData = await Promise.all(
      usersRaw.map(async (u) => {
        let employee = null;

        try {
          if (u.employee) {
            employee = await getEmployeeById(u.employee);
          }
        } catch {
          employee = null;
        }

        // Buscar el rol por ID
        const roleObj = roles.find((r) => r.id === u.role);

        return {
          ...u,
          employeeData: employee,
          roleName: roleObj?.name || "Sin rol",
        };
      })
    );

    setUsers(usersWithEmployeeData);
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    setUsers([]);
  } finally {
    hideLoader();
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = () => {
    fetchUsers();
    setSuccessTitle("Usuario Registrado");
    setSuccessMessage("El usuario ha sido registrado exitosamente.");
    setIsSuccessOpen(true);
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setEmployeeToEdit(employee);
    setIsEditEmployeeOpen(true);
  };

  const handleDeleteClick = (user) => {
    setItemToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteUser(itemToDelete.id);

      setSuccessTitle("Usuario Eliminado");
      setSuccessMessage(`El usuario ha sido eliminado correctamente.`);
      setIsSuccessOpen(true);

      fetchUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      hideLoader();
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de personal
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra el acceso de empleados al sistema
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
          Añadir usuario
        </button>
      </div>

      <UsersTab
        search={search}
        users={users}
        onEdit={handleEditClick}
        onEditEmployee={handleEditEmployeeClick}
        onDelete={handleDeleteClick}
      />

      {/* Modales */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.email}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />

      <RegisterUserModal
        open={openModal}
        onClose={(shouldRefresh) => {
          setOpenModal(false);
          if (shouldRefresh) refreshUsers();
        }}
      />

      <EditUserModal
        open={isEditModalOpen}
        onClose={(shouldRefresh) => {
          setIsEditModalOpen(false);
          if (shouldRefresh) fetchUsers();
        }}
        user={userToEdit}
      />

      <EditEmployeeModal
        open={isEditEmployeeOpen}
        onClose={(shouldRefresh) => {
          setIsEditEmployeeOpen(false);
          if (shouldRefresh) fetchUsers();
        }}
        employee={employeeToEdit}
      />
    </div>
  );
}
