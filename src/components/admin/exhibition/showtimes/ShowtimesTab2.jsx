import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

export function ShowtimesTab({ data, onEdit, onDelete }) {
  // Formateador para la hora (Ej: 07:00 PM)
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Formateador para la fecha (Ej: 12/05/2026)
  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString();
  };

  return (
    <div className="mt-4 overflow-hidden bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs font-montserrat">
        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
          <tr>
            <th className="py-4 px-4">Película</th>
            <th className="py-4 px-4">Sala / Tipo de Proyección</th>
            <th className="py-4 px-4 ">Fecha</th>
            <th className="py-4 px-4 ">Horario</th>
            <th className="py-4 px-4 ">Precio</th>
            <th className="py-4 px-4 ">Puntos de Fidelidad</th>
            <th className="py-4 px-6 ">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border text-brand-primary">
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-10 text-center text-slate-400"> No hay funciones programadas</td>
            </tr>
          ) : (
            data.map((st) => (
              <tr key={st.id} className="hover:bg-brand-primary/5 transition-colors group">
                <td className="py-4 px-4">
                  <div className="font-bold text-brand-primary text-sm">
                    {st._Movie?.title || "Película no encontrada"}
                  </div>

                </td>
                 <td className="py-4 px-4">
                  <div className="text-[10px] text-slate-600 uppercase font-medium">
                    {st._Room?.name || "Sin Sala"} • {st._ProjectionType?.description}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                    {formatDate(st.start_time)}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    {formatTime(st.start_time)} - {formatTime(st.end_time)}
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {st._Movie?.duration_minutes} min de duración
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-black text-green-600 text-sm">
                    {st._Currency?.symbol || "$"}{st.price}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase">
                    {st._Currency?.code || "USD"} • {st.earned_loyalty_points} pts
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-[9px] text-slate-400 uppercase">
                    {st.earned_loyalty_points} pts
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => onEdit("showtimeForm", st)}
                      className="p-2 bg-white border border-border rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete("delete", st)}
                      className="p-2 bg-white border border-border rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
  