import React, { useState } from 'react';
/* IMPORTANTE: Añadimos Plus a las importaciones */
import { Plus } from 'lucide-react'; 
import CinemaSearch from '../../../components/admin/cinemas/SearchBar';
import CinemaTable from '../../../components/admin/cinemas/CinemaTable';
import RoomManager from "../../../components/admin/sucursales/RoomManager";

const CinemaPage = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [branches] = useState([
    { 
      id: 1, 
      name: 'Sambil Barquisimeto', 
      address: 'Av. Venezuela, C.C. Sambil', 
      phone: '0251-1234567', 
      opening_time: '10:00 AM', 
      closing_time: '11:00 PM', 
      status: 'Activo' 
    },
    { 
      id: 2, 
      name: 'Metrópolis', 
      address: 'Av. Florencio Jiménez', 
      phone: '0251-7654321', 
      opening_time: '11:00 AM', 
      closing_time: '09:00 PM', 
      status: 'Activo' 
    },

        { 
      id: 2, 
      name: 'Metrópolis', 
      address: 'Av. Florencio Jiménez', 
      phone: '0251-7654321', 
      opening_time: '11:00 AM', 
      closing_time: '09:00 PM', 
      status: 'Activo' 
    },

        { 
      id: 2, 
      name: 'Metrópolis', 
      address: 'Av. Florencio Jiménez', 
      phone: '0251-7654321', 
      opening_time: '11:00 AM', 
      closing_time: '09:00 PM', 
      status: 'Activo' 
    },
  ]);

  return (
    <div className="space-y-10 p-2">
      {/* SECCIÓN SUPERIOR: Títulos y Buscador */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Sedes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza tus sucursales y selecciona una para gestionar sus salas de proyección.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <h2 className="text-sm font-black text-brand-primary uppercase tracking-widest">
            Listado de Sucursales
          </h2>
          <CinemaSearch 
            placeholder="BUSCAR SEDE..." 
            onAddClick={() => console.log("Abrir modal de registro")} 
          />
        </div>
      </div>

      {/* SECCIÓN MEDIA: La Tabla Profesional */}
      <div className="w-full">
        <CinemaTable 
          data={branches} 
          onEdit={(branch) => console.log("Editando:", branch)}
          onDelete={(id) => console.log("Eliminando ID:", id)}
          onSelectBranch={(branch) => setSelectedBranch(branch)} 
          selectedId={selectedBranch?.id}
        />
      </div>

      {/* SECCIÓN INFERIOR: Gestión de Salas (RoomManager) */}
      <div className="w-full pt-6 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1 bg-brand-primary rounded-full"></div>
              <h3 className="text-lg font-black text-slate-800 uppercase">
                Salas: <span className="text-brand-primary">{selectedBranch.name}</span>
              </h3>
            </div>
            <RoomManager key={selectedBranch.id} branch={selectedBranch} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 transition-all">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <Plus className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-center max-w-xs">
              Selecciona una sucursal de la tabla superior para visualizar y configurar sus salas disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;