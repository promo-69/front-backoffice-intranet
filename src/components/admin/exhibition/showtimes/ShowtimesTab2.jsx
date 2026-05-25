import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

export function ShowtimesTab({ 
  data, 
  onEdit, 
  onDelete,
  moviesList = [],
}) {
  
  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString();
  };

  return (
    <div className="mt-4 overflow-hidden bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b">
          <tr>
            <th className="py-4 px-4">Película</th>
            <th className="py-4 px-4">Reserva de Sala / Proyección</th>
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
                No hay funciones planificadas.
              </td>
            </tr>
          ) : (
            data.map((st) => {
              // 2. BUSCAMOS LA COINCIDENCIA EN CALIENTE:
              // Comparamos el ID que viene en la función (st.movie_id o st.movie) con nuestra lista
              const targetMovieId = st.movie_id || st.movie;
              const matchingMovie = moviesList.find(
                (m) => String(m.id) === String(targetMovieId)
              );

              return (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* COLUMNA: PELÍCULA (Ajustada para renderizar el Título Real) */}
                  <td className="py-4 px-4 font-medium text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase tracking-tight text-[11px]">
                        {matchingMovie ? matchingMovie.title : `Película ID: #${targetMovieId}`}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {matchingMovie?.durationMinutes ? `${matchingMovie.durationMinutes} min` : "Duración no esp."}
                      </span>
                    </div>
                  </td>

                  {/* RESERVA / PROYECCIÓN */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="font-semibold text-slate-600">
                      {st.booking_desc || `Sala Slot ID: ${st.booking}`}
                    </div>
                    <div className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mt-0.5">
                      {st.projection_type_desc || `Código Tipo: ${st.projection_type}`}
                    </div>
                  </td>

                  {/* FECHA */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(st.date || st.start_time)}</span>
                    </div>
                  </td>

                  {/* HORARIO */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(st.start_time)}</span>
                    </div>
                  </td>

                  {/* PRECIO */}
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    <div className="font-bold">
                      {Number(st.currency) === 2 ? (
                        <span>Bs. {parseFloat(st.price).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span>$ {parseFloat(st.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                      {st.earned_loyalty_points ? `+ ${st.earned_loyalty_points} Pts fidelidad` : "No acumula puntos"}
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