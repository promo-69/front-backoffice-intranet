import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

export function ShowtimesTab({ 
  data = [], 
  onEdit, 
  onDelete, 
  moviesList = [],    // Lista de películas de la BD
  bookingsList = [],  // Lista de room_bookings (las dueñas del tiempo)
  roomsList = []      // Lista de salas del endpoint independiente /rooms
}) {
  
  // Helpers para dar formato legible a los datos ISO de la base de datos
  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString();
  };

  // UN SOLO RETURN PRINCIPAL PARA TODO EL COMPONENTE
  return (
    <div className="mt-4 overflow-hidden bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b">
          <tr>
            <th className="py-4 px-4">Película</th>
            <th className="py-4 px-4">Sala / Horario de Proyección</th>
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
            // Recorremos el JSON plano de funciones que nos dio el GET
            data.map((st) => {
              
              // 1. PUENTE PELÍCULA: Buscamos el objeto película que coincida con st.movie
              const movieMatch = moviesList.find(m => String(m.id) === String(st.movie));
              
              // 2. PUENTE RESERVA: Buscamos la reserva en room_bookings que coincida con st.booking
              const bookingMatch = bookingsList.find(b => String(b.id) === String(st.booking));

              // 3. IDENTIFICAR SALA: Extraemos el room_id que está guardado dentro de la reserva encontrada
              const targetRoomId = bookingMatch?.room || bookingMatch?.room_id;

              // 4. PUENTE SALA EXCLUSIVO: Buscamos en la lista de /rooms el nombre real de esa sala
              const roomMatch = roomsList.find(r => String(r.id) === String(targetRoomId));

              // Resolvemos el nombre de la sala (o mostramos el ID como salvavidas si la red está lenta)
              const roomDisplayName = roomMatch 
                ? (roomMatch.name || roomMatch.name_desc || `Sala ${roomMatch.number}`) 
                : `Sala Num. #${targetRoomId || '?'}`;

              return (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* COLUMNA PELÍCULA */}
                  <td className="py-4 px-4 font-medium text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase tracking-tight text-[11px]">
                        {movieMatch ? movieMatch.title : `Película ID: #${st.movie}`}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {movieMatch?.duration_minutes ? `${movieMatch.duration_minutes} min` : "Duración no esp."}
                      </span>
                    </div>
                  </td>

                  {/* COLUMNA SALA Y DETALLE DE PROYECCIÓN */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="font-bold text-slate-700">
                      {bookingMatch 
                        ? `${roomDisplayName} (${formatTime(bookingMatch.start_time)} - ${formatTime(bookingMatch.end_time)})` 
                        : `${roomDisplayName} (Sin horario reservado)`}
                    </div>
                    <div className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mt-0.5">
                      {/* projection_type suele venir como ID, dejamos un fallback descriptivo */}
                      {st.projection_type_desc || `Tipo de Proyección ID: #${st.projection_type}`}
                    </div>
                  </td>

                  {/* COLUMNA FECHA (Extraída del start_time de la reserva) */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(bookingMatch?.start_time)}</span>
                    </div>
                  </td>

                  {/* COLUMNA HORARIO DE INICIO */}
                  <td className="py-4 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(bookingMatch?.start_time)}</span>
                    </div>
                  </td>

                  {/* COLUMNA PRECIO MONEDA LOCAL / EXTRANJERA */}
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    <div className="font-bold">
                      {Number(st.currency) === 2 ? (
                        <span>Bs. {parseFloat(st.price).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span>$ {parseFloat(st.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                      {st.earned_loyalty_points ? `+ ${st.earned_loyalty_points} Pts` : "0 Pts"}
                    </div>
                  </td>

                  {/* BOTONES DE ACCIONES */}
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