import { useState } from "react";
import { Plus } from "lucide-react";
import Employees from "../employees/employees";
import Users from "../users/users";
import Clients from "../users/clientsTab";

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState("employees");
  const [search, setSearch] = useState("");

  // ⭐ TEXTOS DINÁMICOS
  const titles = {
    employees: "Gestión de Empleados",
    users: "Gestión de Usuarios",
    clients: "Gestión de Clientes",
  };

  const descriptions = {
    employees: "Administra la información laboral del personal",
    users: "Administra el acceso de empleados al sistema",
    clients: "Administra los clientes registrados",
  };

  const placeholders = {
    employees: "Buscar Empleado...",
    users: "Buscar Usuario...",
    clients: "Buscar Cliente...",
  };

  const buttonLabels = {
    employees: "Añadir Empleado",
    users: "Añadir Usuario",
    clients: "Añadir Cliente",
  };

  return (
    <div className="space-y-6">
      {/* ⭐ HEADER DINÁMICO */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            {titles[activeTab]}
          </h3>
          <p className="text-xs text-muted-foreground">
            {descriptions[activeTab]}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* ⭐ BUSCADOR */}
          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 rounded-cineflix border border-gray-300 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />

          {/* ⭐ BOTÓN OCULTO EN CLIENTES */}
          {activeTab !== "clients" && (
            <button
              onClick={() => console.log("Abrir modal según pestaña")}
              className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-2 border-purple-400/30 font-montserrat"
            >
              <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
              {buttonLabels[activeTab]}
            </button>
          )}
        </div>
      </div>

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
            activeTab === "users"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Usuarios
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

      {/* ⭐ CONTENIDO DINÁMICO */}
      {activeTab === "employees" && <Employees search={search} />}
      {activeTab === "users" && <Users search={search} />}
      {activeTab === "clients" && <Clients search={search} />}
    </div>
  );
}
