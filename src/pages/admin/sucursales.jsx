import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomManager from "@/components/admin/sucursales/RoomManager";

export default function SucursalesPage() {
  const [selectedSucursal, setSelectedSucursal] = useState(null);

  // Datos de ejemplo para las sucursales
  const sucursales = [
    { id: 1, nombre: "Cineflix Centro", direccion: "Av. Principal 123", salas: 5 },
    { id: 2, nombre: "Cineflix Norte", direccion: "Plaza Norte, Nivel 2", salas: 8 },
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
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              onClick={() => setSelectedSucursal(sucursal)}
              className={`p-4 rounded-cineflix border cursor-pointer transition-all ${selectedSucursal?.id === sucursal.id
                ? "border-brand-primary bg-brand-primary/5 shadow-md"
                : "border-gray-200 hover:border-brand-primary/50 hover:shadow-sm bg-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedSucursal?.id === sucursal.id ? "bg-brand-primary text-brand-gold" : "bg-gray-100 text-gray-500"}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold font-montserrat">{sucursal.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{sucursal.direccion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de sucursales */}
      <div className="w-full flex flex-col">
        {selectedSucursal ? (
          <RoomManager key={selectedSucursal.id} sucursal={selectedSucursal} />
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
