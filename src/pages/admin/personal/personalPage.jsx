import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import Employees from "../employees/employees";
import Roles from "./rolesPage";
import RegisterEmployeeModal from "@/components/admin/employees/RegisterEmployeeModal";
import CinemaSelector from "@/components/admin/inventory/CinemaSelector";
import { getCinemas } from "@/services/cinema.service";
import { usePermission } from "@/hooks/usePermission";

export default function PersonalPage() {
  const { modal, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isSuperAdmin } = usePermission();

  const initialTab =
    searchParams.get("tab") === "roles" ? "roles" : "employees";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");

  // ── Filtro de sucursal (solo superadmin, solo pestaña Empleados) ──
  const [cinemas, setCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState("");
  const [cinemasLoading, setCinemasLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setCinemasLoading(true);
    getCinemas({ page: 1, limit: 100 })
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.cinemas ?? res.data ?? []);
        setCinemas(list);
      })
      .catch(() => {})
      .finally(() => setCinemasLoading(false));
  }, [isSuperAdmin]);

  const tabs = [
    { id: "employees", label: "Empleados" },
    { id: "roles", label: "Roles" },
  ];

  const titles = {
    employees: "Gestión de Empleados",
    roles: "Gestión de Roles",
  };

  const descriptions = {
    employees: "Administra la información laboral del personal",
    roles: "Administra los roles del sistema",
  };

  const placeholders = {
    employees: "Buscar empleado...",
    roles: "Buscar rol...",
  };

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {titles[activeTab]}
          </h3>
          <p className="text-xs text-muted-foreground">
            {descriptions[activeTab]}
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />

          <button
            onClick={() => {
              if (activeTab === "roles") {
                navigate("/admin/personal/create-role");
              } else {
                openModal("employeeForm");
              }
            }}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />
            {activeTab === "employees" ? "Añadir Empleado" : "Crear Rol"}
          </button>
        </div>
      </div>

      {/* NAVEGACION POR PESTAÑAS (TABS) */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "font-bold text-brand-gold border-brand-gold"
                  : "text-muted-foreground border-transparent hover:text-brand-primary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SELECTOR DE SUCURSAL — solo superadmin en pestaña Empleados */}
        {isSuperAdmin && activeTab === "employees" && (
          <CinemaSelector
            cinemas={cinemas}
            value={cinemaId}
            onChange={setCinemaId}
            showAll={true}
            loading={cinemasLoading}
          />
        )}
      </div>

      {/* CONTENIDO DINÁMICO */}
      {activeTab === "employees" && (
        <Employees key={refreshKey} search={search} cinemaId={cinemaId || undefined} />
      )}
      {activeTab === "roles" && <Roles search={search} />}

      {/* MODALES */}
      {modal.isOpen && modal.type === "employeeForm" && (
        <RegisterEmployeeModal open={true} onClose={(shouldRefresh) => {
          closeModal();
          if (shouldRefresh) setRefreshKey(k => k + 1);
        }} />
      )}
    </div>
  );
}
