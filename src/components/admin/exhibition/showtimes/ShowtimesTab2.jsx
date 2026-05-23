import { Pencil, Trash2, Clock, Calendar, Film } from "lucide-react";

export function ShowtimesTab({ data, onEdit, onDelete }) {
  
  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-4 overflow-hidden bg-white rounded-cineflix border border-gray-100 shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-4 px-4">Película</th>
            <th className="py-4 px-4">Sucursal / Complejo</th>
            <th className="py-4 px-4">Sala / Formato</th>
            <th className="py-4 px-4 text-center">Fecha</th>
            <th className="py-4 px-4 text-center">Horario</th>
            <th className="py-4 px-4 text-center">Precio Base</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-brand-primary">
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-12 text-center text-slate-400 font-light"> 
                No hay funciones programadas en este bloque
              </td>
            </tr>
          ) : (
            data.map((st) => {         
              const currentMovie = st.Movie || st._Movie;
              const currentRoom = st.Room || st._Room;
              const currentProjection = st.ProjectionType || st._ProjectionType;
              const currentCurrency = st.Currency || st._Currency;

              return (
                <tr key={st.id} className="hover:bg-brand-primary/5 transition-colors group">
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-brand-gold shrink-0" />
                      <div className="font-bold text-brand-primary text-sm line-clamp-1">
                        {currentMovie?.title || "Película no encontrada"}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-medium text-slate-700">
                    {currentRoom?.Branch?.name || currentRoom?._Branch?.name || st.branch_name || "Complejo Central"}
                  </td>
                   
                   <td className="py-4 px-4">
                    <div className="text-[11px] text-slate-600 font-semibold uppercase">
                      {currentRoom?.name || `Sala ${currentRoom?.number || "N/A"}`}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      Formato: {currentProjection?.name || currentProjection?.description || "Estándar"}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      {formatDate(st.start_time)}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      {formatTime(st.start_time)} - {formatTime(st.end_time)}
                    </div>
                    <span className="text-[9px] text-slate-400 font-light block mt-0.5">
                      {currentMovie?.duration_minutes || 0} min de duración
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="font-black text-green-600 text-sm">
                      {currentCurrency?.symbol || "$"}{parseFloat(st.price || 0).toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase font-medium">
                      {currentCurrency?.code || "USD"} • +{st.earned_loyalty_points || 0} pts
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit("showtimeForm", st)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDelete("delete", st)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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