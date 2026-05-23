import { useState } from "react";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/useModal";

import Employees from "@/pages/admin/employees/employees";
import Users from "@/pages/admin/users/users";
import Clients from "@/pages/admin/users/clientsTab";
import Roles from "@/pages/admin/personal/rolesPage";

import RegisterEmployeeModal from "@/components/admin/employees/RegisterEmployeeModal";
import RegisterUserModal from "@/components/admin/users/RegisterUserModal";
import CreateRolePage from "@/pages/admin/personal/createRolePage";

export default function PersonalPage() {
  const { modal, openModal, closeModal } = useModal();

  const [activeTab, setActiveTab] = useState("employees");
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "employees", label: "Empleados" },
    { id: "users", label: "Usuarios" },
    { id: "clients", label: "Clientes" },
    { id: "roles", label: "Roles" },
  ];

  const titles = {
    employees: "Gestión de Empleados",
    users: "Gestión de Usuarios",
    clients: "Gestión de Clientes",
    roles: "Gestión de Roles",
    createRole: "Crear Rol",
  };

  const descriptions = {
    employees: "Administra la información laboral del personal",
    users: "Administra los usuarios del sistema",
    clients: "Administra los clientes registrados",
    roles: "Administra los roles del sistema",
    createRole: "Configura el nombre y permisos del nuevo rol",
  };

  const placeholders = {
    employees: "Buscar empleado...",
    users: "Buscar usuario...",
    clients: "Buscar cliente...",
    roles: "Buscar rol...",
    createRole: "",
  };

  const modalTypes = {
    employees: "employeeForm",
    users: "userForm",
    clients: null,
    roles: null, // YA NO USA MODAL
  };

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      {/* ⭐ HEADER DINÁMICO */}
      <header className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {titles[activeTab]}
          </h3>
          <p className="text-xs text-muted-foreground">
            {descriptions[activeTab]}
          </p>
        </div>

        {/* ⭐ BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          {activeTab !== "createRole" && (
            <input
              type="text"
              placeholder={placeholders[activeTab]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          )}

          {/* ⭐ BOTÓN DINÁMICO */}
          {activeTab !== "clients" && activeTab !== "createRole" && (
            <button
              onClick={() => {
                if (activeTab === "roles") {
                  setActiveTab("createRole");
                } else {
                  openModal(modalTypes[activeTab]);
                }
              }}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />

              {activeTab === "employees"
                ? "Añadir Empleado"
                : activeTab === "users"
                  ? "Añadir Usuario"
                  : activeTab === "roles"
                    ? "Crear Rol"
                    : ""}
            </button>
          )}
        </div>
      </header>

      {activeTab !== "createRole" && (
        <div className="flex gap-4 border-b pb-2">
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
      )}

      {/* ⭐ CONTENIDO DINÁMICO */}
      {activeTab === "employees" && <Employees search={search} />}
      {activeTab === "users" && <Users search={search} />}
      {activeTab === "clients" && <Clients search={search} />}
      {activeTab === "roles" && <Roles search={search} />}

      {/* ⭐ VISTA COMPLETA: CREAR ROL */}
      {activeTab === "createRole" && (
        <CreateRolePage onBack={() => setActiveTab("roles")} />
      )}

      {/* ⭐ MODALES */}
      {modal.isOpen && modal.type === "employeeForm" && (
        <RegisterEmployeeModal open={true} onClose={closeModal} />
      )}

      {modal.isOpen && modal.type === "userForm" && (
        <RegisterUserModal open={true} onClose={closeModal} />
      )}
    </div>
  );
}
