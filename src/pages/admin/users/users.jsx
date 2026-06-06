import { useState, useEffect } from "react";

import UsersTab from "@/pages/admin/users/usersTab";
import RegisterUserModal from "@/components/admin/users/RegisterUserModal";
import EditUserModal from "@/components/admin/users/EditUserModal";
import EditEmployeeModal from "@/components/admin/employees/EditEmployeeModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import { getUsers, deleteUser } from "@/services/users.service";

export default function Users({ search }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);

  const [userToEdit, setUserToEdit] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRaw = await getUsers();
      setUsers(usersRaw);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setUsers([]);
    } finally {
      setLoading(false);
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

  const filteredUsers = users.filter((u) => {
    const fullName =
      `${u._People?.first_name || ""} ${u._People?.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setIsEditUserOpen(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setEmployeeToEdit(employee);
    setIsEditEmployeeOpen(true);
  };

  const handleDeleteClick = (user) => {
    setItemToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(itemToDelete.id);

      setSuccessTitle("Usuario Eliminado");
      setSuccessMessage(`El usuario ha sido eliminado correctamente.`);
      setIsSuccessOpen(true);

      fetchUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setLoading(false);
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <UsersTab
        users={paginatedUsers}
        onEdit={handleEditClick}
        onEditEmployee={handleEditEmployeeClick}
        onDelete={handleDeleteClick}
        isLoading={loading}
      />

      {!loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} resultados
            </p>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-l-md disabled:opacity-50">◀</button>
              <div className="px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">Página {currentPage} de {totalPages || 1}</div>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50">▶</button>
            </nav>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
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
        open={isRegisterOpen}
        onClose={(shouldRefresh) => {
          setIsRegisterOpen(false);
          if (shouldRefresh) refreshUsers();
        }}
      />
      <EditUserModal
        open={isEditUserOpen}
        onClose={(shouldRefresh) => {
          setIsEditUserOpen(false);
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