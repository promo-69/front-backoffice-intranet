import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";

export function MoviesTab({ data, onEdit, onDelete, isLoading = false }) {
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead>
          <tr className="text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
            <th className="px-4 py-3 text-left">Póster</th>
            <th className="py-4 px-4">Información</th>
            <th className="py-4 px-4">Géneros</th>
            <th className="py-4 px-4">Idiomas</th>
            <th className="py-4 px-4 text-center">Clasificación</th>
            <th className="py-4 px-4 text-center">Tipos de Proyección</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#4B2E83]/40">
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}

          {!isLoading && data.length > 0 ? (
            data.map((movie) => (
              <tr key={movie.id} className="hover:bg-brand-primary/5 transition-colors group">
                <td className="py-4 px-6 flex justify-center">
                  <div className="w-12 h-16 relative">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} className="w-full h-full object-cover rounded-lg shadow-sm" alt={movie.title} />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <Film className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-brand-primary text-sm">{movie.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-brand-gold"/> {movie.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-brand-gold"/> {movie.release_date?.split('T')[0]}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {movie.genres && movie.genres.length > 0 ? (
                      movie.genres.map((g) => (
                        <span key={g.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase border border-slate-200">
                          {g._Genres?.description || g.description || "Otro"}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 italic text-[10px]">Sin géneros</span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {movie.languages && movie.languages.length > 0 ? (
                      movie.languages.map((lang) => (
                        <span key={lang.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase border border-slate-200">
                          {lang._Languages?.description || lang.description || "Otro"}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 italic text-[10px]">Sin idiomas</span>
                    )}
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-1 rounded bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/10 whitespace-nowrap">
                    {movie.age_classification?.description || "N/A"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {movie.projection_types && movie.projection_types.length > 0 ? (
                      movie.projection_types.map((pt) => (
                        <span key={pt.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase border border-slate-200">
                          {pt._ProjectionTypes?.description || pt.description || "Otro"}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 italic text-[10px]">Sin proyecciones</span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                    {getStateBadge(movie.lifecycle_state?.id, movie.lifecycle_state)}
                   </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    {/* Corrección de parámetros enviados al callback de acción */}
                    <button 
                      onClick={() => onEdit(movie)} 
                      className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDelete(movie)} 
                      className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-50 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-12 text-slate-400 uppercase text-[11px] tracking-widest font-bold">
                No hay películas disponibles en esta página
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
        1: "Próximamente", 2: "En Cartelera (Estreno)", 3: "En Cartelera (Regular)", 4: "Últimos Días", 5: "Fuera de Cartelera"
    };

    let effectiveId = id;
    const description = nestedObject?.description || nestedObject?.name;

    if (!effectiveId && description) {
        const foundEntry = Object.entries(labelsFallback).find(
            ([_, label]) => label.toLowerCase() === description.toLowerCase()
        );
        if (foundEntry) effectiveId = Number(foundEntry[0]);
    }

    const textToShow = description || labelsFallback[id] || "Oculto";
    const badgeClass = badges[effectiveId] || "bg-gray-50 text-gray-400 border-gray-100";

    return (
      <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase border ${badgeClass}`}>
        {textToShow}
      </span>
    );
}