import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // ESTADOS DE DATOS Y PAGINACIÓN
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_pages: 1,
    next_page: null,
    prev_page: null,
    total: 0
  });

  // ESTADOS DE MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });
  
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  // FUNCIÓN PARA CARGAR SUCURSALES (Consumiendo la paginación de la API)
  const fetchBranches = async (page = 1) => {
    try {
      showLoader();
      const response = await getCinemas(page);
      
      // Ajuste según tu estructura JSON: { success, message, data: [], metadata: {} }
      setBranches(response.data || []);
      setPagination(response.metadata || { total_pages: 1 });
      setCurrentPage(response.metadata?.current_page || page);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      setBranches([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchBranches(currentPage);
  }, [currentPage]);

  // NAVEGACIÓN DE PÁGINAS
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  // MANEJO DE EDICIÓN (Limpieza de horas)
  const handleOpenEditModal = (branch) => {
    const mappedData = {
      ...branch,
      // Quitamos los segundos (:00) para que el input tipo HH:mm no falle
      openingTime: (branch.opening_time || "").slice(0, 5),
      closingTime: (branch.closing_time || "").slice(0, 5),
    };
    setBranchToEdit(mappedData);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchBranches(currentPage); // Refresca la página actual
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
      console.error("Error al eliminar:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = branches.find(
    (b) => Number(b.id) === Number(selectedId)
  );

  return (
    <div className="space-y-6">
      {/* HEADER Y BÚSQUEDA */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary uppercase tracking-tight">
            Listado de Sucursales
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Gestión de Sedes y Horarios
          </p>
        </div>
        <CinemaSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onAddClick={() => { setBranchToEdit(null); setIsModalOpen(true); }} 
        />
      </div>

      {/* TABLA DE DATOS */}
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
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-cineflix border border-border shadow-sm">
        <span className="text-xs font-montserrat text-slate-500 font-medium">
          Total: {pagination.total} sucursales
        </span>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.prev_page}
            className="p-1.5 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-brand-primary" />
          </button>

          <div className="flex gap-1">
            {[...Array(pagination.total_pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.next_page}
            className="p-1.5 rounded-lg border border-border hover:bg-slate-50 disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-brand-primary" />
          </button>
        </div>
      </div>

      {/* MODALES */}
      <BranchModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={branchToEdit}
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
        title={successConfig.title}
        message={successConfig.message}
      />

      {/* SECCIÓN DE SALAS (DETALLE) */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
              <h3 className="text-lg font-montserrat font-bold text-slate-800">
                Salas en / <span className="text-brand-primary">{selectedBranch.name}</span>
              </h3>
              <button 
                onClick={() => setIsAddingRoom(true)} 
                className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
              >
                <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
                AGREGAR SALA
              </button>
            </div>
            <RoomManager 
              branch={selectedBranch} 
              externalIsAdding={isAddingRoom} 
              setExternalIsAdding={setIsAddingRoom} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
            <Plus className="h-8 w-8 text-slate-300 mb-4 opacity-50" />
            <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[10px] tracking-widest leading-relaxed">
              Selecciona una sucursal de la lista para gestionar sus salas disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;