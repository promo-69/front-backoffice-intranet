import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

const CLASSIFICATION_FALLBACK = { 1: "A (Todo Público)", 2: "B (+12)", 3: "C (+15)", 4: "D (+18)" };

export function EventsTab({ data = [], onEdit, onDelete, isLoading = false }) {
  const skeletonRows = Array(5).fill(0);

  // Formateador de fecha personalizado idéntico al de Películas: (Viern, 26 Jun 2026)
  const formatEventDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Viern", "Sáb"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const d = new Date(dateStr);
    return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Póster</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Título</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600 text-center">Duración</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600 text-center">Fecha Estreno</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600 text-center">Clasificación</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600 text-center">Estado</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600 text-center w-28">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#4B2E83]/40">
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-16 w-12 bg-gray-200 rounded-lg mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-24 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}

          {!isLoading && data.length > 0 ? (
            data.map((event) => {
              const effectiveId = event.id || event.event_id;
              const poster = event.posterUrl || event.poster_url;
              const duration = event.durationMinutes || event.duration_minutes || "0";
              const releaseDate = event.releaseDate || event.release_date;

              return (
                <tr key={effectiveId} className="hover:bg-brand-primary/5 transition-colors group">
                  {/* PÓSTER */}
                  <td className="py-4 px-6 flex justify-center">
                    <div className="w-12 h-16 relative">
                      {poster ? (
                        <img src={poster} className="w-full h-full object-cover rounded-lg shadow-sm" alt={event.title} />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Film className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* TÍTULO */}
                  <td className="py-4 px-4">
                    <h4 className="font-bold text-brand-primary text-sm line-clamp-1">{event.title}</h4>
                  </td>

                  {/* DURACIÓN */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>{duration} min</span>
                    </div>
                  </td>

                  {/* FECHA ESTRENO */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span className="whitespace-nowrap">{formatEventDate(releaseDate)}</span>
                    </div>
                  </td>

                  {/* CLASIFICACIÓN */}
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold inline-block border bg-slate-100 text-slate-600 border-slate-200 border-brand-primary/10 whitespace-nowrap">
                      {event.ageClassificationDetail?.description || 
                       event.age_classification_detail?.description || 
                       CLASSIFICATION_FALLBACK[event.ageClassification || event.age_classification] || 
                       "N/A"}
                    </span>
                  </td>

                  {/* ESTADO */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                      {getStateBadge(
                        event.lifecycleState || event.lifecycle_state, 
                        event.lifecycleStateDetail || event.lifecycle_state_detail
                      )}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <DisableIfNoPermission permission={"CRUD:UPDATE:SPECIAL_EVENTS"} title="No tienes permiso para editar eventos">
                        <button 
                          onClick={() => onEdit(event)} 
                          className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                          title="Editar evento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </DisableIfNoPermission>
                      <DisableIfNoPermission permission={"CRUD:DELETE:SPECIAL_EVENTS"} title="No tienes permiso para eliminar eventos">
                        <button 
                          onClick={() => onDelete(event)} 
                          className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </DisableIfNoPermission>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-12 text-slate-400 uppercase text-[11px] tracking-widest font-bold">
                No hay eventos disponibles en esta página
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
    const foundEntry = Object.entries(labelsFallback).find(
      ([_, label]) => label.toLowerCase() === description.toLowerCase()
    );
    if (foundEntry) effectiveId = Number(foundEntry[0]);
  }

  const textToShow = description || labelsFallback[effectiveId] || "Oculto";
  const badgeClass = badges[effectiveId] || "bg-gray-50 text-gray-400 border-gray-100";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${badgeClass}`}>
      {textToShow}
    </span>
  );
}