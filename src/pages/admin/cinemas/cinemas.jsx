import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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

  // Estados para Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);

  // Estados para el Modal de Éxito Dinámico
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchBranches = async () => {
    try {
      const data = await getCinemas();
      setBranches(data);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      setBranches([]);
    }
  };

  useEffect(() => {
    showLoader();
    fetchBranches().finally(() => hideLoader());
  }, []);

  const handleOpenAddModal = () => {
    setBranchToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch) => {
    setBranchToEdit(branch);
    setIsModalOpen(true);
  };

  // Función actualizada para manejar el éxito tras cerrar el formulario
  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchBranches();
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
      fetchBranches();
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

      {/* Sección de salas (sin cambios) */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
             {/* ... contenido de RoomManager ... */}
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