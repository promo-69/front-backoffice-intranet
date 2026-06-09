import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";

const CLASSIFICATION_FALLBACK = { 1: "A (Todo Público)", 2: "B (+12)", 3: "C (+15)", 4: "D (+18)" };

export function EventsTab({ data, onEdit, onDelete, isLoading }) {
  // Generamos 6 filas de carga estables
  const skeletonRows = Array(6).fill(null);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat bg-gray-50 text-[10px]">
            <th className="py-4 px-6 text-center">Póster</th>
            <th className="py-4 px-4">Información</th>
            <th className="py-4 px-4">Descripción</th>
            <th className="py-4 px-4 text-center">Clasificación</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-brand-primary">
          {isLoading ? (
            /* ESQUELETO UNIFORME Y LIMPIO */
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-6"><div className="w-10 h-14 bg-slate-200 rounded mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-32 mb-2"></div><div className="h-2.5 bg-slate-200 rounded w-20"></div></td>
                <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-48"></div></td>
                <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-16 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <div className="w-7 h-7 bg-slate-200 rounded"></div>
                    <div className="w-7 h-7 bg-slate-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))
          ) : data && data.length > 0 ? (
            /* RENDERIZADO DE DATOS DEL EVENTO */
            data.map((event) => (
              <tr key={event.id} className="hover:bg-brand-primary/5 transition-colors group">
                <td className="py-4 px-6 flex justify-center">
                  <div className="w-12 h-16 relative">
                    {event.poster_url ? (
                      <img src={event.poster_url} className="w-full h-full object-cover rounded-lg shadow-sm" alt={event.title} />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <Film className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-brand-primary text-sm">{event.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-brand-gold"/> {event.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-brand-gold"/> {event.release_date?.split('T')[0]}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-slate-600 line-clamp-2 max-w-[250px] text-[11px]">
                    {event.description || <span className="text-gray-300 italic">Sin descripción</span>}
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-1 rounded bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/10 whitespace-nowrap">
                    {event.age_classification_detail?.description || CLASSIFICATION_FALLBACK[event.age_classification] || "N/A"}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    {getStateBadge(event.lifecycle_state, event.lifecycle_state_detail)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit("eventForm", event)} className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete("delete", event)} className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-50 hover:text-white transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-12 text-slate-400 font-montserrat uppercase text-[10px] tracking-widest font-bold">
                No hay eventos especiales disponibles
              </td>
            </tr>
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
      {description || labelsFallback[id] || "Oculto"}
    </span>
  );
}