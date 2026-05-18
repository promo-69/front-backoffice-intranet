import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";

// Arreglos de traducción basados en tus estructuras para resolver la falta de objetos anidados del backend
const GENRES_MAP = {
  1: 'Acción',
  2: 'Comedia',
  3: 'Drama',
  4: 'Ciencia Ficción',
  5: 'Terror / Suspenso',
  6: 'Animación / Infantil'
};

const CLASSIFICATION_MAP = {
  1: "A (Todo Público)",
  2: "B (+12)",
  3: "C (+15)",
  4: "D (+18)"
};

export function MoviesTab({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-6 text-center">Póster</th>
            <th className="py-4 px-4">Información</th>
            <th className="py-4 px-4">Géneros</th>
            <th className="py-4 px-4 text-center">Clasificación</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data && data.length > 0 ? (
            data.map((movie) => (
              <tr key={movie.id} className="hover:bg-gray-50/40 transition-colors group">
                
                {/* PÓSTER */}
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

                {/* INFORMACIÓN BÁSICA */}
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-sm">{movie.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3"/> {movie.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> {movie.release_date?.split('T')[0]}
                      </span>
                    </div>
                  </div>
                </td>

                {/* GÉNEROS (CORREGIDO: Lee la propiedad numérica .genre del backend) */}
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {movie._MovieGenres && movie._MovieGenres.length > 0 ? (
                      movie._MovieGenres.map((g) => (
                        <span key={g.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">
                          {GENRES_MAP[g.genre] || "Otro"}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 italic text-[10px]">Sin géneros</span>
                    )}
                  </div>
                </td>
                
                {/* CLASIFICACIÓN (CORREGIDO: Traduce el ID numérico age_classification) */}
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-1 rounded bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/10 whitespace-nowrap">
                    {CLASSIFICATION_MAP[movie.age_classification] || "N/A"}
                  </span>
                </td>

                {/* ESTADO DE CICLO DE VIDA (CORREGIDO) */}
                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                    {getStateBadge(movie.lifecycle_state)}
                   </div>
                </td>

                {/* ACCIONES */}
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onEdit("movieForm", movie)} 
                      className="p-2 hover:bg-brand-primary/10 text-brand-primary rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete("delete", movie)} 
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400 font-montserrat uppercase text-[10px] tracking-widest font-bold">
                No hay películas disponibles en esta página
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper corregido y mapeado perfectamente a tu MOCK_LIFECYCLE del padre
function getStateBadge(id) {
    const badges = {
        1: "bg-blue-50 text-blue-600 border-blue-100",        // Próximamente
        2: "bg-emerald-50 text-emerald-600 border-emerald-100", // En Cartelera (Estreno)
        3: "bg-purple-50 text-purple-600 border-purple-100",  // En Cartelera (Regular)
        4: "bg-amber-50 text-amber-600 border-amber-100",      // Últimos Días
        5: "bg-rose-50 text-rose-600 border-rose-100"          // Fuera de Cartelera
    };
    
    const labels = { 
        1: "Próximamente", 
        2: "Estreno", 
        3: "Cartelera", 
        4: "Últimos Días", 
        5: "Fuera de Cartelera" 
    };

    return (
      <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase border ${badges[id] || "bg-gray-50 text-gray-400 border-gray-100"}`}>
        {labels[id] || "Oculto"}
      </span>
    );
}