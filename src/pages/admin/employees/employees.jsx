import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import EmployeeTable from "@/pages/admin/employees/employeeTable";
import RegisterEmployeeModal from "@/components/admin/employees/RegisterEmployeeModal";
import EditEmployeeModal from "@/components/admin/employees/EditEmployeeModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import { useLoading } from "@/context/LoadingContext";
import { getEmployees, deleteEmployee } from "@/services/employees.service";

export default function Employees() {
  const { showLoader, hideLoader } = useLoading();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ⭐ PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchEmployees = async () => {
    try {
      showLoader();
      const employeesRaw = await getEmployees();
      setEmployees(employeesRaw);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      setEmployees([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const refreshEmployees = () => {
    fetchEmployees();
    setSuccessTitle("Empleado Registrado");
    setSuccessMessage("El empleado ha sido registrado exitosamente.");
    setIsSuccessOpen(true);
  };

  // ⭐ FILTRADO
  const filteredEmployees = employees.filter((e) => {
    const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // ⭐ PAGINACIÓN
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (employee) => {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (employee) => {
    setItemToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteEmployee(itemToDelete.id);

      setSuccessTitle("Empleado Eliminado");
      setSuccessMessage(`El empleado ha sido eliminado correctamente.`);
      setIsSuccessOpen(true);

      fetchEmployees();
    } catch (error) {
      console.error("Error eliminando empleado:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      hideLoader();
    }
  };

  return (
    <div className="space-y-6">
      {/* ⭐ HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de Empleados
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra la información laboral del personal
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
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

          <button
            onClick={() => setOpenModal(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            Añadir empleado
          </button>
        </div>
      </div>

      {/* ⭐ TABLA */}
      <EmployeeTable
        employees={paginatedEmployees}
        onEdit={handleEditClick}
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
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
            </span>{" "}
            de <span className="font-medium">{filteredEmployees.length}</span>{" "}
            resultados
          </p>

          <nav className="inline-flex -space-x-px rounded-md shadow-sm">
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

      {/* ⭐ MODALES */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`${itemToDelete?.firstName} ${itemToDelete?.lastName}`}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />

      <RegisterEmployeeModal
        open={openModal}
        onClose={(shouldRefresh) => {
          setOpenModal(false);
          if (shouldRefresh) refreshEmployees();
        }}
      />

      <EditEmployeeModal
        open={isEditModalOpen}
        onClose={(shouldRefresh) => {
          setIsEditModalOpen(false);
          if (shouldRefresh) fetchEmployees();
        }}
        employee={employeeToEdit}
      />
    </div>
  );
}
