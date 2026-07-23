import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SuccessModal from "@/components/ui/SuccessModal";

import { getAllPermissionsPaginated } from "@/services/permissions.service";
import {
  getRoleById,
  updateRolePermissions,
  removeRolePermissions,
} from "@/services/roles.service";

export default function EditRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get("roleId");

  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("visual");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [permissionsByResource, setPermissionsByResource] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  // Snapshot de lo que el rol tenía al cargar, para calcular qué agregar y qué quitar.
  const [originalPermissions, setOriginalPermissions] = useState(new Set());

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

        const allPermissions = await getAllPermissionsPaginated();

        // 3. Permisos actualmente asignados al rol
        const rolePermissions = roleData._RolePermissions || [];
        const assignedIds = new Set(rolePermissions.map((rp) => rp.permission));
        setSelectedPermissions(assignedIds);
        setOriginalPermissions(new Set(assignedIds));

        // 4. Agrupar dinámicamente usando las descripciones amigables del backend
        const grouped = {};

        allPermissions.forEach((perm) => {
          // Usamos la descripción del tipo de permiso o del recurso como título del bloque
          const blockTitle =
            perm._PermissionTypes?.description || "Otros Módulos";

          // La acción ahora será la descripción exacta y legible de lo que hace el permiso
          const labelAction = perm._Resources?.description
            ? `${perm._Resources.description} (${perm._Actions?.description || perm._Actions?.code})`
            : perm._Actions?.description || "Acción no especificada";

          if (!grouped[blockTitle]) {
            grouped[blockTitle] = [];
          }

          grouped[blockTitle].push({
            id: perm.id,
            actionLabel: labelAction,
            rawCode: `${perm._PermissionTypes?.code}:${perm._Actions?.code}:${perm._Resources?.code}`,
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
    // Calculamos el delta real contra lo que el rol tenía al cargar:
    //  - toAdd: seleccionados que antes no estaban  → POST
    //  - toRemove: que estaban y ahora se desmarcaron → DELETE
    const toAdd = [...selectedPermissions].filter(
      (id) => !originalPermissions.has(id),
    );
    const toRemove = [...originalPermissions].filter(
      (id) => !selectedPermissions.has(id),
    );

    try {
      if (toAdd.length > 0) await updateRolePermissions(roleId, toAdd);
      if (toRemove.length > 0) await removeRolePermissions(roleId, toRemove);

      setOriginalPermissions(new Set(selectedPermissions));
      setIsSuccessOpen(true);

      setTimeout(() => {
        setIsSuccessOpen(false);
        navigate("/admin/personal?tab=roles");
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
        onClick={() => navigate("/admin/personal?tab=roles")}
        className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Roles
      </button>

      {/* TÍTULO */}
      <div>
        <h2 className="text-xl font-bold text-brand-primary">Editar Rol</h2>
        <p className="text-xs text-muted-foreground">
          Modifica los permisos de acceso para este rol del sistema
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
          <h3 className="text-sm font-semibold text-brand-primary mb-2">
            Permisos para el Rol
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(permissionsByResource).map(
              ([groupTitle, perms]) => (
                <div
                  key={groupTitle}
                  className="border p-4 rounded-xl shadow-sm bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 border-b pb-2 mb-3 tracking-wide uppercase text-brand-primary">
                      {groupTitle}
                    </h4>

                    <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-none hover:bg-gray-50/50 px-1 rounded transition-colors"
                        >
                          <div className="flex flex-col gap-0.5 max-w-[80%]">
                            <span className="text-sm text-gray-700 font-medium">
                              {perm.actionLabel}
                            </span>
                          </div>

                          <Switch
                            checked={selectedPermissions.has(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
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
        onClose={() => navigate("/admin/personal?tab=roles")}
        message="¡Permisos del rol actualizados correctamente!"
      />
    </div>
  );
}
