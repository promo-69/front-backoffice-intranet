import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { useLoading } from "@/context/LoadingContext"; 
import { getMovies, deleteMovie } from "@/services/movie.service";
import { MoviesTab } from "@/components/admin/billboard/movies/MoviesTab"; 
import MovieModal from "@/components/admin/billboard/movies/MovieModal"; 
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { toast } from "sonner";

export default function Movies({ catalogs, search, modal, openModal, closeModal }) {
  const [loading, setIsLoading] = useState(false);
  const { showLoader, hideLoader } = useLoading();
 
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  const fetchMovies = async (pageToFetch) => {
    setIsLoading(true); 
    try {
      const data = await getMovies({ page: pageToFetch || currentPage });
      setMovies(data.data || []);
      setMetadata(data.metadata || {
        total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
      });
    } catch (error) {
      console.error("Error cargando películas:", error);
      toast.error("Error al sincronizar catálogo de películas");
      setMovies([]);
    } finally {
      setIsLoading(false); 
    }
  };

  // Escucha del índice de paginación
  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage]);

  // Escucha del buscador para retornar a la primera página
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Corrección de propiedad evaluada: b.name cambiado a b.title
  const filteredMovies = movies.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= metadata.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditClick = (movie) => openModal("form", movie, "movie");
  const handleDeleteClick = (movie) => openModal("delete", movie, "movie");

  // Sincronización del cierre y mutación del formulario
  const handleFormClose = (shouldRefresh, customMessage) => {
    closeModal();
    if (shouldRefresh) {
      setCurrentPage(1);
      fetchMovies(1); 
      openModal("success", {
        title: "Catálogo Actualizado",
        message: customMessage || "Los datos del largometraje se configuraron exitosamente.",
        onConfirm: () => closeModal()
      }, "movie");
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      await deleteMovie(modal.data.id);
      closeModal();
      await fetchMovies(currentPage); 

      openModal("success", {
        title: "Película Dada de Baja",
        message: `"${modal.data?.title}" ha sido removida del catálogo correctamente.`,
        onConfirm: () => closeModal()
      }, "movie");
    } catch (error) {
      console.error("Error eliminando película:", error);
      const errorMessage = error.response?.data?.message || "No se pudo dar de baja la película en el servidor";
      toast.error(errorMessage);
    } finally {
      hideLoader();
    }
  };

  const isMovieContext = modal.context === "movie" || modal.type === "movieModal";
  const isFormOpen = modal.isOpen && (modal.type === "movieModal" || modal.type === "form") && isMovieContext;
  const isDeleteOpen = modal.isOpen && modal.type === "delete" && isMovieContext;
  const isSuccessOpen = modal.isOpen && modal.type === "success" && isMovieContext;

  return (
    <div className="space-y-6">
      <MoviesTab 
        data={filteredMovies} 
        isLoading={loading} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteClick} 
      />

      {!loading && (
        <CustomPagination 
          metadata={metadata} 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
        />
      )}

      {/* Corrección en el mapeo de props de cierre y éxito */}
      <MovieModal 
        open={isFormOpen} 
        onClose={() => handleFormClose(false)} 
        onSuccess={(msg) => handleFormClose(true, msg)} 
        genresList={catalogs.genres} 
        ageClassificationsList={catalogs.classifications} 
        lifecycleStatesList={catalogs.lifecycles} 
        languagesList={catalogs.languages} 
        projectionTypesList={catalogs.projectionTypes} 
        initialData={modal.data} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={closeModal} 
        onConfirm={handleConfirmDelete} 
        itemName={modal.data?.title} 
      />

      <SuccessModal 
        isOpen={isSuccessOpen}
        onClose={closeModal}
        title={modal.data?.title}
        message={modal.data?.message}
        onConfirm={modal.data?.onConfirm}
      />
    </div>
  );
}