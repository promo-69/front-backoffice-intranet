import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SuccessModal from "@/components/ui/SuccessModal";

import { getAllPermissions } from "@/services/permissions.service";
import { getRoleById, updateRolePermissions } from "@/services/roles.service";

export default function EditRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get("roleId");

  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("visual");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [permissionsByResource, setPermissionsByResource] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  // ============================
  // MAPAS DE TRADUCCIÓN
  // ============================
  const ACTION_LABELS = {
    READ: "Ver",
    CREATE: "Crear",
    UPDATE: "Editar",
    DELETE: "Eliminar",
  };

  const RESOURCE_LABELS = {
    REPORTS_EXPORT: "Reportes de Exportación",
    REPORTS_ALL: "Todos los Reportes",
    REPORTS_MOVIES: "Reportes de Películas",
    REPORTS_SALES: "Reportes de Ventas",
    REPORTS_INVENTORY: "Reportes de Inventario",
    REPORTS_SHOWTIMES: "Reportes de Funciones",
    REPORTS_RENTALS: "Reportes de Alquileres",
    REPORTS_CASHIER: "Reporte de Caja",
    SPECIAL_EVENTS: "Eventos Especiales",
    MOVIES: "Películas",
    SHOWTIMES: "Funciones",
    PRODUCTS: "Productos",
    COMBOS: "Combos",
    CINEMAS: "Cines",
    CINEMAS_ROOMS: "Salas de Cine",
    CINEMAS_ROOM_EVENTS: "Funciones de Cartelera",
    USERS: "Usuarios",
    EMPLOYEES: "Empleados",
    CUSTOMERS: "Clientes",
  };

  // ============================
  // 1. Cargar datos del rol + permisos globales
  // ============================
  useEffect(() => {
    async function load() {
      if (!roleId) return;

      try {
        // 1. Obtener datos del rol
        const roleData = await getRoleById(roleId);
        setRoleName(roleData.code);

        // 2. Obtener todos los permisos globales
        const allPermissions = await getAllPermissions(); // YA ES UN ARRAY

        // 3. Permisos asignados al rol
        const rolePermissions = roleData._RolePermissions || [];
        const assignedIds = new Set(rolePermissions.map((rp) => rp.permission));
        setSelectedPermissions(assignedIds);

        // 4. Agrupar permisos por recurso traducido
        const grouped = {};

        allPermissions.forEach((perm) => {
          const resourceCode = perm._Resources.code;
          const actionCode = perm._Actions.code;

          if (!resourceCode || !actionCode) return;

          const readableResource =
            RESOURCE_LABELS[resourceCode] || resourceCode;

          const readableAction = ACTION_LABELS[actionCode] || actionCode;

          if (!grouped[readableResource]) grouped[readableResource] = [];

          grouped[readableResource].push({
            id: perm.id,
            action: readableAction,
          });
        });

        setPermissionsByResource(grouped);
      } catch (error) {
        console.error("Error cargando los datos de edición de roles:", error);
      }
    }

    load();
  }, [roleId]);

  // ============================
  // 2. Toggle de permisos
  // ============================
  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const updated = new Set(prev);
      updated.has(permId) ? updated.delete(permId) : updated.add(permId);
      return updated;
    });
  };

  // ============================
  // 3. Guardar cambios
  // ============================
  const handleSave = async () => {
    const permissionsArray = Array.from(selectedPermissions);

    try {
      await updateRolePermissions(roleId, permissionsArray);
      //alert("¡Permisos guardados correctamente!");
      //navigate("/admin/personal");
      // Activar modal estético de guardado exitoso
      setIsSuccessOpen(true);

      setTimeout(() => {
        setIsSuccessOpen(false);
        navigate("/admin/personal");
      }, 2000);
    } catch (error) {
      console.error("Error guardando permisos:", error);
      alert("Hubo un error guardando los permisos.");
    }
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
        <h2 className="text-xl font-bold text-brand-primary">Editar Rol</h2>
        <p className="text-xs text-muted-foreground">
          Modifica los permisos del rol
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
            <TabsTrigger value="visual" className="pb-2 text-sm font-semibold">
              Visualización
            </TabsTrigger>

            <TabsTrigger
              value="permissions"
              className="pb-2 text-sm font-semibold"
            >
              Permisos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* VISUAL */}
        <TabsContent value="visual" className="space-y-2 mt-0">
          <label className="text-sm font-semibold block text-brand-primary">
            Nombre del Rol
          </label>
          <Input disabled value={roleName} className="w-full bg-gray-100" />
        </TabsContent>

        {/* PERMISOS */}
        <TabsContent value="permissions" className="space-y-6 mt-0">
          <h3 className="text-sm font-semibold text-brand-primary">
            Permisos del Rol
          </h3>

          {Object.entries(permissionsByResource).map(([resource, perms]) => (
            <div key={resource} className="border p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">{resource}</h4>

              {perms.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-center justify-between py-2 border-b last:border-none"
                >
                  <span className="text-sm">{perm.action}</span>

                  <Switch
                    checked={selectedPermissions.has(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                </div>
              ))}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* BOTÓN GUARDAR */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-sm"
        >
          Guardar Cambios
        </button>
      </div>
      {/* MODAL DE CONFIRMACIÓN */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => navigate("/admin/personal")}
        message="¡Permisos del rol actualizados correctamente!"
      />
    </div>
  );
}
