import { Pencil, Trash2, Film } from "lucide-react";

export function MoviesTab({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase border-b font-montserrat">
            <th className="py-4 px-6 text-center">Póster</th>
            <th className="py-4 px-4">Título</th>
            <th className="py-4 px-4 text-center">Información</th>
            <th className="py-4 px-4 text-center">Clasificación</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((movie) => (
              <tr key={movie.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Columna Póster */}
                <td className="py-4 px-6 flex justify-center">
                  {movie.posterUrl ? (
                      <img 
                        src={movie.posterUrl} 
                        alt={movie.title} 
                        className="w-12 h-16 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Film className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                </td>

                {/* Columna Título */}
                <td className="py-4 px-4 font-bold text-gray-800">
                  {movie.title}
                </td>

                <td className="py-4 px-4">
                  <span className="text-[10px] text-gray-400 font-medium">
                      {movie.durationMinutes} min • Estreno: {movie.releaseDate}
                  </span>
                </td>
                
                {/* Columna Clasificación */}
                <td className="py-4 px-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold text-[10px] border border-gray-200">
                    {getAgeLabel(movie.ageClassificationId)}
                  </span>
                </td>

                {/* Columna Estado */}
                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                    {getStateBadge(movie.lifecycleStates)}
                   </div>
                </td>

                {/* Columna Acciones */}
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          onEdit(movie);
                        }}
                      className="text-brand-primary hover:scale-110 transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          onDelete(movie);
                        }}
                      className="text-red-500 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-400">
                No se encontraron películas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function getAgeLabel(id) {
    const labels = { 1: "A", 2: "B", 3: "C", 4: "D" };
    return labels[id] || "N/A";
}

function getStateBadge(id) {
    switch(id) {
        case 1: 
            return <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-tighter border border-blue-100">Próximamente</span>;
        case 2: 
            return <span className="px-2 py-1 rounded-lg bg-green-50 text-green-600 font-black text-[10px] uppercase tracking-tighter border border-green-100">En Cartelera</span>;
        case 3: 
            return (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-primary/10 text-brand-primary font-black text-[10px] uppercase tracking-tighter border border-brand-primary/20">
                    <span>Evento Especial</span>
                </div>
            );
        default: 
            return <span className="px-2 py-1 rounded-lg bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-tighter">Inactivo</span>;
    }
}