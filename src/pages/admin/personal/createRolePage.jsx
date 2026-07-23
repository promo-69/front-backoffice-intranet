import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SuccessModal from "@/components/ui/SuccessModal";

import { getAllPermissionsPaginated } from "@/services/permissions.service";
import { createRole, updateRolePermissions } from "@/services/roles.service";

export default function CreateRolePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("visual");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [roleData, setRoleData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [permissionsByResource, setPermissionsByResource] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  // ============================
  // 1. Cargar permisos del backend
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const allPermissions = await getAllPermissionsPaginated();

        const grouped = {};
        allPermissions.forEach((perm) => {
          const resource = perm._Resources?.code || "OTROS";
          const action = perm._Actions?.code || "VER";

          if (!grouped[resource]) grouped[resource] = [];

          grouped[resource].push({
            id: perm.id,
            action,
          });
        });

        setPermissionsByResource(grouped);
      } catch (error) {
        console.error("Error cargando los permisos iniciales:", error);
      }
    }

    load();
  }, []);

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
  // 3. Crear rol + asignar permisos
  // ============================
  const handleSave = async () => {
    try {
      if (!roleData.code.trim()) {
        alert("Por favor, introduce el código identificador del rol.");
        return;
      }

      // 1. Crear el rol
      const newRole = await createRole({
        ...roleData,
        code: roleData.code.toUpperCase().trim(), 
      });

    
      if (newRole && newRole.id) {
        await updateRolePermissions(
          newRole.id,
          Array.from(selectedPermissions),
        );
      }

      setIsSuccessOpen(true);

      setTimeout(() => {
        setIsSuccessOpen(false);
        navigate("/admin/personal");
      }, 2000);
    } catch (error) {
      console.error("Error al procesar la creación del rol:", error);
      alert("Hubo un error guardando el rol. Por favor intente de nuevo.");
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
        <h2 className="text-xl font-bold text-brand-primary">Crear Rol</h2>
        <p className="text-xs text-muted-foreground">
          Define el nombre y los permisos del nuevo rol
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
              Información
            </TabsTrigger>

            <TabsTrigger
              value="permissions"
              className="pb-2 text-sm font-semibold"
            >
              Permisos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* INFORMACIÓN */}
        <TabsContent value="visual" className="space-y-4 mt-0">
          <div>
            <label className="text-sm font-semibold block text-brand-primary">
              Código del Rol
            </label>
            <Input
              placeholder="Ej: CASHIER, MANAGER"
              value={roleData.code}
              onChange={(e) =>
                setRoleData({ ...roleData, code: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-semibold block text-brand-primary">
              Nombre del Rol
            </label>
            <Input
              placeholder="Ej: Operador Nivel 2"
              value={roleData.name}
              onChange={(e) =>
                setRoleData({ ...roleData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-semibold block text-brand-primary">
              Descripción
            </label>
            <Input
              placeholder="Describe las funciones del rol"
              value={roleData.description}
              onChange={(e) =>
                setRoleData({ ...roleData, description: e.target.value })
              }
            />
          </div>
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
          Crear Rol
        </button>
      </div>
      {/* MODAL DE CONFIRMACIÓN */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => navigate("/admin/personal")}
        message="¡Rol creado y permisos asignados con éxito!"
      />
    </div>
  );
}
