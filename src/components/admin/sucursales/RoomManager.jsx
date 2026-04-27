import { useState } from "react";
import { Presentation, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeatGridDesigner from "./SeatGridDesigner";

export default function RoomManager({ sucursal }) {
  const [isAddingSala, setIsAddingSala] = useState(false);
  const [isLayoutValid, setIsLayoutValid] = useState(false);
  const [roomLayout, setRoomLayout] = useState([]);

  // Datos de ejemplo para las salas (ahora es un estado para que puedas agregar nuevas)
  const [salas, setSalas] = useState([
    { id: 1, nombre: "Sala 1 - IMAX", capacidad: 200, tipo: "Activa" },
    { id: 2, nombre: "Sala 2 - VIP", capacidad: 50, tipo: "Activa" },
    { id: 3, nombre: "Sala 3", capacidad: 150, tipo: "Activa" },
  ]);

  // Estado para el formulario de nueva sala
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    filas: "",
    columnas: "",
    estado: "Activa"
  });

  // Función para guardar la sala temporalmente en la vista
  const handleGuardarSala = () => {
    if (!formData.nombre) {
      alert("Por favor, ingresa al menos el nombre de la sala.");
      return;
    }

    const nuevaSala = {
      id: Date.now(), // ID temporal para que React no se queje
      nombre: formData.nombre,
      capacidad: formData.capacidad || 0,
      tipo: formData.estado, // Usamos el estado aquí para que se vea en la tarjetita
      layout: roomLayout
    };

    setSalas([...salas, nuevaSala]); // Agrega la nueva a la lista actual
    setIsAddingSala(false); // Cierra el formulario
    setFormData({ nombre: "", capacidad: "", filas: "", columnas: "", estado: "Activa" }); // Limpia el form
    setIsLayoutValid(false);
    setRoomLayout([]);
  };

  // Cálculos para validación en tiempo real
  const capacidad = parseInt(formData.capacidad) || 0;
  const filas = parseInt(formData.filas) || 0;
  const columnas = parseInt(formData.columnas) || 0;
  const espaciosGrid = filas * columnas;

  const hasCapacityError = capacidad > 0 && espaciosGrid > 0 && espaciosGrid < capacidad;

  // Función para extraer el identificador base (ej: "Sala 1 - IMAX" -> "1", "Sala A" -> "a")
  const getIdentifier = (name) => {
    return name.toLowerCase().replace('sala', '').split('-')[0].trim();
  };

  const currentId = getIdentifier(formData.nombre);
  const isDuplicateName = currentId !== "" && salas.some(sala => getIdentifier(sala.nombre) === currentId);

  return (
    <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[400px]">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-montserrat font-bold text-brand-primary">
            Salas
          </h2>
          <p className="text-sm text-muted-foreground">Gestión de salas de la sucursal {sucursal.nombre}</p>
        </div>
        <Button
          onClick={() => setIsAddingSala(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold rounded-cineflix transition-transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4 text-brand-gold" />
          Agregar Sala
        </Button>
      </div>

      {/* Grid de Salas o Formulario de Registro */}
      {isAddingSala ? (
        <div className="bg-gray-50 p-6 rounded-cineflix border border-gray-200 mt-4 shadow-inner">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            <Square className="text-orange-500 h-6 w-6 fill-orange-500" />
            <h3 className="text-lg font-montserrat font-bold text-gray-800">Registrar Nueva Sala</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la sala</label>
              <input
                type="text"
                placeholder="Ej: Sala 1"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Filas (Grid Rows)</label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={formData.filas}
                onChange={(e) => setFormData({ ...formData, filas: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Columnas (Grid Columns)</label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={formData.columnas}
                onChange={(e) => setFormData({ ...formData, columnas: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Estado (Status)</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          <SeatGridDesigner
            filas={formData.filas}
            columnas={formData.columnas}
            capacidadTotal={formData.capacidad}
            onValidationChange={(isValid, layout) => {
              setIsLayoutValid(isValid);
              setRoomLayout(layout);
            }}
          />

          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingSala(false);
                setFormData({ nombre: "", capacidad: "", filas: "", columnas: "", estado: "Activa" });
                setIsLayoutValid(false);
                setRoomLayout([]);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarSala}
              disabled={!isLayoutValid || isDuplicateName}
              className={`text-white shadow-md ${!isLayoutValid || isDuplicateName ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              Guardar Sala
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-gray-300">
          {salas.map((sala) => (
            <div key={sala.id} className="border border-gray-300 p-4 rounded-cineflix flex justify-between items-center hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100/50 p-2 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-gold transition-colors">
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-primary">{sala.nombre}</h4>
                  <p className="text-xs text-gray-500">
                    Capacidad: <span className="font-medium text-gray-700">{sala.capacidad}</span> | Tipo: <span className="font-medium text-gray-700">{sala.tipo}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-brand-primary text-xs bg-yellow-300 hover:bg-yellow-400 rounded-lg">
                Editar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
