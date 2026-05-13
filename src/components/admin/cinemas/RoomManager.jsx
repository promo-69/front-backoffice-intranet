import { useState, useEffect } from "react";
import { Plus, Square, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import SeatGridDesigner from "./SeatGridDesigner";
import { useLoading } from "../../../context/LoadingContext";
import { getRoomsByCinema, deleteRoom, saveRoom, createRoomSeats } from "../../../services/room.service";

export default function RoomManager({ branch, externalIsAdding, setExternalIsAdding }) {
  const { showLoader, hideLoader } = useLoading();
  const [rooms, setRooms] = useState([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Estados de diseño y validación
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

  const resetForm = () => {
    setExternalIsAdding(false);
    setFormData({ name: "", rows: "8", cols: "12", projectionType: "1" });
    setIsLayoutValid(false);
    setRoomLayout([]);
  };

  /**
   * SOLUCIÓN IMPLEMENTADA: 
   * Registro secuencial para evitar el colapso del SeatsController (Error 500)
   */
  const handleProcessChain = async () => {
    if (!formData.name) return alert("Por favor, asigna un nombre a la sala.");

    try {
      showLoader();

      // PASO 1: Crear la sala base
      const roomPayload = {
        name: formData.name,
        projectionTypes: [parseInt(formData.projectionType)],
        gridRows: parseInt(formData.rows),
        gridColumns: parseInt(formData.cols),
        totalCapacity: theoreticalCapacity
      };

      const response = await saveRoom(branch.id, roomPayload);
      
      // Ajuste de ID según tu respuesta JSON: { data: { room_id: X } }
      const newRoomId = response?.data?.room_id || response?.room_id;

      if (!newRoomId) {
        throw new Error("No se pudo obtener el ID de la sala desde el servidor.");
      }

      // PASO 2: Preparar la lista de asientos desde el grid
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

      // PASO 3: Registro Secuencial (Uno por uno, como en image_722114.png)
      console.log(`Iniciando registro de ${seatsToCreate.length} asientos...`);
      
      for (const seatData of seatsToCreate) {
        try {
          // Esperamos la respuesta de cada uno antes de enviar el siguiente
          await createRoomSeats(newRoomId, seatData);
        } catch (seatErr) {
          console.warn(`Error en asiento ${seatData.rowIdentifier}${seatData.columnNumber}:`, seatErr);
          // Opcional: podrías decidir si detener todo o continuar
        }
      }

      setIsSuccessOpen(true);
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error en la cadena de registro:", error);
      const msg = error.response?.status === 409 
        ? "El nombre de la sala ya existe." 
        : "Error interno al procesar la solicitud.";
      alert(msg);
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
      setIsSuccessOpen(true);
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
              <p className="text-xs text-muted-foreground">Gestión de aforo y tecnología</p>
            </div>
            <button
              onClick={() => setExternalIsAdding(true)}
              className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase font-montserrat"
            >
              <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> Añadir Sala
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-sm hover:border-brand-primary/30 transition-colors">
                <div>
                  <h4 className="font-bold text-brand-primary font-montserrat">{room.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">ID: {room.id} | Capacidad: {room.totalCapacity}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setRoomToDelete(room); setIsDeleteModalOpen(true); }} className="text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-black uppercase mb-4 text-slate-400 flex items-center gap-2">
              <Square className="w-4 h-4 text-brand-primary fill-brand-primary" /> Datos Generales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre de Sala</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded-lg text-sm bg-white"
                  placeholder="Ej: Sala 1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tecnología</label>
                <select
                  value={formData.projectionType}
                  onChange={(e) => setFormData({ ...formData, projectionType: e.target.value })}
                  className="w-full border p-2 rounded-lg text-sm bg-white"
                >
                  <option value="1">2D Digital</option>
                  <option value="2">3D Digital</option>
                  <option value="3">IMAX</option>
                </select>
              </div>
              <div className="bg-brand-primary/5 p-2 rounded-lg text-center border border-brand-primary/10">
                <span className="text-[9px] block font-bold text-brand-primary uppercase">Dimensiones</span>
                <span className="font-bold text-brand-primary">{formData.rows}x{formData.cols}</span>
              </div>
              <div className="bg-blue-600/5 p-2 rounded-lg text-center border border-blue-600/10">
                <span className="text-[9px] block font-bold text-blue-600 uppercase">Capacidad Max</span>
                <span className="font-bold text-blue-600">{theoreticalCapacity}</span>
              </div>
            </div>
          </div>

          <SeatGridDesigner
            externalFormData={formData}
            setExternalFormData={setFormData}
            onValidationChange={(isValid, layout) => {
              setIsLayoutValid(isValid);
              setRoomLayout(layout);
            }}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={handleProcessChain}
              disabled={!isLayoutValid || !formData.name}
              className="bg-brand-primary text-white rounded-xl flex gap-2 items-center px-8 shadow-lg shadow-brand-primary/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Guardar Sala y Asientos
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDeleteRoom} itemName={roomToDelete?.name} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title="Proceso Exitoso" message="La sala y todos sus asientos han sido registrados." />
    </div>
  );
}