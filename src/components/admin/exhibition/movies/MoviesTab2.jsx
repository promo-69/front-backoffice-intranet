import { Pencil, Trash2, Film, Clock, Calendar } from "lucide-react";

export function MoviesTab({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-cineflix border border-cineflix shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-400 uppercase border-b border-gray-50 font-montserrat">
            <th className="py-4 px-6 text-center">Póster</th>
            <th className="py-4 px-4">Información</th>
            <th className="py-4 px-4">Géneros</th>
            <th className="py-4 px-4 text-center">Clasificación</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-6 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length > 0 ? (
            data.map((movie) => (
              <tr key={movie.id} className="hover:bg-gray-50/40 transition-colors group">
                <td className="py-4 px-6 flex justify-center">
                  <div className="w-12 h-16 relative">
                    {movie.poster_url ? (
                        <img src={movie.poster_url} className="w-full h-full object-cover rounded-lg shadow-sm" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <Film className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-sm">{movie.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {movie.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {movie.release_date?.split('T')[0]}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {movie._MovieGenres?.map((g) => (
                      <span key={g.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">
                        {g._Genre?.description}
                      </span>
                    )) || <span className="text-gray-300 italic">N/A</span>}
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <span className="px-2 py-1 rounded bg-brand-primary/5 text-brand-primary font-black text-[10px] border border-brand-primary/10">
                    {movie._AgeClassification?.description || "N/A"}
                  </span>
                </td>

                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                    {getStateBadge(movie.lifecycle_state)}
                   </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit("movieForm", movie)} className="p-2 hover:bg-brand-primary/10 text-brand-primary rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete("delete", movie)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="py-12 text-center text-gray-400 italic">No hay registros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function getStateBadge(id) {
    const badges = {
        1: "bg-blue-50 text-blue-600 border-blue-100",
        2: "bg-green-50 text-green-600 border-green-100",
        3: "bg-purple-50 text-purple-600 border-purple-100"
    };
    const labels = { 1: "Próximamente", 2: "En Cartelera", 3: "Especial" };
    return <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase border ${badges[id] || "bg-gray-50 text-gray-400"}`}>{labels[id] || "Oculto"}</span>;
}