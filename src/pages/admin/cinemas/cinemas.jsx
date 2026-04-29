import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../../../api/axios"; // Tu instancia de Axios
import CinemaSearch from "../../../components/admin/cinemas/SearchBar";
import CinemaTable from "../../../components/admin/cinemas/CinemaTable";
import RoomManager from "../../../components/admin/cinemas/RoomManager";
import EditCinema from "../../../components/admin/cinemas/BranchModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";

const CinemaPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletedItemName, setDeletedItemName] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);

  // 1. Cargar sucursales al montar el componente
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cinemas');
      setBranches(response.data);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAddModal = () => {
    setBranchToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch) => {
    setBranchToEdit(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    setBranchToEdit(null);
    if (shouldRefresh === true) fetchBranches(); // Refrescar si hubo cambios
  };

  // 2. Confirmar eliminación en el servidor
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/cinemas/${itemToDelete.id}`);
      setDeletedItemName(itemToDelete.name);
      
      if (selectedId === itemToDelete.id) setSelectedId(null);
      
      setIsDeleteModalOpen(false);
      setIsSuccessOpen(true);
      fetchBranches(); // Recargamos la lista
    } catch (error) {
      console.error("No se pudo eliminar:", error);
      alert("Error al eliminar la sucursal.");
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = branches.find((b) => Number(b.id) === Number(selectedId));

  const handleDeleteClick = (id) => {
    const branch = branches.find((b) => Number(b.id) === Number(id));
    if (branch) {
      setItemToDelete(branch);
      setIsDeleteModalOpen(true);
    }
  };

  if (loading && branches.length === 0) return <div className="p-10 text-center">Cargando sucursales...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">Listado de Sucursales</h3>
          <p className="text-xs text-muted-foreground">Administra y configura las sucursales.</p>
        </div>
        <CinemaSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAddClick={handleOpenAddModal} />
      </div>

      <CinemaTable 
        data={filteredBranches} 
        selectedId={selectedId} 
        onSelectBranch={(id) => { setSelectedId(id); setIsAddingRoom(false); }}
        onEdit={handleOpenEditModal} 
        onDelete={handleDeleteClick} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        itemName={itemToDelete?.name} 
      />

      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
        title="¡Sucursal Eliminada!" 
        message={`Se ha removido "${deletedItemName}" exitosamente.`} 
      />

      {/* Sección de Salas */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
              <h3 className="text-lg font-montserrat font-bold text-slate-800">
                Salas en / <span className="text-brand-primary">{selectedBranch.name}</span>
              </h3>
              <button onClick={() => setIsAddingRoom(true)} className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> AGREGAR SALA
              </button>
            </div>
            <RoomManager branch={selectedBranch} externalIsAdding={isAddingRoom} setExternalIsAdding={setIsAddingRoom} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
            <Plus className="h-8 w-8 text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[10px] tracking-widest">Selecciona una sucursal para ver sus salas.</p>
          </div>
        )}
      </div>

      <EditCinema open={isModalOpen} onClose={handleCloseModal} initialData={branchToEdit} />
    </div>
  );
};

export default CinemaPage;