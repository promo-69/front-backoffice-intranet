import { useState, useEffect } from 'react';
import { MonitorPlay } from 'lucide-react';

export default function SeatGridDesigner({ filas, columnas, capacidadTotal, onValidationChange }) {
  // Estado para guardar el mapa de asientos. True = Asiento activo, False = Pasillo/Espacio vacío
  const [seatMap, setSeatMap] = useState([]);

  // Inicializar o redimensionar la cuadrícula cuando cambian las filas o columnas
  useEffect(() => {
    const rows = parseInt(filas) || 0;
    const cols = parseInt(columnas) || 0;
    
    if (rows > 0 && cols > 0) {
      // Creamos una nueva matriz llena de "true" (todos son asientos por defecto)
      const newMap = Array(rows).fill().map(() => Array(cols).fill(true));
      setSeatMap(newMap);
    } else {
      setSeatMap([]);
    }
  }, [filas, columnas]);

  // Contar cuántos asientos están activos actualmente
  const activeSeatsCount = seatMap.flat().filter(seat => seat === true).length;
  const targetCapacity = parseInt(capacidadTotal) || 0;

  // Validar si el diseño cumple con la capacidad y notificar al padre
  useEffect(() => {
    const isValid = activeSeatsCount === targetCapacity && targetCapacity > 0;
    onValidationChange(isValid, seatMap);
  }, [activeSeatsCount, targetCapacity, seatMap, onValidationChange]);

  // Función para apagar/encender un asiento
  const toggleSeat = (rowIndex, colIndex) => {
    const newMap = [...seatMap];
    newMap[rowIndex] = [...newMap[rowIndex]];
    newMap[rowIndex][colIndex] = !newMap[rowIndex][colIndex];
    setSeatMap(newMap);
  };

  if (!filas || !columnas || filas <= 0 || columnas <= 0) {
    return null; // No mostramos nada si no hay dimensiones válidas
  }

  const isOverCapacity = activeSeatsCount > targetCapacity;
  const isUnderCapacity = activeSeatsCount < targetCapacity;

  return (
    <div className="mt-6 border border-gray-200 rounded-cineflix p-6 bg-white shadow-sm">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-gray-800">Diseñador de Sala</h3>
          <p className="text-sm text-gray-500">Haz clic en los cuadros para eliminar asientos y crear pasillos.</p>
        </div>
        
        {/* Marcador de estado */}
        <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${
          activeSeatsCount === targetCapacity ? 'bg-green-50 border-green-200 text-green-700' : 
          isOverCapacity ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Asientos Activos</span>
          <span className="text-xl font-black font-montserrat">
            {activeSeatsCount} <span className="text-sm font-normal">/ {targetCapacity}</span>
          </span>
          {isOverCapacity && <span className="text-xs font-medium">Sobran {activeSeatsCount - targetCapacity}</span>}
          {isUnderCapacity && <span className="text-xs font-medium">Faltan {targetCapacity - activeSeatsCount}</span>}
        </div>
      </div>

      {/* Pantalla (Screen) */}
      <div className="w-full max-w-2xl mx-auto mb-8 flex flex-col items-center opacity-70">
        <div className="w-full h-8 bg-gradient-to-t from-gray-200 to-gray-50 rounded-t-[50%] border-t-4 border-gray-300 shadow-inner flex items-center justify-center">
          <MonitorPlay className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Pantalla</span>
        </div>
      </div>

      {/* Cuadrícula interactiva */}
      <div className="flex justify-center overflow-x-auto pb-4">
        <div 
          className="grid gap-2" 
          style={{ 
            gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
            // Limitamos el ancho máximo de cada asientito para que no sea gigante
            maxWidth: '100%' 
          }}
        >
          {seatMap.map((row, rowIndex) => (
            row.map((isActive, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => toggleSeat(rowIndex, colIndex)}
                className={`
                  w-8 h-8 rounded-t-lg rounded-b-sm transition-all duration-200 flex items-center justify-center text-[10px] font-bold shadow-sm
                  ${isActive 
                    ? 'bg-brand-primary hover:bg-brand-primary/80 text-white border-b-4 border-brand-primary/90 hover:-translate-y-1' 
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-300 shadow-inner'
                  }
                `}
                title={`Fila ${rowIndex + 1}, Columna ${colIndex + 1}`}
              >
                {isActive ? '' : 'X'}
              </button>
            ))
          ))}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-primary rounded-sm"></div>
          <span className="text-xs text-gray-600">Asiento Activo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center text-[8px] text-gray-400 font-bold">X</div>
          <span className="text-xs text-gray-600">Pasillo / Vacío</span>
        </div>
      </div>
    </div>
  );
}
