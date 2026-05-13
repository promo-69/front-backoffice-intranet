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
  createRoomSeats, 
  getSeatsByRoom 
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
      setRooms(data);
    } catch (error) {
      console.error("Error al obtener salas:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (branch?.id) fetchRooms();
  }, [branch?.id]);

  const handleEditClick = async (room) => {
    try {
      showLoader();
      
      // Normalización de snake_case (API) a variables locales
      const rows = parseInt(room.grid_rows) || 8;
      const cols = parseInt(room.grid_columns) || 12;

      setEditingRoomId(room.id);
      setFormData({
        name: room.name || "",
        rows: String(rows),
        cols: String(cols),
        // Nota: Asegúrate de que tu API devuelva projection_types si vas a usarlo aquí
        projectionType: String(room.projection_types?.[0]?.id || "1"),
      });

      const savedSeats = await getSeatsByRoom(room.id);

        console.log("ROOM EDIT DATA");
        console.log("ROOM:", room);
        console.log("SEATS:", savedSeats);
      
      const newLayout = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          type: "seat",
          category: 1,
          condition: 1,
        }))
      );

      const seatsArray = savedSeats?.data?.rows || [];

        if (Array.isArray(seatsArray)) {

          seatsArray.forEach((seat) => {

            const rowIndex =
              seat.row_identifier.charCodeAt(0) - 65;

            const colIndex =
              seat.column_number - 1;

            if (
              newLayout[rowIndex] &&
              newLayout[rowIndex][colIndex]
            ) {

              newLayout[rowIndex][colIndex] = {
                type:
                  seat.seat_condition === 3
                    ? "empty"
                    : "active",

                category:
                  seat.seat_category || 1,

                condition:
                  seat.seat_condition || 1,
              };
            }
          });
        }

      setRoomLayout(newLayout);
      setExternalIsAdding(true);
    } catch (error) {
      console.error("Error al cargar sala:", error);
      alert("No se pudo procesar la configuración de la sala.");
    } finally {
      hideLoader();
    }
  };

  const resetForm = () => {
    setExternalIsAdding(false);
    setEditingRoomId(null);
    setFormData({ name: "", rows: "8", cols: "12", projectionType: "1" });
    setRoomLayout([]);
  };

  const handleProcessChain = async () => {
    if (!formData.name) return alert("Asigna un nombre.");
    try {
      showLoader();
      
      const roomPayload = {
        name: formData.name,
        projectionTypes: [parseInt(formData.projectionType)],
        gridRows: parseInt(formData.rows),
        gridColumns: parseInt(formData.cols),
        totalCapacity: theoreticalCapacity
      };

      const response = await saveRoom(branch.id, roomPayload);
      const newRoomId = response?.data?.id || response?.id || response?.data?.room_id;

      if (!newRoomId) throw new Error("ID de sala no generado");

      const seatsToCreate = [];
      roomLayout.forEach((row, rowIndex) => {
        row.forEach((seat, colIndex) => {
          seatsToCreate.push({
            rowIdentifier: String.fromCharCode(65 + rowIndex),
            columnNumber: colIndex + 1,
            seatCategory: Number(seat.category),
            seatCondition: seat.type === 'empty' ? 3 : Number(seat.condition)
          });
        });
      });

      for (const seatData of seatsToCreate) {
        await createRoomSeats(newRoomId, seatData);
      }

      setSuccessConfig({
        open: true,
        title: "¡Guardado!",
        message: editingRoomId ? "La sala se ha actualizado correctamente." : "La sala se ha registrado con éxito."
      });
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error en proceso:", error);
      alert("Error al procesar la solicitud.");
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
            {rooms.map((room) => (
              <div key={room.id} className="border border-slate-100 p-4 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:border-brand-primary/20 transition-all">
                <div>
                  <h4 className="font-bold text-brand-primary font-montserrat text-sm">{room.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                    {/* Corrección de NaN: Leemos snake_case directamente del objeto room */}
                    ID: {room.id} | Capacidad: {room.total_capacity || (room.grid_rows * room.grid_columns) || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleEditClick(room)} 
                    className="h-8 w-8 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white rounded-lg transition-all"
                  >
                    <Pencil className="h-4 w-4" />
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
            ))}
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
            externalFormData={formData}
            setExternalFormData={setFormData}
            initialLayout={roomLayout} 
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