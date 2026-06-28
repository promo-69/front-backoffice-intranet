import { useState, useEffect } from "react";

import EmployeeTable from "@/pages/admin/employees/employeeTable";
import RegisterEmployeeModal from "@/components/admin/employees/RegisterEmployeeModal";
import EditUserModal from "@/components/admin/users/EditUserModal";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

import { getEmployees, deleteEmployee } from "@/services/employees.service";

const SUBTABS = [
  { id: "active", label: "Activos", dot: "bg-emerald-500" },
  { id: "inactive", label: "Desactivados", dot: "bg-red-400" },
];

export default function Employees({ search, cinemaId }) {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [subTab, setSubTab] = useState("active");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountUser, setAccountUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setEmployees(await getEmployees());
    } catch (err) {
      console.error("Error cargando empleados:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Resetear página al cambiar sub-pestaña o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [subTab, search, cinemaId]);

  const refreshEmployees = (title, message) => {
    fetchEmployees();
    setSuccessTitle(title);
    setSuccessMessage(message);
    setIsSuccessOpen(true);
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const bySearch = (e) => {
    const fullName =
      `${e.people?.first_name || ""} ${e.people?.last_name || ""}`.toLowerCase();
    return fullName.includes((search || "").toLowerCase());
  };

  const byCinema = (e) => {
    if (!cinemaId) return true;
    // normalizeEmployee ya resuelve la posición activa y guarda el id en e.cinema
    return String(e.cinema) === String(cinemaId);
  };

  const activeEmployees = employees.filter(
    (e) => e._User?.status !== 0 && bySearch(e) && byCinema(e),
  );
  const inactiveEmployees = employees.filter(
    (e) => e._User?.status === 0 && bySearch(e) && byCinema(e),
  );

  const currentList = subTab === "active" ? activeEmployees : inactiveEmployees;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const paginated = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditClick = (emp) => {
    setEmployeeToEdit(emp);
    setIsRegisterOpen(true);
  };
  const handleAccountClick = (emp) => {
    if (!emp?._User?.id) return;
    setAccountUser(emp._User);
    setIsAccountOpen(true);
  };
  const handleDeleteClick = (emp) => {
    setItemToDelete(emp);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteEmployee(itemToDelete.id);
      refreshEmployees(
        "Empleado Eliminado",
        "El empleado ha sido eliminado correctamente.",
      );
    } catch (err) {
      console.error("Error eliminando empleado:", err);
      setLoading(false);
    } finally {
      setIsDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── SUB-TABS: Activos / Desactivados ── */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {SUBTABS.map((t) => {
          const count =
            t.id === "active"
              ? activeEmployees.length
              : inactiveEmployees.length;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                isActive
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-muted-foreground hover:text-slate-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />
              {t.label}
              {!loading && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-brand-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TABLA ── */}
      <EmployeeTable
        employees={paginated}
        onEdit={handleEditClick}
        onAccount={handleAccountClick}
        onDelete={handleDeleteClick}
        isLoading={loading}
        emptyMessage={
          subTab === "active"
            ? "No hay empleados activos."
            : "No hay empleados desactivados."
        }
      />

      {/* ── PAGINACIÓN ── */}
      {!loading && currentList.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl shadow-sm">
          <p className="text-sm text-gray-700">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, currentList.length)} de{" "}
            {currentList.length} resultados
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
              Página {currentPage} de {totalPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 border border-gray-300 bg-white text-gray-500 rounded-r-md disabled:opacity-50"
            >
              ▶
            </button>
          </nav>
        </div>
      )}

      {/* ── MODALES ── */}
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
        initialData={employeeToEdit}
        onClose={(shouldRefresh) => {
          setIsRegisterOpen(false);
          setEmployeeToEdit(null);
          if (shouldRefresh) {
            refreshEmployees(
              employeeToEdit ? "Empleado Actualizado" : "Empleado Registrado",
              employeeToEdit
                ? "Los datos del empleado han sido modificados correctamente."
                : "El empleado ha sido registrado exitosamente.",
            );
          }
        }}
      />

      <EditUserModal
        open={isAccountOpen}
        user={accountUser}
        onClose={(shouldRefresh) => {
          setIsAccountOpen(false);
          setAccountUser(null);
          if (shouldRefresh) {
            refreshEmployees(
              "Cuenta Actualizada",
              "Los datos de acceso del empleado se actualizaron correctamente.",
            );
          }
        }}
      />
    </div>
  );
}
