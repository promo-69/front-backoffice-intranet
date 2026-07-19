import React, { useState, useEffect } from "react";
import api from "@/api/axios";

import { Plus, ChevronLeft, ChevronRight } from "lucide-react"; 
import { getCinemas, deleteCinema } from "../../../services/cinema.service";
import CinemaSearch from "../../../components/admin/cinemas/SearchBar";
import CinemaTable from "../../../components/admin/cinemas/CinemaTable";
import RoomManager from "../../../components/admin/cinemas/RoomManager";
import BranchModal from "../../../components/admin/cinemas/BranchModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";

const CinemaPage = () => {
  // ESTADO LOCAL DE CARGA
  const [loading, setLoading] = useState(true);
  
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });
  
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  const fetchBranches = async (params) => {
    try {
      setLoading(true); // Activa el esqueleto de la tabla
      const data = await getCinemas(params);
      setBranches(data.data);
      setMetadata(data.metadata);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      setBranches([]);
    } finally {
      setLoading(false); // Desactiva el esqueleto
    }
  };

  useEffect(() => {
    fetchBranches({ page: currentPage });
  }, [currentPage]); 

  const branchesFiltradas = branches.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= metadata.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenEditModal = (branch) => {
    const mappedData = {
      ...branch,
      openingTime: (branch.opening_time || "").slice(0, 5),
      closingTime: (branch.closing_time || "").slice(0, 5),
    };
    setBranchToEdit(mappedData);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchBranches({ page: currentPage });
      setSuccessConfig({
        title: branchToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: branchToEdit 
          ? "La información de la sucursal ha sido actualizada." 
          : "La nueva sede ha sido incorporada al sistema."
      });
      setIsSuccessOpen(true);
    }
    setBranchToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteCinema(itemToDelete.id);
      if (selectedId === itemToDelete.id) setSelectedId(null);
      
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Sucursal Eliminada!",
        message: `Se ha removido "${itemToDelete.name}" exitosamente.`
      });
      setIsSuccessOpen(true);
      fetchBranches({ page: currentPage });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setLoading(false);
    } finally {
      setItemToDelete(null);
    }
  };

  const selectedBranch = branches.find(
    (b) => Number(b.id) === Number(selectedId)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">Listado de Sucursales</h3>
          <p className="text-xs text-muted-foreground">Administra las sucursales de Cineflix.</p>
        </div>
        <CinemaSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onAddClick={() => { setBranchToEdit(null); setIsModalOpen(true); }} 
        />
      </div>

      {/* PASAMOS LOADING A LA TABLA */}
      <CinemaTable
        data={branchesFiltradas} 
        isLoading={loading}
        selectedId={selectedId}
        onSelectBranch={(id) => { setSelectedId(id); setIsAddingRoom(false); }}
        onEdit={handleOpenEditModal}
        onDelete={(id) => {
          const branch = branches.find(b => b.id === id);
          setItemToDelete(branch);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* PAGINACIÓN */}
      {!loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm animate-in fade-in">
           <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * metadata.per_page + 1}</span> a{" "}
              <span className="font-medium">{Math.min(currentPage * metadata.per_page, metadata.total)}</span> de <span className="font-medium">{metadata.total}</span> resultados
            </p>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
              <button onClick={() => handlePageChange(metadata.prev_page)} disabled={!metadata.prev_page} className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white disabled:opacity-50"><ChevronLeft className="h-5 w-5"/></button>
              <div className="px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">Página {metadata.current_page} de {metadata.total_pages}</div>
              <button onClick={() => handlePageChange(metadata.next_page)} disabled={!metadata.next_page} className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white disabled:opacity-50"><ChevronRight className="h-5 w-5"/></button>
            </nav>
          </div>
        </div>
      )}

      {/* MODALES */}
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={itemToDelete?.name} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title={successConfig.title} message={successConfig.message} />
      <BranchModal open={isModalOpen} onClose={handleCloseModal} initialData={branchToEdit} />

      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div key={selectedBranch.id} className="animate-in fade-in slide-in-from-bottom-4">
            <RoomManager branch={selectedBranch} externalIsAdding={isAddingRoom} setExternalIsAdding={setIsAddingRoom} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
            <Plus className="h-8 w-8 text-slate-300 mb-4 opacity-50" />
            <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[10px] tracking-widest">Selecciona una sucursal para gestionar sus salas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;