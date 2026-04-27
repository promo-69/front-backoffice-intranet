import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";
import EmployeesTab from "./employeesTab";
import ClientsTab from "./clientsTab";

export default function Users() {
  const [activeTab, setActiveTab] = useState("employees");
  const [openModal, setOpenModal] = useState(false);

  
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Barra de acciones superior */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestion de personal
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra el acceso de cajeros y operadores por sucursal
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-64 px-3 py-2 rounded-cineflix border border-gray-300 
              text-sm font-montserrat 
              focus:outline-none focus:ring-2 focus:ring-brand-primary/40
            "
          />

          <Button
            onClick={() => setOpenModal(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix transition-transform hover:scale-105 active:scale-95 shadow-md"
          >
            <Plus className="mr-2 h-5 w-5 text-brand-gold" />
            Añadir empleado
          </Button>
        </div>
      </div>

      {/* Mini menú de pestañas */}
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
            activeTab === "clients"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("clients")}
        >
          Clientes
        </button>
      </div>

      {/* Contenido */}
      {activeTab === "employees" && <EmployeesTab search={search} />}
      {activeTab === "clients" && <ClientsTab />}

      {/* MODAL */}
      <RegisterUserModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
