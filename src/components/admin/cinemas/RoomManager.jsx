import { useState, useEffect } from "react";
import { Plus, Square, Trash2, CheckCircle2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import SeatGridDesigner from "./SeatGridDesigner";
import { useLoading } from "../../../context/LoadingContext";
import { 
  getRoomsByCinema, 
  deleteRoom, 
  saveRoom, 
  updateRoom,
  createRoomSeats, 
  getSeatsByRoom,
  updateSeatIndividual
} from "../../../services/room.service";

export default function RoomManager({ branch, externalIsAdding, setExternalIsAdding }) {
  const { showLoader, hideLoader } = useLoading();
  const [rooms, setRooms] = useState([]);
  
  const [successConfig, setSuccessConfig] = useState({ open: false, title: "", message: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [isLayoutValid, setIsLayoutValid] = useState(false);
  const [roomLayout, setRoomLayout] = useState([]);
  // Guardamos el estado inicial exacto de los asientos al entrar a editar
  const [originalSeatsSnapshot, setOriginalSeatsSnapshot] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    rows: "8",
    cols: "12",
    projectionType: "1",
  });

  const theoreticalCapacity = (parseInt(formData.rows) || 0) * (parseInt(formData.cols) || 0);

  const fetchRooms = async () => {
    if (!branch?.id) return;
    try {
      showLoader();
      const data = await getRoomsByCinema(branch.id);
      const filteredRooms = data.filter(room => Number(room.cinema) === Number(branch.id));
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Error al obtener salas:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (branch?.id) {
      setRooms([]);
      fetchRooms();
    }
  }, [branch?.id]);

  const handleEditClick = async (room) => {
    try {
      showLoader();
      const rows = parseInt(room.grid_rows) || 8;
      const cols = parseInt(room.grid_columns) || 12;

      const savedSeatsResponse = await getSeatsByRoom(room.id);
      const seatsArray = savedSeatsResponse?.data?.rows || [];

      const newLayout = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          type: "active",
          category: 1,
          condition: 1,
        }))
      );

      seatsArray.forEach((seat) => {
        const rowIndex = seat.row_identifier.toUpperCase().charCodeAt(0) - 65;
        const colIndex = parseInt(seat.column_number) - 1;
        if (newLayout[rowIndex] && newLayout[rowIndex][colIndex]) {
          newLayout[rowIndex][colIndex] = {
            id: seat.id, 
            type: seat.seat_condition === 3 ? "empty" : "active",
            category: seat.seat_category || 1,
            condition: seat.seat_condition || 1,
          };
        }
      });

      setFormData({
        name: room.name || "",
        rows: String(rows),
        cols: String(cols),
        projectionType: String(room.projection_types?.[0]?.id || "1"),
      });
      
      setRoomLayout(newLayout);
      // Guardamos una copia profunda limpia para comparar modificaciones después
      setOriginalSeatsSnapshot(JSON.parse(JSON.stringify(newLayout)));
      
      setEditingRoomId(room.id);
      setExternalIsAdding(true);
    } catch (error) {
      console.error("Error al cargar sala:", error);
    } finally {
      hideLoader();
    }
  };

  const resetForm = () => {
    setExternalIsAdding(false);
    setEditingRoomId(null);
    setFormData({ name: "", rows: "8", cols: "12", projectionType: "1" });
    setRoomLayout([]);
    setOriginalSeatsSnapshot([]);
  };

  const handleProcessChain = async () => {
    if (!formData.name) return alert("Asigna un nombre.");
    try {
      showLoader();

      if (editingRoomId) {
        // ==========================================
        // FLUJO DE EDICIÓN (PATCH ANIDADO OPTIMIZADO)
        // ==========================================
        
        const updatePayload = {
          name: formData.name,
          projectionTypes: [parseInt(formData.projectionType)],
          totalCapacity: theoreticalCapacity
        };

        // 1. Actualizar metadatos de la sala
        await updateRoom(editingRoomId, updatePayload);

        // 2. Filtrar y enviar ÚNICAMENTE los asientos que cambiaron de estado o categoría
        const seatUpdates = [];

        roomLayout.forEach((row, rowIndex) => {
          row.forEach((seat, colIndex) => {
            const originalSeat = originalSeatsSnapshot[rowIndex]?.[colIndex];

            if (originalSeat && seat.id) {
              const currentCondition = seat.type === 'empty' ? 3 : Number(seat.condition);
              const originalCondition = originalSeat.type === 'empty' ? 3 : Number(originalSeat.condition);
              const currentCategory = Number(seat.category);
              const originalCategory = Number(originalSeat.category);

              // Dirty checking: ¿Hubo algún cambio real en este asiento específico?
              if (currentCondition !== originalCondition || currentCategory !== originalCategory) {
                const updateSeatPayload = {
                  seatCategory: currentCategory,
                  seatCondition: currentCondition
                };
                // Encolamos la promesa de actualización
                seatUpdates.push(updateSeatIndividual(seat.id, updateSeatPayload));
              }
            }
          });
        });

        // Solo disparamos llamadas a la API si hay cambios reales en el diseño
        if (seatUpdates.length > 0) {
          await Promise.all(seatUpdates);
        }

      } else {
        // ==========================================
        // FLUJO DE CREACIÓN
        // ==========================================
        const seatsArray = [];
        roomLayout.forEach((row, rowIndex) => {
          row.forEach((seat, colIndex) => {
            seatsArray.push({
              rowIdentifier: String.fromCharCode(65 + rowIndex),
              columnNumber: colIndex + 1,
              seatCategory: Number(seat.category),
              seatCondition: seat.type === 'empty' ? 3 : Number(seat.condition),
            });
          });
        });

        const roomPayload = {
          name: formData.name,
          projectionTypes: [parseInt(formData.projectionType)],
          gridRows: parseInt(formData.rows),
          gridColumns: parseInt(formData.cols),
          totalCapacity: theoreticalCapacity,
        };

        const response = await saveRoom(branch.id, { ...roomPayload, seats: seatsArray });
        const newRoomId = response?.data?.id || response?.id || response?.data?.room_id || response?.room?.id;
        
        if (newRoomId) {
          await createRoomSeats(newRoomId, seatsArray);
        }
      }

      setSuccessConfig({
        open: true,
        title: "¡Guardado!",
        message: editingRoomId 
          ? "La sala y los asientos modificados se actualizaron correctamente." 
          : "La sala y sus asientos se registraron exitosamente."
      });
      
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error en la transacción de guardado:", error);
    } finally {
      hideLoader();
    }
  };

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      showLoader();
      await deleteRoom(roomToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        open: true,
        title: "Eliminado",
        message: `La sala "${roomToDelete.name}" ha sido eliminada.`
      });
      fetchRooms();
    } catch (error) { 
      console.error(error); 
    } finally { 
      hideLoader(); 
      setRoomToDelete(null); 
    }
  };

  return (
    <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[400px]">
      {!externalIsAdding ? (
        <>
          <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
            <div>
              <h3 className="text-lg font-montserrat font-bold text-brand-primary">Salas Registradas</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Gestión de aforo y tecnología por sala</p>
            </div>
            <button
              onClick={() => setExternalIsAdding(true)}
              className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase font-montserrat"
            >
              <Plus className="w-4 h-4 text-brand-gold" /> Añadir Sala
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className="border border-slate-100 p-4 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:border-brand-primary/20 transition-all">
                  <div>
                    <h4 className="font-bold text-brand-primary font-montserrat text-sm">{room.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      ID: {room.id} | Capacidad: {room.total_capacity || (room.grid_rows * room.grid_columns) || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEditClick(room)} 
                      className="h-8 w-8 text-brand-primary bg-slate-50 hover:bg-brand-primary hover:text-white rounded-lg transition-all"
                    >
                      <Pencil className="h-4 h-4" />
                    </Button>

                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => { setRoomToDelete(room); setIsDeleteModalOpen(true); }} 
                      className="h-8 w-8 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Square className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-slate-500 font-bold text-sm font-montserrat">No hay salas registradas</h4>
                <p className="text-slate-400 text-[11px] mt-1">Comienza añadiendo una nueva sala para gestionar el aforo.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[11px] font-black uppercase text-brand-primary flex items-center gap-2">
                <Square className="w-4 h-4 fill-brand-primary" /> 
                {editingRoomId ? "Editando Configuración" : "Nueva Sala"}
              </h3>
              <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 w-8 p-0 text-slate-400">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-xl text-sm outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Proyección</label>
                <select
                  value={formData.projectionType}
                  onChange={(e) => setFormData({ ...formData, projectionType: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-xl text-sm bg-white"
                >
                  <option value="1">2D Digital</option>
                  <option value="2">3D Digital</option>
                  <option value="3">IMAX</option>
                </select>
              </div>
              <div className="bg-white border p-2 rounded-xl text-center">
                <span className="text-[9px] block font-bold text-slate-300 uppercase">Grid</span>
                <span className="font-bold text-slate-600 text-xs">{formData.rows}x{formData.cols}</span>
              </div>
              <div className="bg-brand-primary/5 border border-brand-primary/10 p-2 rounded-xl text-center">
                <span className="text-[9px] block font-bold text-brand-primary uppercase">Capacidad</span>
                <span className="font-black text-brand-primary text-xs">{theoreticalCapacity}</span>
              </div>
            </div>
          </div>

          <SeatGridDesigner
            key={editingRoomId || 'new-room'}
            externalFormData={formData}
            setExternalFormData={setFormData}
            initialLayout={roomLayout} 
            isEdit={!!editingRoomId} 
            onValidationChange={(isValid, layout) => {
              setIsLayoutValid(isValid);
              setRoomLayout(layout);
            }}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <Button variant="outline" onClick={resetForm} className="rounded-xl px-6">Cancelar</Button>
            <Button
              onClick={handleProcessChain}
              disabled={!isLayoutValid || !formData.name}
              className="bg-brand-primary text-white rounded-xl px-8 font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> 
              {editingRoomId ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDeleteRoom} 
        itemName={roomToDelete?.name} 
      />
      
      <SuccessModal 
        isOpen={successConfig.open} 
        onClose={() => setSuccessConfig({ ...successConfig, open: false })} 
        title={successConfig.title} 
        message={successConfig.message} 
      />
    </div>
  );
}