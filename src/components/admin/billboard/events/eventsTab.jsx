import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";

const CLASSIFICATION_FALLBACK = { 1: "A (Todo Público)", 2: "B (+12)", 3: "C (+15)", 4: "D (+18)" };

export function EventsTab({ data = [], onEdit, onDelete, isLoading }) {
  // Genera un array de 6 elementos para renderizar las filas de carga
  const skeletonRows = Array(6).fill(null);

  return (
    <div className="overflow-x-auto w-full bg-white rounded-xl shadow-sm border border-slate-100">
      <table className="w-full text-left border-collapse font-montserrat text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
            <th className="py-3 px-4 text-center w-20">Póster</th>
            <th className="py-3 px-4">Título</th>
            <th className="py-3 px-4">Duración</th>
            <th className="py-3 px-4">Fecha Estreno</th>
            <th className="py-3 px-4 text-center">Clasificación</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-center w-28">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {isLoading ? (
            // --- MUESTRA SKELETON EN ESTADO DE CARGA ---
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="w-12 h-16 bg-slate-200 rounded-lg mx-auto" />
                </td>
                <td className="py-4 px-4 align-middle">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </td>
                <td className="py-4 px-4 align-middle">
                  <div className="h-4 bg-slate-200 rounded w-20" />
                </td>
                <td className="py-4 px-4 align-middle">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </td>
                <td className="py-4 px-4 align-middle text-center">
                  <div className="h-5 bg-slate-200 rounded w-16 mx-auto" />
                </td>
                <td className="py-4 px-4 align-middle text-center">
                  <div className="h-5 bg-slate-200 rounded w-20 mx-auto" />
                </td>
                <td className="py-4 px-4 align-middle">
                  <div className="flex justify-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            // --- MENSAJE DE TABLA VACÍA ---
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                No se encontraron eventos registrados.
              </td>
            </tr>
          ) : (
            // --- RENDERIZADO DE DATOS DEL EVENTO ---
            data.map((event) => {
              const effectiveId = event.id || event.event_id;

              return (
                <tr key={effectiveId} className="hover:bg-brand-primary/5 transition-colors group">
                  {/* 1. PÓSTER */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-16 relative mx-auto">
                      {event.posterUrl || event.poster_url ? (
                        <img 
                          src={event.posterUrl || event.poster_url} 
                          className="w-full h-full object-cover rounded-lg shadow-sm" 
                          alt={event.title} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Film className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 2. TÍTULO */}
                  <td className="py-3 px-4 align-middle">
                    <h4 className="font-bold text-brand-primary text-sm line-clamp-1">{event.title}</h4>
                  </td>

                  {/* 3. DURACIÓN */}
                  <td className="py-3 px-4 align-middle text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0"/> 
                      {event.durationMinutes || event.duration_minutes || "0"} min
                    </span>
                  </td>

                  {/* 4. FECHA ESTRENO */}
                  <td className="py-3 px-4 align-middle text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0"/> 
                      {(event.releaseDate || event.release_date)?.split('T')[0] || "N/A"}
                    </span>
                  </td>

                  {/* 5. CLASIFICACIÓN */}
                  <td className="py-3 px-4 align-middle text-center">
                    <span className="px-2 py-1 rounded bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/10 whitespace-nowrap">
                      {event.ageClassificationDetail?.description || 
                       event.age_classification_detail?.description || 
                       CLASSIFICATION_FALLBACK[event.ageClassification || event.age_classification] || 
                       "N/A"}
                    </span>
                  </td>

                  {/* 6. ESTADO */}
                  <td className="py-3 px-4 align-middle text-center">
                    <div className="flex justify-center">
                      {getStateBadge(
                        event.lifecycleState || event.lifecycle_state, 
                        event.lifecycleStateDetail || event.lifecycle_state_detail
                      )}
                    </div>
                  </td>

                  {/* 7. ACCIONES */}
                  <td className="py-3 px-4 align-middle">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit(event)} 
                        className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                        title="Editar evento"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDelete(event)} 
                        className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>   
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function getStateBadge(id, nestedObject) {
  const badges = { 
    1: "bg-blue-50 text-blue-600 border-blue-100", 
    2: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    3: "bg-purple-50 text-purple-600 border-purple-100", 
    4: "bg-amber-50 text-amber-600 border-amber-100", 
    5: "bg-rose-50 text-rose-600 border-rose-100" 
  };
  
  const labelsFallback = { 
    1: "Próximamente", 
    2: "En Cartelera (Estreno)", 
    3: "En Cartelera (Regular)", 
    4: "Últimos Días", 
    5: "Fuera de Cartelera" 
  };

  let effectiveId = id;
  const description = nestedObject?.description || nestedObject?.name;

  if (!effectiveId && description) {
    const foundEntry = Object.entries(labelsFallback).find(([_, label]) => label.toLowerCase() === description.toLowerCase());
    if (foundEntry) effectiveId = Number(foundEntry[0]);
  }

  return (
    <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase border ${badges[effectiveId] || "bg-gray-50 text-gray-400 border-gray-100"}`}>
      {description || labelsFallback[effectiveId] || "Oculto"}
    </span>
  );
}