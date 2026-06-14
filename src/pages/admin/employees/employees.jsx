import { useState, useEffect } from "react";

import EmployeeTable from "@/pages/admin/employees/employeeTable";
import RegisterEmployeeModal from "@/components/admin/employees/RegisterEmployeeModal";
import EditEmployeeModal from "@/components/admin/employees/EditEmployeeModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import { getEmployees, deleteEmployee } from "@/services/employees.service";

export default function Employees({ search }) {
  // ESTADO LOCAL DE CARGA
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchEmployees = async () => {
    try {
      setLoading(true); // Activamos carga local
      const employeesRaw = await getEmployees();
      setEmployees(employeesRaw);

    } catch (error) {
      console.error("Error cargando empleados:", error);
      setEmployees([]);
    } finally {
      setLoading(false); // Desactivamos carga local
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

  const filteredEmployees = employees.filter((e) => {
    const fullName =
      `${e.people?.first_name || ""} ${e.people?.last_name || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (employee) => {
    setEmployeeToEdit(employee);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (employee) => {
    setItemToDelete(employee);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true); // Mostramos el esqueleto mientras eliminamos
      await deleteEmployee(itemToDelete.id);

      setSuccessTitle("Empleado Eliminado");
      setSuccessMessage(`El empleado ha sido eliminado correctamente.`);
      setIsSuccessOpen(true);

      fetchEmployees();
    } catch (error) {
      console.error("Error eliminando empleado:", error);
      setLoading(false);
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* TABLA CON PROPIEDAD LOADING */}
      <EmployeeTable
        employees={paginatedEmployees}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isLoading={loading} 
      />

      {/* PAGINACIÓN (solo si no estamos cargando) */}
      {!loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
           <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
             <p className="text-sm text-gray-700">
               Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length} resultados
             </p>
             <nav className="inline-flex -space-x-px rounded-md shadow-sm">
               <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-l-md disabled:opacity-50">◀</button>
               <div className="px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">Página {currentPage} de {totalPages || 1}</div>
               <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50">▶</button>
             </nav>
           </div>
        </div>
      )}

      {/* MODALES */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`${itemToDelete?.people?.first_name} ${itemToDelete?.people?.last_name}`}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />

      <RegisterEmployeeModal
        open={isRegisterOpen}
        onClose={(shouldRefresh) => {
          setIsRegisterOpen(false);
          if (shouldRefresh) refreshEmployees();
        }}
      />

      <EditEmployeeModal
        open={isEditOpen}
        onClose={(shouldRefresh) => {
          setIsEditOpen(false);
          if (shouldRefresh) fetchEmployees();
        }}
        employee={employeeToEdit}
      />
    </div>
  );
}