import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { getAllPermissions } from "@/services/permissions.service";
import {
  getRoleById,
  updateRolePermissions, 
} from "@/services/roles.service";

export default function EditRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleId = searchParams.get("roleId");

  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("visual");

  const [permissionsByResource, setPermissionsByResource] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

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
        const allPermissions = await getAllPermissions();

        // 3. Extraer los permisos que ya tiene el rol asignados.
        const rolePermissions = roleData._RolePermissions || [];

        // Creamos el Set con los IDs de los permisos activos de este rol
        const assignedIds = new Set(rolePermissions.map((rp) => rp.permission));
        setSelectedPermissions(assignedIds);

        // 4. Agrupar la parrilla completa de permisos por recurso para la interfaz
        const grouped = {};
        allPermissions.forEach((perm) => {
          const resource = perm._Resources.code;
          const action = perm._Actions.code;

          if (!grouped[resource]) grouped[resource] = [];

          grouped[resource].push({
            id: perm.id,
            action,
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
  // 2. Toggle de checkboxes / switches
  // ============================
  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const updated = new Set(prev);
      updated.has(permId) ? updated.delete(permId) : updated.add(permId);
      return updated;
    });
  };

  // ============================
  // 3. Guardar cambios (Ejecuta el POST )
  // ============================
  const handleSave = async () => {
    // Verificar si la función se ejecuta al dar clic
    console.log("¡Botón Guardar presionado!");
    console.log("ID del Rol actual (roleId):", roleId);

    const permissionsArray = Array.from(selectedPermissions);
    console.log("IDs de permisos capturados para enviar:", permissionsArray);

    if (!roleId) {
      console.error(
        "Fallo antes de enviar: No se encontró el 'roleId' en la URL.",
      );
      alert("Error: Falta el ID del rol.");
      return;
    }

    try {
      console.log("Enviando petición al backend...");

      // Aquí hacemos la llamada
      const response = await updateRolePermissions(roleId, permissionsArray);

      // Si el backend responde con éxito
      console.log("Respuesta exitosa del backend:", response);

      alert("¡Permisos guardados correctamente!");
      navigate("/admin/personal");
    } catch (error) {
      // Si la petición falla (Ej: Error 400, 404, 500)
      console.error("Error capturado en handleSave al ejecutar el servicio:");
      if (error.response) {
        console.error("Datos del error de respuesta:", error.response.data);
        console.error("Estado HTTP del error:", error.response.status);
      } else {
        console.error("Mensaje de error general:", error.message);
      }
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

      {/* NAVEGACION POR PESTAÑAS (TABS) */}
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

        {/* VISUALIZACIÓN */}
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
    </div>
  );
}
