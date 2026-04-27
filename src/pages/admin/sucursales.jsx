import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomManager from "@/components/admin/sucursales/RoomManager";

export default function SucursalesPage() {
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Datos de ejemplo para las sucursales
  const branches = [
    { id: 1, name: "Cineflix Centro", address: "Av. Principal 123", roomsCount: 5 },
    { id: 2, name: "Cineflix Norte", address: "Plaza Norte, Nivel 2", roomsCount: 8 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* LADO IZQUIERDO: Lista de Sucursales */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-montserrat font-bold text-brand-primary">
            Mis Sucursales
          </h2>
          <Button variant="outline" size="sm" className="h-8 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
            <Plus className="h-4 w-4 mr-1" /> Nueva
          </Button>
        </div>

        <div className="space-y-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              onClick={() => setSelectedBranch(branch)}
              className={`p-4 rounded-cineflix border cursor-pointer transition-all ${selectedBranch?.id === branch.id
                ? "border-brand-primary bg-brand-primary/5 shadow-md"
                : "border-gray-200 hover:border-brand-primary/50 hover:shadow-sm bg-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedBranch?.id === branch.id ? "bg-brand-primary text-brand-gold" : "bg-gray-100 text-gray-500"}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold font-montserrat">{branch.name}</h3>
                  <p className="text-xs text-muted-foreground">{branch.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de sucursales */}
      <div className="w-full flex flex-col">
        {selectedBranch ? (
          <RoomManager key={selectedBranch.id} branch={selectedBranch} />
        ) : (
          <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-cineflix min-h-[400px] bg-gray-50/50">
            <p className="text-gray-400 font-montserrat italic text-center">
              Selecciona una sucursal del lado izquierdo <br /> para ver y gestionar sus salas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
