import { useState } from "react";
import EmployeesTab from "./employeesTab";
import ClientsTab from "./clientsTab";

export default function Users() {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Control de usuarios / roles</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2 mb-6">
        <button
          className={
            activeTab === "employees" ? "font-bold text-[#D9982F]" : ""
          }
          onClick={() => setActiveTab("employees")}
        >
          Empleados
        </button>

        <button
          className={activeTab === "clients" ? "font-bold text-[#D9982F]" : ""}
          onClick={() => setActiveTab("clients")}
        >
          Clientes
        </button>
      </div>

      {/* Content */}
      {activeTab === "employees" && <EmployeesTab />}
      {activeTab === "clients" && <ClientsTab />}
    </div>
  );
}
