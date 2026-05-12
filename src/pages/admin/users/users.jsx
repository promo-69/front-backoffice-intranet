import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";
import { EditUserModal } from "@/components/admin/users/EditUserModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import UsersTab from "./usersTab";

import { useLoading } from "@/context/LoadingContext";
import { getUsers, deleteUser } from "@/services/users.service";

export default function Users() {
  const { showLoader, hideLoader } = useLoading();

  const [users, setUsers] = useState([]);
  const [search] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchUsers = async () => {
    try {
      showLoader();
      const data = await getUsers();
      setUsers(data.data);
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
      
      {/* Barra de acciones superior */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div >
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
        onDelete={handleDeleteClick}
        onEdit={handleEditClick}
      />

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
    </div>
  );
}
