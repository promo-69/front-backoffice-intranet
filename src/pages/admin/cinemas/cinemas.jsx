import React, { useState } from 'react';
import CinemaSearch from '../../../components/admin/cinemas/SearchBar';
import CinemaTable from '../../../components/admin/cinemas/CinemaTable';

const CinemasPage = () => {
  const [activeTab, setActiveTab] = useState('sucursales');

  const sucursales = [
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
      id: 1, 
      name: 'Sambil Barquisimeto', 
      address: 'Av. Venezuela, C.C. Sambil', 
      phone: '0251-1234567', 
      opening_time: '10:00 AM', 
      closing_time: '11:00 PM', 
      status: 'Activo' 
    },

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
      id: 1, 
      name: 'Sambil Barquisimeto', 
      address: 'Av. Venezuela, C.C. Sambil', 
      phone: '0251-1234567', 
      opening_time: '10:00 AM', 
      closing_time: '11:00 PM', 
      status: 'Activo' 
    },

        { 
      id: 1, 
      name: 'Sambil Barquisimeto', 
      address: 'Av. Venezuela, C.C. Sambil', 
      phone: '0251-1234567', 
      opening_time: '10:00 AM', 
      closing_time: '11:00 PM', 
      status: 'Activo' 
    },
  ];

  const CinemaTabs = ({ activeTab, setActiveTab }) => (
    <div className="flex gap-8 border-b border-gray-200">
      <button 
        onClick={() => setActiveTab('sucursales')}
        className={`pb-4 px-2 text-sm font-black transition-all relative ${
          activeTab === 'sucursales' 
          ? 'text-brand-primary' 
          : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        SUCURSALES
        {activeTab === 'sucursales' && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 p-2">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <CinemaTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="pb-1">
          <CinemaSearch 
            placeholder="BUSCAR SUCURSAL..." 
            onAddClick={() => console.log("Abrir modal")} 
          />
        </div>
      </div>

      {/* Contenido Principal */}
      {activeTab === 'sucursales' ? (
        <CinemaTable 
          data={sucursales} 
          onEdit={(c) => console.log("Editar", c)}
          onDelete={(id) => console.log("Eliminar", id)}
        />
      ) : (
        <div className="p-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
          El panel de gestión de Salas - Ricardo
        </div>
      )}
    </div>
  );
};

export default CinemasPage;