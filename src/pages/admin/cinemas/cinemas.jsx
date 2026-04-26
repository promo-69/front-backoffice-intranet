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
  ];

  const CinemaTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200">
    <button 
      onClick={() => setActiveTab('sucursales')}
      className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'sucursales' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-400'}`}
    >
      SUCURSALES
    </button>
    <button 
      onClick={() => setActiveTab('salas')}
      className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'salas' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-400'}`}
    >
      SALAS
    </button>
  </div>
);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <CinemaTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <CinemaSearch 
          placeholder="BUSCAR SUCURSAL..." 
          onAddClick={() => console.log("Abrir modal de registro")} 
        />
      </div>

      {activeTab === 'sucursales' ? (
        <CinemaTable 
          data={sucursales} 
          onEdit={(c) => console.log("Editar", c)}
          onDelete={(id) => console.log("Eliminar", id)}
        />
      ) : (
        <div className="p-10 text-center text-gray-400">Panel de Salas en desarrollo...</div>
      )}
    </div>
  );
};

export default CinemasPage;