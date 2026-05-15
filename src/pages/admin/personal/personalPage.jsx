import { useState } from "react";

// Páginas internas
import Employees from "@/pages/admin/employees/employees";
import Users from "@/pages/admin/users/users";
import ClientsTab from "@/pages/admin/users/clientsTab";

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="space-y-6">
      {/* ⭐ TÍTULO */}
      <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <h1 className="text-xl font-montserrat font-bold text-brand-primary">
          Gestión de Personal
        </h1>
        <p className="text-xs text-muted-foreground">
          Administra empleados, usuarios del sistema, clientes y roles
        </p>
      </div>

      {/* ⭐ PESTAÑAS */}
      <div className="flex gap-6 border-b border-gray-200 pb-2 px-2">
        {/* EMPLEADOS */}
        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-2 font-semibold ${
            activeTab === "employees"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-gray-500"
          }`}
        >
          Empleados
        </button>

        {/* USUARIOS */}
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2 font-semibold ${
            activeTab === "users"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-gray-500"
          }`}
        >
          Usuarios
        </button>

        {/* CLIENTES */}
        <button
          onClick={() => setActiveTab("clients")}
          className={`pb-2 font-semibold ${
            activeTab === "clients"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-gray-500"
          }`}
        >
          Clientes
        </button>
      </div>

      {/* ⭐ CONTENIDO DE CADA PESTAÑA */}
      <div className="mt-4">
        {activeTab === "employees" && <Employees />}
        {activeTab === "users" && <Users />}
        {activeTab === "clients" && <ClientsTab />}
      </div>
    </div>
  );
}
