import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Mock temporal — luego se reemplaza por backend
const ROLE_PERMISSIONS = {
  ADMIN: {
    employees: true,
    users: true,
    reports: true,
  },
  GERENT_MANAGER: {
    employees: true,
    users: true,
    reports: false,
  },
  CASHIER: {
    employees: false,
    users: false,
    reports: true,
  },
  USHER: {
    employees: false,
    users: false,
    reports: false,
  },
};

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  //  Si viene desde EDITAR, cargamos el nombre del rol
  const editingRole = searchParams.get("role");

  const [roleName, setRoleName] = useState(editingRole || "");
  const [activeTab, setActiveTab] = useState("visual");

  const [permissions, setPermissions] = useState({
    employees: false,
    users: false,
    reports: false,
  });

  //  Cargar permisos automáticamente según el rol
  useEffect(() => {
    if (editingRole && ROLE_PERMISSIONS[editingRole]) {
      setPermissions(ROLE_PERMISSIONS[editingRole]);
    }
  }, [editingRole]);

  const togglePermission = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white p-6 rounded-cineflix border shadow-sm space-y-6">
      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/admin/personal")}
        className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Roles
      </button>

      {/* TÍTULO */}
      <div>
        <h2 className="text-xl font-bold text-brand-primary">
          {editingRole ? "Editar Rol" : "Crear Rol"}
        </h2>

        <p className="text-xs text-muted-foreground">
          {editingRole
            ? "Modifica el nombre y los permisos del rol"
            : "Configura el nombre y los permisos del nuevo rol"}
        </p>
      </div>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col"
      >
        <div className="border-b border-gray-200 pb-2">
          <TabsList className="flex gap-6 bg-transparent p-0 justify-start h-auto">
            <TabsTrigger
              value="visual"
              className="pb-2 text-sm font-semibold rounded-none border-b-2 bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-brand-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent transition-all"
            >
              Visualización
            </TabsTrigger>

            <TabsTrigger
              value="permissions"
              className="pb-2 text-sm font-semibold rounded-none border-b-2 bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-brand-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:border-transparent transition-all"
            >
              Permisos
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="w-full pt-4">
          {/* VISUALIZACIÓN */}
          <TabsContent value="visual" className="space-y-2 mt-0">
            <label className="text-sm font-semibold block text-brand-primary">
              Nombre del Rol
            </label>

            <Input
              placeholder="Ej: Administrador, Cajero, Supervisor..."
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full"
            />
          </TabsContent>

          {/* PERMISOS */}
          <TabsContent value="permissions" className="space-y-6 mt-0">
            <h3 className="text-sm font-semibold text-brand-primary">
              Permisos del Rol
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">
                  Gestionar empleados
                </span>
                <Switch
                  checked={permissions.employees}
                  onCheckedChange={() => togglePermission("employees")}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">
                  Gestionar usuarios
                </span>
                <Switch
                  checked={permissions.users}
                  onCheckedChange={() => togglePermission("users")}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Ver reportes</span>
                <Switch
                  checked={permissions.reports}
                  onCheckedChange={() => togglePermission("reports")}
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* BOTÓN GUARDAR */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-sm">
          {editingRole ? "Guardar Cambios" : "Guardar Rol"}
        </button>
      </div>
    </div>
  );
}
