import { useState, useEffect } from "react";
import { Presentation, Plus, Square, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import SeatGridDesigner from "./SeatGridDesigner";
import { useLoading } from "../../../context/LoadingContext";
import api from '../../../api/axios'; // Asegúrate de que esta ruta sea correcta

export default function RoomManager({ branch, externalIsAdding, setExternalIsAdding }) {
  const { showLoader, hideLoader } = useLoading();
  
  // IMPORTANTE: Empezamos con el array vacío para que se active el mensaje de "No hay salas"
  const [rooms, setRooms] = useState([]); 
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isLayoutValid, setIsLayoutValid] = useState(false);
  const [roomLayout, setRoomLayout] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    rows: "",
    cols: "",
    status: "Activa"
  });

  // FUNCIÓN PARA CARGAR SALAS REALES
  const fetchRooms = async () => {
    if (!branch?.id) return;
    try {
      showLoader();
      // Según tu imagen de endpoints, usamos Get Rooms filtrando por el ID de la sucursal
      const response = await api.get(`/rooms?cinema=${branch.id}`);
      
      // Ajustamos según la estructura de tu respuesta (data.data o data)
      const data = response.data.data || response.data || [];
      setRooms(data);
      
      console.log(`Salas cargadas para ${branch.name}:`, data.length);
    } catch (error) {
      console.error("Error al obtener salas:", error);
      setRooms([]); // En caso de error, aseguramos que esté vacío para mostrar el aviso
    } finally {
      hideLoader();
    }
  };

  // Cada vez que el ID de la sucursal cambie en la tabla superior, disparamos la carga
  useEffect(() => {
    if (branch?.id) {
      resetForm();
      fetchRooms();
    }
  }, [branch?.id]);

  const resetForm = () => {
    setExternalIsAdding(false);
    setEditingRoomId(null);
    setFormData({ name: "", capacity: "", rows: "", cols: "", status: "Activa" });
    setIsLayoutValid(false);
    setRoomLayout([]);
  };

  const handleEditRoom = (room) => {
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      rows: room.rows?.toString() || "",
      cols: room.cols?.toString() || "",
      status: room.status || "Activa"
    });
    setRoomLayout(room.layout || []);
    setIsLayoutValid(true); 
    setEditingRoomId(room.id);
    setExternalIsAdding(true);
  };

  const handleSaveRoom = async () => {
    const payload = {
      cinema_id: branch.id,
      name: formData.name,
      capacity: parseInt(formData.capacity),
      rows: parseInt(formData.rows),
      cols: parseInt(formData.cols),
      layout: roomLayout, // Tu backend debería recibir esto como JSON
      status: formData.status
    };

    try {
      showLoader();
      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      hideLoader();
    }
  };

  const handleDeleteRoom = (id, name) => {
    setRoomToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      showLoader();
      await api.delete(`/rooms/${roomToDelete.id}`);
      setIsDeleteModalOpen(false);
      setIsSuccessOpen(true);
      fetchRooms();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[400px]">
      
      {externalIsAdding ? (
        <div className="bg-gray-50 p-6 rounded-cineflix border border-gray-200 shadow-inner">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            <Square className="text-orange-500 h-6 w-6 fill-orange-500" />
            <h3 className="text-lg font-montserrat font-bold text-gray-800">
              {editingRoomId ? "Editar Sala" : "Registrar Nueva Sala"}
            </h3>
          </div>

          {/* Formulario de inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la sala</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Ej: Sala 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Capacidad Total</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <SeatGridDesigner
            key={editingRoomId || "new"}
            rows={formData.rows}
            cols={formData.cols}
            totalCapacity={formData.capacity}
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
              className={`text-white ${!isLayoutValid ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              {editingRoomId ? "Actualizar Sala" : "Guardar Sala"}
            </Button>
          </div>
        </div>
      ) : (
        /* LÓGICA DE VISUALIZACIÓN DE SALAS O MENSAJE VACÍO */
        <>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-300 p-4 rounded-cineflix flex justify-between items-center bg-white shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-brand-primary">
                      <Presentation className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-primary">{room.name}</h4>
                      <p className="text-xs text-gray-500">Capacidad: {room.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleEditRoom(room)} className="bg-yellow-300 text-brand-primary hover:bg-yellow-400">Editar</Button>
                    <Button size="icon" onClick={() => handleDeleteRoom(room.id, room.name)} className="bg-red-500 text-white"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ESTE ES EL MENSAJE QUE APARECERÁ SI LA SUCURSAL NO TIENE SALAS */
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Presentation className="h-12 w-12 text-slate-300 mb-4" />
              <h4 className="text-slate-500 font-bold font-montserrat uppercase text-xs tracking-widest">
                No hay salas disponibles en esta sucursal
              </h4>
              <p className="text-slate-400 text-[10px] mt-2">
                Selecciona otra sede o presiona "Agregar Sala" para crear una.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDeleteRoom} itemName={roomToDelete?.name} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title="¡Éxito!" message="Operación realizada correctamente." />
    </div>
  );
}