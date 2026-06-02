import { Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";

export function ShowtimesTab({ 
  data, 
  onEdit, 
  onDelete 
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
        <table className="w-full text-left text-xs font-montserrat">
          <thead>
            <tr className="text-gray-600 uppercase tracking-wider border-b border-border">
              <th className="py-4 px-4">Película</th>
              <th className="py-4 px-4">Sala</th>
              <th className="py-4 px-4 text-center">Fecha</th>
              <th className="py-4 px-4 text-center">Horario</th>
              <th className="py-4 px-4 text-center">Precio</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-slate-700">
            {data.map((st) => (
              <tr key={st.id} className="hover:bg-brand-primary/5 transition-colors">
                <td className="py-4 px-4 font-bold text-brand-primary">{st.movie_title}</td>
                <td className="py-4 px-4">{st.room_name}</td>
                
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {st.date}
                  </div>
                </td>

                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2 font-medium">
                    <Clock className="w-3 h-3 text-brand-gold" />
                    {st.start_time} - {st.end_time}
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-bold text-green-600">${st.price}</td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => onEdit(st)}
                      className="text-brand-primary hover:scale-110 transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(st)}
                      className="text-red-500 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}