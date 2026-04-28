import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CinemaSearch from '../../../components/admin/cinemas/SearchBar';
import CinemaTable from '../../../components/admin/cinemas/CinemaTable';
import RoomManager from "../../../components/admin/cinemas/RoomManager";
// Al importar EditCinema, ahora funcionará porque el archivo exporta por "default"
import EditCinema from "../../../components/admin/cinemas/BranchModal"; 

const CinemaPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);

  const [branches] = useState([
    { id: 1, name: 'Sambil Barquisimeto', address: 'Av. Venezuela, C.C. Sambil', phone: '0251-1234567', opening_time: '10:00 AM', closing_time: '11:00 PM', status: 'Activo' },
    { id: 4, name: 'Metróss', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
    { id: 2, name: 'Metrópolis', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
    { id: 3, name: 'Vallenato', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
  ]);

  const handleOpenAddModal = () => {
    setBranchToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch) => {
    setBranchToEdit(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBranchToEdit(null);
  };

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = branches.find((b) => Number(b.id) === Number(selectedId));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">Listado de Sucursales</h3>
          <p className="text-xs text-muted-foreground">Administra y configura las sucursales.</p>
        </div>
        <CinemaSearch 
          searchTerm={searchTerm}      
          setSearchTerm={setSearchTerm}
          onAddClick={handleOpenAddModal} 
        />
      </div>

      <CinemaTable 
        data={filteredBranches}
        selectedId={selectedId}
        onSelectBranch={(id) => { setSelectedId(id); setIsAddingRoom(false); }}
        onEdit={handleOpenEditModal}
        onDelete={(id) => console.log("Eliminando:", id)}
      />

      {/* SECCIÓN DE SALAS */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <RoomManager 
            branch={selectedBranch} 
            externalIsAdding={isAddingRoom}
            setExternalIsAdding={setIsAddingRoom}
          />
        ) : (
          <div className="py-20 bg-slate-50 text-center rounded-3xl border-2 border-dashed">
            <p className="text-slate-400 text-[10px] tracking-widest font-bold">SELECCIONA UNA SUCURSAL</p>
          </div>
        )}
      </div>

      {/* MODAL IMPLEMENTADO */}
      <EditCinema 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        initialData={branchToEdit} 
      />
    </div>
  );
};

export default CinemaPage;