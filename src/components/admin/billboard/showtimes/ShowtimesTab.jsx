import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

export function ShowtimesTab({ data, onEdit, onDelete, isLoading = false }) {
  
  console.log("¿Qué le llega a la Tabla?", data);

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleDateString();
  };
  
  
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Película / Evento</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Sala</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Fecha</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Horario</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Precio</th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">Puntos</th>
            <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {/* ESTADO DE CARGA (SKELETON) */}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-12 mx-auto"></div></td>
                <td className="py-4 px-4"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}

          {/* ESTADO VACÍO */}
          {!isLoading && 
          data.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-500 font-montserrat">
                No hay funciones ni eventos planificados para los filtros seleccionados.
              </td>
            </tr>
          )}
          
          {!isLoading &&
          data.map((st) => {
            const displayTitle = st.movie?.title || st.event?.title || st.event?.name || st.title || st.name || `Elemento #${st.id}`;
            
            const displayDuration = st.movie?.duration_minutes || st.event?.duration_minutes || st.event?.durationMinutes || st.duration_minutes || st.durationMinutes;
            
            const roomName = st.room?.name || "N/A";
            const projectionDesc = st.projection_type?.description || "Digital";
            const languageDesc = st.language?.description || "";
            const currencySymbol = st.currency?.symbol || "$";
            const currencyCode = st.currency?.code || "USD";

            return (
              <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                
                {/* COLUMNA PELÍCULA / EVENTO */}
                <td className="py-4 px-4 font-medium text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-bold uppercase tracking-tight text-[11px]">
                      {displayTitle}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      {displayDuration ? `${displayDuration} min` : "Duración no esp."}
                    </span>
                  </div>
                </td>

                {/* COLUMNA SALA Y PROYECCIÓN */}
                <td className="py-4 px-4 text-slate-500">
                  <div className="font-bold text-slate-700">{roomName}</div>
                  <div className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mt-0.5">
                    {projectionDesc} {languageDesc && `• ${languageDesc}`}
                  </div>
                </td>

                {/* COLUMNA FECHA */}
                <td className="py-4 px-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(st.start_time)}</span>
                  </div>
                </td>

                {/* COLUMNA HORARIO */}
                <td className="py-4 px-4 text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTime(st.start_time)} - {formatTime(st.end_time)}</span>
                  </div>
                </td>

                {/* COLUMNA PRECIO */}
                <td className="py-4 px-4 text-slate-600 font-medium">
                  <div className="font-bold">
                    {currencyCode === "VES" ? (
                      <span>Bs. {parseFloat(st.price).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span>{currencySymbol} {parseFloat(st.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </td>

                {/* COLUMNA PUNTOS DE FIDELIDAD */}
                <td className="py-4 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
                    {st.earned_loyalty_points ? `+${st.earned_loyalty_points}` : "0"} Pts
                  </span>
                </td>

                {/* ACCIONES */}
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onEdit(st)}
                      className="p-2 border rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(st)}
                      className="p-2 border rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}