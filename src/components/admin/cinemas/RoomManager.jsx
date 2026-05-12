import { useState, useEffect } from "react";
import { Presentation, Plus, Square, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import SeatGridDesigner from "./SeatGridDesigner";
import { useLoading } from "../../../context/LoadingContext";
import { getRoomsByCinema, deleteRoom, saveRoom, createRoomSeats } from "../../../services/room.service";

export default function RoomManager({ branch, externalIsAdding, setExternalIsAdding }) {
  const { showLoader, hideLoader } = useLoading();
  const [rooms, setRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isLayoutValid, setIsLayoutValid] = useState(false);
  const [roomLayout, setRoomLayout] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    rows: "",
    cols: "",
    projectionType: "1", // Inicializado con el ID 1 (2D Digital)
  });

  const fetchRooms = async () => {
    if (!branch?.id) return;
    try {
      showLoader();
      const data = await getRoomsByCinema(branch.id);
      setRooms(data);
    } catch (error) {
      console.error("Error al obtener salas:", error);
      setRooms([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (branch?.id) {
      resetForm();
      fetchRooms();
    }
  }, [branch?.id]);

  const resetForm = () => {
    setExternalIsAdding(false);
    setEditingRoomId(null);
    setFormData({ name: "", rows: "", cols: "", projectionType: "1" });
    setIsLayoutValid(false);
    setRoomLayout([]);
  };

  const handleEditRoom = (room) => {
    setFormData({
      name: room.name,
      rows: room.gridRows?.toString() || room.grid_rows?.toString() || "",
      cols: room.gridColumns?.toString() || room.grid_columns?.toString() || "",
      projectionType: room.projectionTypes?.[0]?.toString() || "1",
    });
    
    // Aquí deberías procesar el layout si viene del backend como lista de asientos
    setRoomLayout(room.layout || []); 
    setIsLayoutValid(true);
    setEditingRoomId(room.id);
    setExternalIsAdding(true);
  };

  const handleSaveRoom = async () => {
    try {
      showLoader();

      // 1. Preparar Asientos con mapeo de IDs de condición y categoría
      const formattedSeats = [];
      roomLayout.forEach((row, rowIndex) => {
        row.forEach((seat, colIndex) => {
          let conditionId = seat.condition; 
          if (seat.type === 'empty') {
            conditionId = 3; // ID para Pasillo
          }

          formattedSeats.push({
            rowIdentifier: String.fromCharCode(65 + rowIndex),
            columnNumber: colIndex + 1,
            seatCategoryId: seat.category,   // 1=normal, 2=discapacitado
            seatConditionId: conditionId     // 1=normal, 2=mantenimiento, 3=pasillo
          });
        });
      });

      // 2. Construir el Payload de la Sala (CamelCase según el error de validación)
      const roomPayload = {
        name: formData.name,
        gridRows: parseInt(formData.rows),
        gridColumns: parseInt(formData.cols),
        // Capacidad real: solo asientos que NO son pasillos (condición 3)
        totalCapacity: formattedSeats.filter(s => s.seatConditionId !== 3).length,
        projectionTypes: [parseInt(formData.projectionType)], 
      };

      let roomId = editingRoomId;

      // 3. Guardar o Actualizar Sala
      if (editingRoomId) {
        await saveRoom(branch.id, roomPayload, editingRoomId);
      } else {
        const roomResponse = await saveRoom(branch.id, roomPayload);
        // Extraer ID (ajusta según la estructura de tu respuesta de API)
        roomId = roomResponse.id || roomResponse.data?.id;
      }

      // 4. Guardar los asientos vinculados a la sala
      if (roomId && formattedSeats.length > 0) {
        await createRoomSeats(roomId, formattedSeats);
      }

      setIsSuccessOpen(true);
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error en el proceso de guardado:", error.response?.data || error);
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
      setRoomToDelete(null);
      setIsSuccessOpen(true);
      fetchRooms();
    } catch (error) {
      console.error("Error al eliminar la sala:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[400px]">
      
      {!externalIsAdding && (
        <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
          <div>
            <h3 className="text-lg font-montserrat font-bold text-brand-primary">
              Salas de {branch?.name || "Sucursal"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Administra la configuración de asientos y tipos de proyección por sala
            </p>
          </div>

          <button
            onClick={() => setExternalIsAdding(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-2 border-purple-400/30 font-montserrat"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            Añadir Sala
          </button>
        </div>
      )}

      {externalIsAdding ? (
        <div className="bg-gray-50 p-6 rounded-cineflix border border-gray-200 shadow-inner">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            <Square className="text-brand-primary h-6 w-6 fill-brand-primary" />
            <h3 className="text-lg font-montserrat font-bold text-gray-800">
              {editingRoomId ? "Editar Sala" : "Registrar Nueva Sala"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la sala</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none font-montserrat"
                placeholder="Ej: Sala 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo de Proyección</label>
                <select
                  value={formData.projectionType}
                  onChange={(e) => setFormData({ ...formData, projectionType: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none bg-white font-montserrat"
                >
                  <option value="1">2D Digital</option>
                  <option value="2">3D Digital</option>
                  <option value="3">IMAX</option>
                  <option value="4">4DX</option>
                </select>
            </div>
          </div>

          <SeatGridDesigner
            key={editingRoomId || "new"}
            externalFormData={formData} 
            setExternalFormData={setFormData}
            initialLayout={roomLayout}
            onValidationChange={(isValid, layout) => {
              setIsLayoutValid(isValid);
              setRoomLayout(layout);
            }}
          />

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button
              onClick={handleSaveRoom}
              disabled={!isLayoutValid || !formData.name}
              className={`text-white font-bold font-montserrat ${!isLayoutValid ? "bg-gray-400" : "bg-brand-primary hover:bg-brand-primary/90"}`}
            >
              {editingRoomId ? "Actualizar Sala" : "Guardar Sala"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-500">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 p-4 rounded-cineflix flex justify-between items-center bg-white shadow-sm hover:border-brand-primary/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-brand-primary">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-primary font-montserrat">{room.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-montserrat">
                          Capacidad: {room.totalCapacity || room.total_capacity || "--"}
                        </span>
                        <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider font-montserrat">
                          {room.projection_type || (room.projectionTypes?.[0]?.description) || "2D"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditRoom(room)} className="text-blue-600 hover:bg-blue-50 font-montserrat">Editar</Button>
                    <Button size="icon" variant="ghost" onClick={() => { setRoomToDelete({id: room.id, name: room.name}); setIsDeleteModalOpen(true); }} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Presentation className="h-10 w-10 text-slate-300" />
              </div>
              <h4 className="text-slate-500 font-bold font-montserrat uppercase text-[11px] tracking-[0.2em]">
                No hay salas asignadas
              </h4>
              <p className="text-slate-400 text-[10px] mt-2 max-w-[200px] text-center leading-relaxed font-montserrat">
                Parece que esta sede aún no tiene espacios configurados.
              </p>
            </div>
          )}
        </>
      )}

      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDeleteRoom} itemName={roomToDelete?.name} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title="¡Éxito!" message="Operación realizada correctamente." />
    </div>
  );
}