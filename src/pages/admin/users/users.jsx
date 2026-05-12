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
  const [search, setSearch] = useState("");

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

  // ⭐ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
        }),
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

  // ⭐ FILTRADO POR BÚSQUEDA
  const filteredUsers = users.filter((u) => {
    const fullName =
      `${u._People?.first_name || ""} ${u._People?.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ⭐ PAGINACIÓN
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      {/* ⭐ BARRA SUPERIOR */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de personal
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra el acceso de empleados al sistema
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar Empleado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 px-3 py-2 rounded-cineflix border border-gray-300 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />

          {/* BOTÓN */}
          <button
            onClick={() => setOpenModal(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            Añadir usuario
          </button>
        </div>
      </div>

      {/* TABLA */}
      <UsersTab
        users={paginatedUsers}
        onEdit={handleEditClick}
        onEditEmployee={handleEditEmployeeClick}
        onDelete={handleDeleteClick}
      />

      {/* ⭐ PAGINACIÓN */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">
            Mostrando{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{" "}
            de <span className="font-medium">{filteredUsers.length}</span>{" "}
            resultados
          </p>

          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-l-md disabled:opacity-50"
            >
              ◀
            </button>

            <div className="px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">
              Página {currentPage} de {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50"
            >
              ▶
            </button>
          </nav>
        </div>
      </div>

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
