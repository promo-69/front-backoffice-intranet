import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CarteleraPage() {
  return (
    <div className="space-y-6">
      {/* Barra de acciones superior */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Listado de Películas
          </h3>
          <p className="text-xs text-muted-foreground">
            Gestiona los títulos disponibles en tus sucursales.
          </p>
        </div>

        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix transition-transform hover:scale-105 active:scale-95 shadow-md">
          <Plus className="mr-2 h-5 w-5 text-brand-gold" />
          Agregar Película
        </Button>
      </div>

      {/* Aquí irá tu tabla o grid de películas más adelante */}
      <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-cineflix">
        <p className="text-gray-400 font-montserrat italic">
          No hay películas registradas actualmente.
        </p>
      </div>
    </div>
  );
}
