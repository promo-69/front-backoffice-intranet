import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMovies, deleteMovie } from "@/services/movie.service";
import { useModal } from "@/hooks/useModal";

// Importamos el nuevo componente separado
import MoviesTable from "./MoviesTab";

export default function MoviesManager({ search }) {
  const { openModal, closeModal } = useModal();
  
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Carga inicial de datos
  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const res = await getMovies();
      setMovies(res.data || []);
    } catch (err) {
      toast.error("Error al sincronizar películas");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // ⭐ EFECTO: Si el usuario busca algo, reiniciamos a la página 1 para evitar desbordamientos
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ⭐ FILTRADO DINÁMICO (Aplica el buscador por título)
  const filteredMovies = movies.filter((movie) =>
    movie.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Lógica de paginación basada en los resultados ya filtrados
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (movie) => {
    openModal("movieForm", { 
      initialData: movie,
      onSuccess: () => {
        closeModal();
        loadMovies(); // Refrescar el catálogo
      }
    });
  };

  const handleDelete = (movie) => {
    openModal("delete", {
      item: movie,
      onConfirm: async () => {
        try {
          await deleteMovie(movie.id);
          toast.success("Película eliminada correctamente");
          closeModal();
          loadMovies();
        } catch (err) {
          toast.error("Error al eliminar la película");
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pasar los datos filtrados y paginados a la tabla */}
      <MoviesTable 
        data={paginatedMovies} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {/* PAGINACIÓN CONTROLES */}
      {!isLoading && filteredMovies.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 sm:px-6 rounded-b-xl shadow-sm font-montserrat">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Mostrando <span className="font-bold text-brand-primary">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
              <span className="font-bold text-brand-primary">{Math.min(currentPage * itemsPerPage, filteredMovies.length)}</span> de{" "}
              <span className="font-bold text-brand-primary">{filteredMovies.length}</span> resultados
            </p>
            
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
              <button 
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} 
                disabled={currentPage === 1} 
                className="px-3 py-2 border border-gray-200 bg-white text-gray-500 rounded-l-md disabled:opacity-50 hover:bg-slate-50 transition-all text-xs"
              >
                ◀
              </button>
              <div className="px-4 py-2 text-xs font-bold text-brand-primary border border-gray-200 bg-white">
                Página {currentPage} de {totalPages || 1}
              </div>
              <button 
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className="px-3 py-2 border border-gray-200 bg-white text-gray-500 rounded-r-md disabled:opacity-50 hover:bg-slate-50 transition-all text-xs"
              >
                ▶
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
