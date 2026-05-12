import { useState, useEffect } from 'react';
import { Wrench, Grid3X3, Accessibility, MousePointer2, Info } from 'lucide-react';

export default function SeatGridDesigner({ onValidationChange, initialLayout, externalFormData, setExternalFormData }) {
  if (!externalFormData) return null;

  const [seatMap, setSeatMap] = useState([]);
  // true = Modo Estado (Disponible/Mantenimiento/Pasillo), false = Modo Categoría (Discapacidad)
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    const numRows = parseInt(externalFormData.rows) || 0;
    const numCols = parseInt(externalFormData.cols) || 0;
    
    if (numRows > 0 && numCols > 0) {
      if (initialLayout && initialLayout.length === numRows && initialLayout[0]?.length === numCols) {
        setSeatMap(initialLayout);
      } else {
        const newMap = Array(numRows).fill().map(() => 
          Array(numCols).fill({ category: 1, condition: 1, type: 'active' })
        );
        setSeatMap(newMap);
      }
    } else {
      setSeatMap([]);
    }
  }, [externalFormData.rows, externalFormData.cols]);

  useEffect(() => {
    if (seatMap.length === 0) return;
    const activeSeatsCount = seatMap.flat().filter(s => s.type !== 'empty').length;
    onValidationChange(activeSeatsCount > 0, seatMap);
  }, [seatMap]);

const handleSeatClick = (rowIndex, colIndex) => {
    const newMap = [...seatMap];
    newMap[rowIndex] = [...newMap[rowIndex]];
    const current = newMap[rowIndex][colIndex];

    if (editMode) {
      // MODO ESTRUCTURA (1 -> 2 -> 3 -> 1)
      let nextCondition;
      let nextType = 'active'; // Por defecto es un asiento activo

      if (current.condition === 1) {
        nextCondition = 2; // A Mantenimiento
      } else if (current.condition === 2) {
        nextCondition = 3; // A Pasillo
        nextType = 'empty'; // Cambiar el type para que se vea como pasillo
      } else {
        nextCondition = 1; 
        nextType = 'active';
      }

      newMap[rowIndex][colIndex] = { 
        ...current, 
        condition: nextCondition, 
        type: nextType 
      };
    } else {
      // MODO CATEGORÍA: Solo si no es pasillo
      if (current.condition === 3 || current.type === 'empty') return;
      
      newMap[rowIndex][colIndex] = { 
        ...current, 
        category: current.category === 1 ? 2 : 1 
      };
    }
    setSeatMap(newMap);
  };

  const activeSeatsCount = seatMap.flat().filter(s => s.type !== 'empty' && s.condition === 1).length;

  return (
    <div className="mt-6 border border-gray-200 rounded-cineflix p-6 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-gray-800 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-brand-primary" />
            Configuración de Distribución
          </h3>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            <Info className="w-3 h-3" />
            Selecciona una herramienta en la leyenda para editar la sala.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Filas</span>
            <input 
              type="number" min="1" max="20"
              value={externalFormData.rows}
              onChange={(e) => setExternalFormData({...externalFormData, rows: e.target.value})}
              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm outline-none font-montserrat"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Cols</span>
            <input 
              type="number" min="1" max="20"
              value={externalFormData.cols}
              onChange={(e) => setExternalFormData({...externalFormData, cols: e.target.value})}
              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm outline-none font-montserrat"
            />
          </div>
          <div className="bg-brand-primary/5 border border-brand-primary/20 px-4 py-1 rounded flex flex-col items-center justify-center">
             <span className="text-[10px] font-bold text-brand-primary uppercase font-montserrat">Capacidad Real</span>
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
      <div className="flex justify-start md:justify-center overflow-x-auto pb-6 custom-scrollbar">
        <div 
          className="grid gap-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100 h-fit" 
          style={{ 
            gridTemplateColumns: `repeat(${parseInt(externalFormData.cols) || 1}, minmax(36px, 1fr))`,
            width: 'max-content' 
          }}
        >
          {seatMap.map((row, rowIndex) => (
            row.map((seat, colIndex) => {
              const isEmpty = seat.condition === 3;
              const isDisability = seat.category === 2;
              const isMaintenance = seat.condition === 2;
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => handleSeatClick(rowIndex, colIndex)}
                  className={`
                    w-10 h-10 rounded-t-xl rounded-b-md transition-all duration-200 flex flex-col items-center justify-center text-[9px] font-bold shadow-sm
                    ${isEmpty ? 'bg-white border border-dashed border-gray-300 text-gray-300' : 
                      isMaintenance ? 'bg-orange-500 text-white border-b-4 border-orange-700' :
                      isDisability ? 'bg-blue-600 text-white border-b-4 border-blue-800' :
                      'bg-brand-primary text-white border-b-4 border-brand-primary/80'}
                    ${!editMode && isEmpty ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                  `}
                >
                  <span className="opacity-70">{String.fromCharCode(65 + rowIndex)}{colIndex + 1}</span>
                  {isDisability && <Accessibility className="w-3.5 h-3.5 mt-0.5 animate-in zoom-in duration-300" />}
                  {isMaintenance && <Wrench className="w-3.5 h-3.5 mt-0.5 animate-in zoom-in duration-300" />}
                </button>
              );
            })
          ))}
        </div>
      </div>
      
      {/* LEYENDA INTERACTIVA (Selector de Herramienta) */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-montserrat">Herramientas de Edición</span>
        <div className="flex justify-center flex-wrap gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
          
          {/* Botón Modo Estado */}
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${editMode ? 'bg-white shadow-md border border-slate-200' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className="flex gap-1.5">
              <div className="w-4 h-4 bg-brand-primary rounded-sm shadow-sm" title="Disponible" />
              <div className="w-4 h-4 bg-orange-500 rounded-sm shadow-sm flex items-center justify-center">
                <Wrench className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="w-4 h-4 bg-white border border-dashed border-slate-300 rounded-sm shadow-sm" title="Pasillo" />
            </div>
            <div className="text-left">
              <p className={`text-[11px] font-bold leading-none ${editMode ? 'text-brand-primary' : 'text-slate-500'}`}>Modo Estructura</p>
              <p className="text-[9px] text-slate-400 font-medium">Estado y Pasillos</p>
            </div>
          </button>

          <div className="w-px h-10 bg-slate-300 self-center mx-1" />

          {/* Botón Modo Categoría */}
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${!editMode ? 'bg-white shadow-md border border-slate-200' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className="flex gap-1.5">
              <div className="w-4 h-4 bg-blue-600 rounded-sm shadow-sm flex items-center justify-center">
                <Accessibility className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="text-left">
              <p className={`text-[11px] font-bold leading-none ${!editMode ? 'text-blue-600' : 'text-slate-500'}`}>Modo Categoría</p>
              <p className="text-[9px] text-slate-400 font-medium">Asientos Especiales</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}