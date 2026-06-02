import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

export function ShowtimesTab({ data = [], onEdit, onDelete }) {
  
  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleDateString();
  };

  return (
    <div className="mt-4 overflow-hidden bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b">
          <tr>
            <th className="py-4 px-4">Película</th>
            <th className="py-4 px-4">Sala</th>
            <th className="py-4 px-4">Fecha</th>
            <th className="py-4 px-4">Horario</th>
            <th className="py-4 px-4">Precio</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400 font-bold">
                No hay funciones planificadas para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            data.map((st) => {
              // Desestructuramos la rica información anidada provista por el backend
              const movieTitle = st.movie?.title || `Película #${st.movie_id}`;
              const movieDuration = st.movie?.duration_minutes;
              const roomName = st.room?.name ;
              const projectionDesc = st.projection_type?.description || "Digital";
              const languageDesc = st.language?.description || "";
              const currencySymbol = st.currency?.symbol || "$";
              const currencyCode = st.currency?.code || "USD";

              return (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* COLUMNA PELÍCULA */}
                  <td className="py-4 px-4 font-medium text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase tracking-tight text-[11px]">
                        {movieTitle}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {movieDuration ? `${movieDuration} min` : "Duración no esp."}
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
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                      {st.earned_loyalty_points ? `+ ${st.earned_loyalty_points} Pts` : "0 Pts"}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit("showtimeForm", st)}
                        className="p-2 border rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete("delete", st)}
                        className="p-2 border rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
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