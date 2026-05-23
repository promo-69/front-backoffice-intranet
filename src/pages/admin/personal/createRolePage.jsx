import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateRolePage({ onBack }) {
  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("visual");

  return (
    <div className="bg-white p-6 rounded-cineflix border shadow-sm space-y-6">
      {/* ⭐ BOTÓN VOLVER */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Roles
      </button>

      {/* ⭐ TÍTULO */}
      <div>
        <h2 className="text-xl font-bold text-brand-primary">Crear Rol</h2>
        <p className="text-xs text-muted-foreground">
          Configura el nombre y los permisos del nuevo rol
        </p>
      </div>

      {/* ⭐ TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-64">
          <TabsTrigger value="visual">Visualización</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
        </TabsList>

        {/* ⭐ TAB: VISUALIZACIÓN */}
        <TabsContent value="visual" className="mt-6 space-y-4">
          <label className="text-sm font-semibold">Nombre del Rol</label>
          <Input
            placeholder="Ej: Administrador, Cajero, Supervisor..."
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </TabsContent>

        {/* ⭐ TAB: PERMISOS */}
        <TabsContent value="permissions" className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold">Permisos del Rol</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox id="p1" />
              <label htmlFor="p1" className="text-sm">
                Gestionar empleados
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="p2" />
              <label htmlFor="p2" className="text-sm">
                Gestionar usuarios
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="p3" />
              <label htmlFor="p3" className="text-sm">
                Ver reportes
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ⭐ BOTÓN GUARDAR */}
      <div className="flex justify-end">
        <button className="bg-brand-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:brightness-110">
          Guardar Rol
        </button>
      </div>
    </div>
  );
}
