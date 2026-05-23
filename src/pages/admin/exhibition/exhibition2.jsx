import { useState, useCallback, useEffect } from "react"
import { useModal } from "@/hooks/useModal"
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab2"
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab2"
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm2"
import SuccessModal from "@/components/ui/SuccessModal"
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import MovieForm from "@/components/admin/exhibition/movies/MovieForm"
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";

import { getMovies, createMovie, updateMovie, deleteMovie } from "@/services/movie.service";
import { showtimesService } from "@/services/showtime.service";
import { getCinemas } from "@/services/cinema.service"; 
import { toast } from "sonner";

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" }
  ];
  
  const { modal, openModal, closeModal } = useModal();
  const { showLoader, hideLoader } = useLoading();
  
  // Catálogos auxiliares estables para los Comboboxes del formulario
  const [cinemas, setCinemas] = useState([]);

  // Estados locales de películas
  const [movies, setMovies] = useState([]);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesMetadata, setMoviesMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  // Estados locales de funciones
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesMetadata, setShowtimesMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  const [search, setSearch] = useState("");

  // Carga inicial y asíncrona de catálogos fijos para los modales
  useEffect(() => {
    const fetchFormCatalogs = async () => {
      try {
        const cinemasRes = await getCinemas();
        setCinemas(cinemasRes || []);
      } catch (error) {
        console.error("Error al pre-cargar catálogos de sucursales:", error);
      }
    };
    fetchFormCatalogs();
  }, []);

  // MÉTODO UNIFICADO DE CARGA (Lazy Loading según la Pestaña Activa)
  const fetchDataForTab = useCallback(async (tab, page = 1) => {
    showLoader();
    try {
      if (tab === "movies") {
        const response = await getMovies({ page, per_page: 10 });
        setMovies(response.data || []);
        if (response.metadata) setMoviesMetadata(response.metadata);
      } 
      else if (tab === "showtimes") {
        const response = await showtimesService.getAll({ page, per_page: 10 });
        setShowtimes(response.data || []);
        if (response.metadata) setShowtimesMetadata(response.metadata);
      }
    } catch (error) {
      console.error(`Error al cargar datos de ${tab}:`, error);
      toast.error(error.response?.data?.message || "Error al conectar con el servidor");
      if (tab === "movies") setMovies([]);
      if (tab === "showtimes") setShowtimes([]);
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
    fetchDataForTab(activeTab, activeTab === "movies" ? moviesPage : showtimesPage);
  }, [activeTab, moviesPage, showtimesPage, fetchDataForTab]);

  const refreshActiveTab = async () => {
    await fetchDataForTab(activeTab, activeTab === "movies" ? moviesPage : showtimesPage);
  };

  const handleOpenEditModal = (type, item) => {
    if (type === "movieForm") {
      const genreIds = item._MovieGenres?.map(g => g.genre) || [];
      openModal("movieForm", { ...item, genres: genreIds });
    } else {
      openModal(type, item);
    }
  };

  const handleSave = async (payload) => {
    showLoader();
    try {
      if (activeTab === "movies") {
        let finalPayload = payload;
        if (payload && Array.isArray(payload.genres)) {
          finalPayload = { ...payload, genres: JSON.stringify(payload.genres) };
        }
        modal.data?.id 
          ? await updateMovie(modal.data.id, finalPayload)
          : await createMovie(finalPayload);
      } else {
        modal.data?.id
          ? await showtimesService.update(modal.data.id, payload)
          : await showtimesService.create(payload);
      }
      
      closeModal();
      await refreshActiveTab();
      
      openModal("success", { 
        title: "¡Operación Exitosa!", 
        message: "Los cambios han sido impactados en el sistema correctamente." 
      });
    } catch (error) {
      console.error("Error al ejecutar guardado:", error);
      toast.error(error.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      if (activeTab === "movies") {
        await deleteMovie(modal.data.id);
      } else {
        await showtimesService.delete(modal.data.id);
      }
      closeModal();
      await refreshActiveTab();
      openModal("success", { title: "Eliminado", message: "El registro ha sido removido exitosamente." });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el registro seleccionado");
    } finally {
      hideLoader();
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {activeTab === "movies" ? "Gestión de Catálogo" : "Gestión de Funciones"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {activeTab === "movies" ? "Administra las películas" : "Organiza horarios, salas y precios"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={`Buscar en ${activeTab === "movies" ? "películas" : "funciones"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />
          <button 
            onClick={() => openModal(activeTab === "movies" ? "movieForm" : "showtimeForm")}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />
            {activeTab === "movies" ? "Añadir Película" : "Programar Función"}
          </button>
        </div>
      </header>

      {/* TABS */}
      <TabsCustom tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* RENDER TAB CONTENIDO */}
      {activeTab === "movies" && (
        <MoviesTab 
          data={filteredMovies} 
          onEdit={(type, item) => handleOpenEditModal(type, item)} 
          onDelete={(type, item) => openModal(type, item)}
        />
      )}

      {activeTab === "showtimes" && (
        <ShowtimesTab 
          data={showtimes} 
          onEdit={(type, item) => handleOpenEditModal(type, item)} 
          onDelete={(type, item) => openModal(type, item)} 
        />
      )}

      {/* CONTROLES PAGINACIÓN */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-cineflix shadow-sm">
        <p className="text-xs text-gray-500 font-medium">
          Mostrando {" "}
          <span className="font-bold text-brand-primary">
            {activeTab === "movies" 
              ? (moviesMetadata.total === 0 ? 0 : (moviesPage - 1) * moviesMetadata.per_page + 1) 
              : (showtimesMetadata.total === 0 ? 0 : (showtimesPage - 1) * showtimesMetadata.per_page + 1)}
          </span> al <span className="font-bold text-brand-primary">
            {activeTab === "movies"
              ? Math.min(moviesPage * moviesMetadata.per_page, moviesMetadata.total)
              : Math.min(showtimesPage * showtimesMetadata.per_page, showtimesMetadata.total)}
          </span> de <span className="font-bold text-brand-primary">{activeTab === "movies" ? moviesMetadata.total : showtimesMetadata.total}</span> resultados
        </p>

        <nav className="inline-flex -space-x-px rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <button
            onClick={() => activeTab === "movies" ? setMoviesPage(p => Math.max(p - 1, 1)) : setShowtimesPage(p => Math.max(p - 1, 1))}
            disabled={activeTab === "movies" ? !moviesMetadata.prev_page : !showtimesMetadata.prev_page}
            className="px-3 py-2 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 border-r"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="px-4 py-2 text-xs font-bold text-brand-primary bg-white min-w-[120px] text-center uppercase tracking-wider">
            Página {activeTab === "movies" ? moviesMetadata.current_page : showtimesMetadata.current_page} de {activeTab === "movies" ? moviesMetadata.total_pages : showtimesMetadata.total_pages}
          </div>
          <button
            onClick={() => activeTab === "movies" ? setMoviesPage(p => p + 1) : setShowtimesPage(p => p + 1)}
            disabled={activeTab === "movies" ? !moviesMetadata.next_page : !showtimesMetadata.next_page}
            className="px-3 py-2 text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 border-l"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>

      {/* MODALES CONFIGURADOS */}
      <MovieForm
        open={modal.isOpen && modal.type === "movieForm"}
        initialData={modal.data}
        onClose={closeModal}
        onSuccess={handleSave} 
        lifecycleStatesList={MOCK_LIFECYCLE}
        genresList={MOCK_GENRES}
      />

      <ShowtimeForm
        open={modal.isOpen && modal.type === "showtimeForm"}
        initialData={modal.data}
        onClose={closeModal}
        onSave={handleSave}    
        movies={movies} // Manda las películas del estado actual
        cinemas={cinemas} // Manda las sucursales cargadas al montar la app
      />

      <DeleteConfirmModal 
        isOpen={modal.isOpen && modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        itemName={activeTab === "movies" ? modal.data?.title : "esta función"}
      />

      <SuccessModal 
        isOpen={modal.isOpen && modal.type === "success"}
        onClose={closeModal}
        title={modal.data?.title}
        message={modal.data?.message}
      />
    </div>
  );
}

const MOCK_LIFECYCLE = [
  { id: 1, description: 'Próximamente' }, { id: 2, description: 'En Cartelera (Estreno)'},
  { id: 3, description: 'En Cartelera (Regular)'}, { id: 4, description: 'Últimos Días'}, { id: 5, description: 'Fuera de Cartelera'}
];
const MOCK_GENRES = [
  { id: 1, description: 'Acción'}, { id: 2, description: 'Comedia' }, { id: 3, description: 'Drama' },
  { id: 4, description: 'Ciencia Ficción'}, { id: 5, description: 'Terror / Suspenso'}, { id: 6, description: 'Animación / Infantil'}
];