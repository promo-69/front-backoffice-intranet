import { Pencil, Trash2, Clock, Image as ImageIcon, Eye } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";

export function MoviesTab({ 
  table, 
  totalElements, 
  onView, 
  onEdit, 
  onDelete, 
  onSelectMovie, 
  selectedId 
}) {
 
  const data = table.getRowModel().rows;

  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
              <th className="py-4 px-6 w-16 text-center">Póster</th>
              <th className="py-4 px-4">Película</th>
              <th className="py-4 px-4">Género</th>
              <th className="py-4 px-4 text-center">Duración</th>
              <th className="py-4 px-4 text-center">Clasificación</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {data.map((row) => {
              const movie = row.original;
              const isSelected = String(selectedId) === String(movie.id);
              const posterSrc = movie.poster || movie.imagenUrl || movie.poster_url;

              return (
                <tr
                  key={movie.id}
                  onClick={() => onSelectMovie?.(isSelected ? null : movie.id)}
                  className={`
                    transition-colors cursor-pointer group font-montserrat
                    hover:bg-brand-primary/10
                    ${isSelected ? "bg-brand-primary/20" : "bg-transparent"}
                  `}
                >
                  {/* PÓSTER */}
                  <td className="py-2 px-6">
                    <div className="w-10 h-14 mx-auto rounded-md overflow-hidden bg-slate-200 border border-border flex items-center justify-center shadow-sm">
                      {posterSrc ? (
                        <img 
                          src={posterSrc} 
                          alt={movie.titulo || movie.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ""; }} 
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </td>

                  {/* TÍTULO */}
                  <td className="py-4 px-4 font-bold text-slate-700">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm uppercase tracking-tight truncate max-w-[200px]">
                        {movie.titulo || movie.title}
                      </span>
                    </div>
                  </td>

                  {/* GÉNERO */}
                  <td className="py-4 px-4 text-gray-500 italic">
                    {movie.genero || "No definido"}
                  </td>

                  {/* DURACIÓN */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 font-medium">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>{movie.duracion || movie.duration_minutes || "0"} min</span>
                    </div>
                  </td>

                  {/* CLASIFICACIÓN */}
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                      {movie.clasificacion || movie.age_classification || "S.C"}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(movie);
                        }}
                        className="text-slate-400 hover:text-brand-primary hover:scale-110 transition-all"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* BOTÓN EDITAR: Envía el objeto 'movie' completo al padre */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(movie); 
                        }}
                        className="text-brand-primary hover:scale-110 transition-transform"
                        title="Editar película"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(movie);
                        }}
                        className="text-red-500 hover:scale-110 transition-transform"
                        title="Eliminar película"
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

      <CustomPagination 
        table={table} 
        totalElements={totalElements} 
        label="películas" 
      />
    </div>
  );
}