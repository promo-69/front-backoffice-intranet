import { useState } from "react";
import { Presentation, Plus, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeatGridDesigner from "./SeatGridDesigner";

export default function RoomManager({ branch }) {
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isLayoutValid, setIsLayoutValid] = useState(false);
  const [roomLayout, setRoomLayout] = useState([]);

  // Datos de ejemplo para las salas
  const [rooms, setRooms] = useState([
    { id: 1, name: "Sala 1 - IMAX", capacity: 200, status: "Activa", rows: 10, cols: 20 },
    { id: 2, name: "Sala 2 - VIP", capacity: 50, status: "Activa", rows: 5, cols: 10 },
    { id: 3, name: "Sala 3", capacity: 150, status: "Activa", rows: 10, cols: 15 },
  ]);

  // Estado para el formulario de sala
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    rows: "",
    cols: "",
    status: "Activa"
  });

  const resetForm = () => {
    setIsAddingRoom(false);
    setEditingRoomId(null);
    setFormData({ name: "", capacity: "", rows: "", cols: "", status: "Activa" });
    setIsLayoutValid(false);
    setRoomLayout([]);
  };

  const handleEditRoom = (room) => {
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      rows: room.rows ? room.rows.toString() : "",
      cols: room.cols ? room.cols.toString() : "",
      status: room.status
    });
    setRoomLayout(room.layout || []);
    setIsLayoutValid(true); // Asumimos que el layout guardado es válido
    setEditingRoomId(room.id);
    setIsAddingRoom(true);
  };

  const handleSaveRoom = () => {
    if (!formData.name) {
      alert("Por favor, ingresa al menos el nombre de la sala.");
      return;
    }

    const newRoom = {
      id: editingRoomId ? editingRoomId : Date.now(),
      name: formData.name,
      capacity: parseInt(formData.capacity) || 0,
      status: formData.status,
      rows: parseInt(formData.rows) || 0,
      cols: parseInt(formData.cols) || 0,
      layout: roomLayout
    };

    if (editingRoomId) {
      setRooms(rooms.map(r => r.id === editingRoomId ? newRoom : r));
    } else {
      setRooms([...rooms, newRoom]);
    }

    resetForm();
  };

  const handleDeleteRoom = (id, name) => {
    const confirmMessage = `¿Estás seguro de que deseas eliminar la ${name}?\n\n(En el futuro, esto hará un "borrado lógico" en la base de datos).`;
    if (window.confirm(confirmMessage)) {
      setRooms(rooms.filter(room => room.id !== id));
      if (editingRoomId === id) {
        resetForm();
      }
    }
  };

  const getIdentifier = (name) => {
    return name.toLowerCase().replace('sala', '').split('-')[0].trim();
  };

  const currentId = getIdentifier(formData.name);
  const isDuplicateName = currentId !== "" && rooms.some(room => room.id !== editingRoomId && getIdentifier(room.name) === currentId);

  return (
    <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[400px]">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-montserrat font-bold text-brand-primary">
            Salas
          </h2>
          <p className="text-sm text-muted-foreground">Gestión de salas de la sucursal {branch?.name}</p>
        </div>
        <Button
          onClick={() => { resetForm(); setIsAddingRoom(true); }}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold rounded-cineflix transition-transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4 text-brand-gold" />
          Agregar Sala
        </Button>
      </div>

      {isAddingRoom ? (
        <div className="bg-gray-50 p-6 rounded-cineflix border border-gray-200 mt-4 shadow-inner">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            <Square className="text-orange-500 h-6 w-6 fill-orange-500" />
            <h3 className="text-lg font-montserrat font-bold text-gray-800">
              {editingRoomId ? "Editar Sala" : "Registrar Nueva Sala"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la sala</label>
              <input
                type="text"
                placeholder="Ej: Sala 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDuplicateName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {isDuplicateName && (
                <span className="text-xs text-red-600 font-medium mt-1">❌ Ya existe una sala con este nombre.</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Capacidad Total</label>
              <input
                type="number"
                placeholder="Ej: 100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Filas</label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Columnas</label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={formData.cols}
                onChange={(e) => setFormData({ ...formData, cols: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          <SeatGridDesigner
            key={editingRoomId || "new"}
            rows={formData.rows}
            cols={formData.cols}
            totalCapacity={formData.capacity}
            initialLayout={editingRoomId ? rooms.find(r => r.id === editingRoomId)?.layout : null}
            onValidationChange={(isValid, layout) => {
              setIsLayoutValid(isValid);
              setRoomLayout(layout);
            }}
          />

          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={resetForm}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRoom}
              disabled={!isLayoutValid || isDuplicateName}
              className={`text-white shadow-md ${!isLayoutValid || isDuplicateName ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              {editingRoomId ? "Actualizar Sala" : "Guardar Sala"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-gray-300">
          {rooms.map((room) => (
            <div key={room.id} className="border border-gray-300 p-4 rounded-cineflix flex justify-between items-center hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100/50 p-2 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-gold transition-colors">
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-primary">{room.name}</h4>
                  <p className="text-xs text-gray-500">
                    Capacidad: <span className="font-medium text-gray-700">{room.capacity}</span> | Tipo: <span className="font-medium text-gray-700">{room.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditRoom(room)}
                  className="text-brand-primary text-xs bg-yellow-300 hover:bg-yellow-400 rounded-lg"
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRoom(room.id, room.name)}
                  className="h-8 w-8 text-white bg-red-500 hover:bg-red-600 rounded-lg"
                  title="Eliminar Sala"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
