import { useState, useEffect, useRef } from 'react';
import { Wrench, Grid3X3, Accessibility, Armchair } from 'lucide-react';

export default function SeatGridDesigner({ 
  onValidationChange, 
  initialLayout, 
  externalFormData, 
  setExternalFormData,
  isEdit = false
}) {
  if (!externalFormData) return null;

  const [internalMap, setInternalMap] = useState([]);
  const [editMode, setEditMode] = useState(true);
  
  const lastEmittedMap = useRef(""); 

  useEffect(() => {
    const targetRows = parseInt(externalFormData.rows) || 5;
    const targetCols = parseInt(externalFormData.cols) || 5;

    const newGrid = Array.from({ length: targetRows }, (_, rIdx) =>
      Array.from({ length: targetCols }, (_, cIdx) => {
        if (initialLayout && initialLayout[rIdx] && initialLayout[rIdx][cIdx]) {
          return initialLayout[rIdx][cIdx];
        }
        return { category: 1, condition: 1, type: 'active' };
      })
    );
    setInternalMap(newGrid);
  }, [initialLayout]); 

  useEffect(() => {
    const r = parseInt(externalFormData.rows) || 1;
    const c = parseInt(externalFormData.cols) || 1;
    
    setInternalMap(current => {
      if (current.length === r && (current[0]?.length || 0) === c) return current;
      
      return Array.from({ length: r }, (_, ri) =>
        Array.from({ length: c }, (_, ci) => {
          if (current[ri] && current[ri][ci]) return current[ri][ci];
          return { category: 1, condition: 1, type: 'active' };
        })
      );
    });
  }, [externalFormData.rows, externalFormData.cols]);

  useEffect(() => {
    if (internalMap.length === 0) return;

    const currentMapString = JSON.stringify(internalMap);

    if (lastEmittedMap.current !== currentMapString) {
      const hasActiveSeats = internalMap.flat().some(s => s.type !== 'empty');
      
      onValidationChange(hasActiveSeats, internalMap);
      
      lastEmittedMap.current = currentMapString;
    }
  }, [internalMap, onValidationChange]); 

  const handleSeatClick = (rowIndex, colIndex) => {
    const nextMap = internalMap.map((row, rIdx) => 
      rIdx === rowIndex ? row.map((seat, cIdx) => {
        if (cIdx !== colIndex) return seat;
        
        // MODO ESTRUCTURA Disponible -> Mantenimiento (si es edición) -> Pasillo
        if (editMode) {
          let nextCond;
          if (isEdit) {
            // Ciclo Completo en Edición: 1 (Disponible) -> 2 (Mantenimiento) -> 3 (Vacío) -> 1
            nextCond = seat.condition === 1 ? 2 : seat.condition === 2 ? 3 : 1;
          } else {
            // Ciclo en Creación Estricta: 1 Disponible -> 3 (Vacío) -> 1
            nextCond = seat.condition === 1 ? 3 : 1;
          }
          
          return { 
            ...seat, 
            condition: nextCond, 
            // Si es 3 es pasillo (empty), si es 1 o 2 es una entidad física de asiento
            type: nextCond === 3 ? 'empty' : 'active' 
          };
        }
        
        // MODO CATEGORÍA General / Discapacidad
        if (seat.condition === 3) return seat; // No se puede categorizar un pasillo vacío
        return { ...seat, category: seat.category === 1 ? 2 : 1 };
      }) : row
    );
    setInternalMap(nextMap);
  };

  const activeCount = internalMap.flat().filter(s => s.type !== 'empty' && s.condition === 1).length;

  return (
    <div className="mt-6 border border-gray-200 rounded-cineflix p-6 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-gray-800 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-brand-primary" /> Distribución de Sala
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 italic">
             Gestionando el aforo para la Promo 69.
          </p>
        </div>

        <div className="flex gap-3">
          {['rows', 'cols'].map(key => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {key === 'rows' ? 'Filas' : 'Cols'}
              </span>
              <input
                type="number" min="1" max="25"
                value={externalFormData[key]}
                onChange={(e) => setExternalFormData(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-16 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-brand-primary"
              />
            </div>
          ))}
          <div className="bg-brand-primary/5 border border-brand-primary/20 px-4 py-1 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] font-bold text-brand-primary uppercase">Capacidad</span>
            <span className="text-lg font-black text-brand-primary leading-none">{activeCount}</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Asientos */}
      <div className="flex justify-center overflow-x-auto pb-6">
        <div 
          className="grid gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100"
          style={{ gridTemplateColumns: `repeat(${externalFormData.cols}, 40px)` }}
        >
          {internalMap.map((row, ri) => row.map((seat, ci) => (
            <button
              key={`${ri}-${ci}`} type="button"
              onClick={() => handleSeatClick(ri, ci)}
              className={`w-10 h-10 rounded-t-xl transition-all flex items-center justify-center text-[9px] font-bold
                ${seat.condition === 3 ? 'bg-white border border-dashed border-slate-300 text-slate-300' : 
                  seat.condition === 2 ? 'bg-orange-500 text-white border-b-4 border-orange-700' :
                  seat.category === 2 ? 'bg-blue-600 text-white border-b-4 border-blue-800' : 
                  'bg-brand-primary text-white border-b-4 border-brand-primary/80'}
              `}
            >
              {seat.condition !== 3 && (
                <div className="flex flex-col items-center">
                  <span>{String.fromCharCode(65 + ri)}{ci + 1}</span>
                  {seat.category === 2 && seat.condition !== 2 && <Accessibility className="w-3 h-3" />}
                  {seat.condition === 2 && <Wrench className="w-3 h-3" />}
                </div>
              )}
            </button>
          )))}
        </div>
      </div>

      {/* Menú de Modos de Edición */}
      <div className="mt-4 flex justify-center gap-3 p-1.5 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
        <button
          type="button" onClick={() => setEditMode(true)}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${editMode ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}
        >Estructura</button>
        <button
          type="button" onClick={() => setEditMode(false)}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${!editMode ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}
        >Categoría</button>
      </div>

      <hr className="my-6 border-slate-100" />

      {/* Leyenda Dinámica Inteligente con Iconos */}
      <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand-primary rounded-t-md border-b-2 border-brand-primary/80 flex items-center justify-center text-white">
            <Armchair className="w-3 h-3" />
          </div>
          <span>Silla Disponible</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-t-md border-b-2 border-blue-800 flex items-center justify-center text-white">
            <Accessibility className="w-3 h-3" />
          </div>
          <span>Discapacidad (VIP/Accesible)</span>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded-t-md border-b-2 border-orange-700 flex items-center justify-center text-white">
              <Wrench className="w-3 h-3" />
            </div>
            <span>En Mantenimiento</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white border border-dashed border-slate-300 rounded-t-md" />
          <span>Pasillo (Vacío)</span>
        </div>
      </div>
    </div>
  );
}