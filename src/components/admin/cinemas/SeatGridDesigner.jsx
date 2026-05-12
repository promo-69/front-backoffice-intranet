import { useState, useEffect } from 'react';
import { MonitorPlay, Wrench, Grid3X3 } from 'lucide-react';

export default function SeatGridDesigner({ onValidationChange, initialLayout, externalFormData, setExternalFormData }) {
  // Estado para la matriz visual
  const [seatMap, setSeatMap] = useState([]);

  // Sincronizar dimensiones y reconstruir la cuadrícula
  useEffect(() => {
    const numRows = parseInt(externalFormData.rows) || 0;
    const numCols = parseInt(externalFormData.cols) || 0;
    
    if (numRows > 0 && numCols > 0) {
      // Si estamos editando y tenemos un layout previo, intentar reconstruirlo
      if (initialLayout && initialLayout.length > 0) {
        // Aquí podrías implementar lógica para mapear de lista plana a matriz si fuera necesario
        setSeatMap(initialLayout);
      } else {
        // Inicialización por defecto: todos activos
        const newMap = Array(numRows).fill().map(() => Array(numCols).fill('active'));
        setSeatMap(newMap);
      }
    } else {
      setSeatMap([]);
    }
  }, [externalFormData.rows, externalFormData.cols, initialLayout]);

  // Cálculos de capacidad
  const activeSeatsCount = seatMap.flat().filter(seat => seat === 'active').length;
  const maintenanceSeatsCount = seatMap.flat().filter(seat => seat === 'maintenance').length;

  // Notificar al padre cada vez que cambie el mapa
  useEffect(() => {
    const isValid = activeSeatsCount > 0;
    onValidationChange(isValid, seatMap);
  }, [seatMap, activeSeatsCount]);

  const toggleSeat = (rowIndex, colIndex) => {
    const newMap = [...seatMap];
    newMap[rowIndex] = [...newMap[rowIndex]];
    
    const currentState = newMap[rowIndex][colIndex];
    let nextState;
    
    if (currentState === 'active') nextState = 'empty';
    else if (currentState === 'empty') nextState = 'maintenance';
    else nextState = 'active';

    newMap[rowIndex][colIndex] = nextState;
    setSeatMap(newMap);
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-cineflix p-6 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-gray-800 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-brand-primary" />
            Configuración de Distribución
          </h3>
          <p className="text-xs text-gray-500">Define el tamaño de la cuadrícula y haz clic para alternar estados.</p>
        </div>

        {/* Inputs de Dimensiones integrados */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Filas</span>
            <input 
              type="number"
              min="1"
              max="20"
              value={externalFormData.rows}
              onChange={(e) => setExternalFormData({...externalFormData, rows: e.target.value})}
              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-primary outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Columnas</span>
            <input 
              type="number"
              min="1"
              max="20"
              value={externalFormData.cols}
              onChange={(e) => setExternalFormData({...externalFormData, cols: e.target.value})}
              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-primary outline-none"
            />
          </div>
          
          {/* Contador de capacidad real */}
          <div className="bg-brand-primary/5 border border-brand-primary/20 px-4 py-1 rounded flex flex-col items-center justify-center">
             <span className="text-[10px] font-bold text-brand-primary uppercase">Capacidad Real</span>
             <span className="text-lg font-black text-brand-primary leading-tight">{activeSeatsCount}</span>
          </div>
        </div>
      </div>

      {/* Pantalla */}
      <div className="w-full max-w-md mx-auto mb-10 flex flex-col items-center">
        <div className="w-full h-2 bg-gradient-to-t from-gray-300 to-gray-100 rounded-full shadow-sm mb-2" />
        <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">Pantalla Central</span>
      </div>

      {/* Cuadrícula */}
      <div className="flex justify-center overflow-x-auto pb-6 custom-scrollbar">
        <div 
          className="grid gap-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100" 
          style={{ gridTemplateColumns: `repeat(${externalFormData.cols || 0}, minmax(0, 1fr))` }}
        >
          {seatMap.map((row, rowIndex) => (
            row.map((seatState, colIndex) => {
              const isActive = seatState === 'active';
              const isMaintenance = seatState === 'maintenance';
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => toggleSeat(rowIndex, colIndex)}
                  className={`
                    w-9 h-9 rounded-t-xl rounded-b-md transition-all duration-200 flex flex-col items-center justify-center text-[9px] font-bold shadow-sm
                    ${isActive 
                      ? 'bg-brand-primary text-white border-b-4 border-brand-primary/80 hover:brightness-110 active:translate-y-1' 
                      : isMaintenance
                      ? 'bg-orange-500 text-white border-b-4 border-orange-700'
                      : 'bg-white border border-dashed border-gray-300 text-gray-300 shadow-inner'
                    }
                  `}
                >
                  <span className="opacity-60">{String.fromCharCode(65 + rowIndex)}{colIndex + 1}</span>
                  {isMaintenance && <Wrench className="w-3 h-3 mt-0.5" />}
                  {!isActive && !isMaintenance && <span className="text-xs">×</span>}
                </button>
              );
            })
          ))}
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex justify-center flex-wrap gap-6 mt-4 py-4 bg-gray-50/50 rounded-lg">
        <LegendItem color="bg-brand-primary" label="Disponible" />
        <LegendItem color="bg-orange-500" label="Mantenimiento" icon={<Wrench className="w-2 h-2 text-white" />} />
        <LegendItem color="bg-white border border-dashed border-gray-300" label="Pasillo / Vacío" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, icon }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${color}`}>{icon}</div>
      <span className="text-[11px] font-medium text-gray-600">{label}</span>
    </div>
  );
}