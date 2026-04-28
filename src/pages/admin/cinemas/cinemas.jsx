import React, { useState } from "react";
import { Plus } from "lucide-react";
import CinemaSearch from "../../../components/admin/cinemas/SearchBar";
import CinemaTable from "../../../components/admin/cinemas/CinemaTable";
import RoomManager from "../../../components/admin/cinemas/RoomManager";
import EditCinema from "../../../components/admin/cinemas/BranchModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";

const CinemaPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletedItemName, setDeletedItemName] = useState(""); // ✅ fix UX
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);

  const [branches, setBranches] = useState([
    { id: 1, name: "Sambil Barquisimeto", address: "Av. Venezuela, C.C. Sambil", phone: "0251-1234567", opening_time: "10:00 AM", closing_time: "11:00 PM", status: "Activo" },
    { id: 2, name: "Metrópolis", address: "Av. Florencio Jiménez", phone: "0251-7654321", opening_time: "11:00 AM", closing_time: "09:00 PM", status: "Activo" },
    { id: 3, name: "Vallenato", address: "Av. Florencio Jiménez", phone: "0251-7654321", opening_time: "11:00 AM", closing_time: "09:00 PM", status: "Activo" },
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

  const selectedBranch = branches.find(
    (b) => Number(b.id) === Number(selectedId)
  );

  const handleDeleteClick = (id) => {
    const branch = branches.find((b) => Number(b.id) === Number(id));
    if (branch) {
      setItemToDelete(branch);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    const updatedBranches = branches.filter(
      (b) => b.id !== itemToDelete.id
    );

    setDeletedItemName(itemToDelete.name);
    setBranches(updatedBranches);

    if (selectedId === itemToDelete.id) {
      setSelectedId(null);
    }

    setIsDeleteModalOpen(false);
    setIsSuccessOpen(true);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Listado de Sucursales
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra y configura las sucursales.
          </p>
        </div>

        <CinemaSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={handleOpenAddModal}
        />
      </div>

      {/* TABLA */}
      <CinemaTable
        data={filteredBranches}
        selectedId={selectedId}
        onSelectBranch={(id) => {
          setSelectedId(id);
          setIsAddingRoom(false);
        }}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteClick}
      />

      {/* MODALES */}
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

      {/* SALAS */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
              <div>
                <h3 className="text-lg font-montserrat font-bold text-slate-800">
                  Salas en /{" "}
                  <span className="text-brand-primary">
                    {selectedBranch.name}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configura la capacidad y disponibilidad de las salas.
                </p>
              </div>

              <button
                onClick={() => setIsAddingRoom(true)}
                className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
                AGREGAR SALA
              </button>
            </div>

            <RoomManager
              key={selectedBranch.id}
              branch={selectedBranch}
              externalIsAdding={isAddingRoom}
              setExternalIsAdding={setIsAddingRoom}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
            <Plus className="h-8 w-8 text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[10px] tracking-widest">
              Selecciona una sucursal para ver sus salas.
            </p>
          </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      <EditCinema
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={branchToEdit}
      />
    </div>
  );
};

export default CinemaPage;