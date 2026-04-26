import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterUserModal } from "@/components/admin/users/RegisterUserModal";

export default function Users() {
  const [activeTab, setActiveTab] = useState("employees");
  const [openModal, setOpenModal] = useState(false);

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

        {/* BOTÓN QUE ABRE EL MODAL */}
        <Button
          onClick={() => setOpenModal(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          <Plus className="mr-2 h-5 w-5 text-brand-gold" />
          Añadir empleado
        </Button>
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

      {/* Contenido según pestaña */}
      {activeTab === "employees" && (
        <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-cineflix">
          <p className="text-gray-400 font-montserrat italic">
            No hay empleados registrados actualmente.
          </p>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-cineflix">
          <p className="text-gray-400 font-montserrat italic">
            No hay clientes registrados actualmente.
          </p>
        </div>
      )}

      {/* ⭐ MODAL AQUÍ ⭐ */}
      <RegisterUserModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
