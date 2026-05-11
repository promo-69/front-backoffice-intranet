import React, { useState, useEffect } from "react";
import api from "@/api/axios";

import { Plus, ChevronLeft, ChevronRight } from "lucide-react"; // Importamos iconos para los botones
import { getCinemas, deleteCinema } from "../../../services/cinema.service";
import CinemaSearch from "../../../components/admin/cinemas/SearchBar";
import CinemaTable from "../../../components/admin/cinemas/CinemaTable";
import RoomManager from "../../../components/admin/cinemas/RoomManager";
import BranchModal from "../../../components/admin/cinemas/BranchModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { useLoading } from "../../../context/LoadingContext";

const CinemaPage = () => {
  const { showLoader, hideLoader } = useLoading();
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ESTADOS DE PAGINACIÓN
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);

  // Estados para el Modal de Éxito Dinámico
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchBranches = async (page = 1) => {
    try {
      showLoader(); // Mostramos loader mientras esperamos los 10s o lo que tarde
      const data = await getCinemas(page);
      setBranches(data.data);
      setMetadata(data.metadata);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      setBranches([]);
    } finally {
      hideLoader();
    }
  };

  // Efecto que reacciona al cambio de página
  useEffect(() => {
    fetchBranches(currentPage);
  }, [currentPage]);

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
    if (shouldRefresh) {
      fetchBranches(currentPage); // Refrescamos la página actual
      setSuccessConfig({
        title: branchToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: branchToEdit 
          ? "La información de la sucursal ha sido actualizada." 
          : "La nueva sede ha sido incorporada al sistema correctamente."
      });
      setIsSuccessOpen(true);
    }
    setBranchToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteCinema(itemToDelete.id);
      if (selectedId === itemToDelete.id) setSelectedId(null);
      
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Sucursal Eliminada!",
        message: `Se ha removido "${itemToDelete.name}" exitosamente.`
      });
      setIsSuccessOpen(true);
      fetchBranches(currentPage);
    } catch (error) {
      console.error("No se pudo eliminar:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const filteredBranches = (Array.isArray(branches) ? branches : []).filter((b) =>
    b.name?.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const selectedBranch = (Array.isArray(branches) ? branches : []).find(
    (b) => Number(b.id) === Number(selectedId)
  );

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
        onDelete={(id) => {
          const branch = branches.find(b => b.id === id);
          setItemToDelete(branch);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!metadata.prev_page}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!metadata.next_page}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(currentPage - 1) * metadata.per_page + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(currentPage * metadata.per_page, metadata.total)}
              </span>{" "}
              de <span className="font-medium">{metadata.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(metadata.prev_page)}
                disabled={!metadata.prev_page}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">
                Página {metadata.current_page} de {metadata.total_pages}
              </div>

              <button
                onClick={() => setCurrentPage(metadata.next_page)}
                disabled={!metadata.next_page}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* MODALES DE INTERACCIÓN */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />

      <BranchModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={branchToEdit}
      />

      {/* Sección de salas */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
             <RoomManager branch={selectedBranch} externalIsAdding={isAddingRoom} setExternalIsAdding={setIsAddingRoom} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 text-slate-400 uppercase text-[10px] tracking-widest font-bold">
            <Plus className="h-8 w-8 mb-4 opacity-20" />
            Selecciona una sucursal para ver sus salas.
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;