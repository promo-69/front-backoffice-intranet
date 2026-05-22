
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
import { toast } from "sonner";

export default function ExhibitionPage() {
  console.log("!!! EL COMPONENTE EXHBTIONPAGE SE ACABA DE MONTAR O RE-RENDERIZAR !!!");
  
  const [activeTab, setActiveTab] = useState("movies");
  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" }
  ];
  
  const { modal, openModal, closeModal } = useModal();
  const { showLoader, hideLoader } = useLoading();
  
  // Estados de películas
  const [movies, setMovies] = useState([]);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesMetadata, setMoviesMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  // Estados de funciones
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesMetadata, setShowtimesMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  const [search, setSearch] = useState("");

  // ==========================================
// MÉTODO UNIFICADO DE CARGA (Similar a fetchCatalogs)
// ==========================================
const fetchDataForTab = useCallback(async (tab, page = 1) => {
  showLoader();
  try {
    if (tab === "movies") {
      console.log("🎬 Cargando películas. Página:", page);
      const response = await getMovies({ page, per_page: 10 });
      setMovies(response.data || []);
      if (response.metadata) setMoviesMetadata(response.metadata);
    } 
    
    else if (tab === "showtimes") {
      console.log("🍿 Cargando funciones. Página:", page);
      // Aquí usamos tu servicio de showtimes (pasándole la página si tu backend lo soporta)
      const response = await showtimesService.getAll({ page, per_page: 10 });
      setShowtimes(response.data || []);
      if (response.metadata) setShowtimesMetadata(response.metadata);
    }
  } catch (error) {
    console.error(`Error al cargar datos de ${tab}:`, error);
    const messageError = error.response?.data?.message || "Error al conectar con el servidor";
    toast.error(messageError);
    
    // Limpieza en caso de error para no mostrar datos viejos
    if (tab === "movies") setMovies([]);
    if (tab === "showtimes") setShowtimes([]);
  } finally {
    hideLoader();
  }
}, [showLoader, hideLoader]);

// ==========================================
// UN SOLO EFFECT PARA CONTROLAR EL LAZY LOADING
// (Igual al de CatalogsPage: Escucha los cambios de Tab y Páginas)
// ==========================================
useEffect(() => {
  if (activeTab === "movies") {
    fetchDataForTab("movies", moviesPage);
  } else if (activeTab === "showtimes") {
    fetchDataForTab("showtimes", showtimesPage);
  }
// 💡 ESCUCHA ÚNICAMENTE LOS CAMBIOS DE PESTAÑA Y PÁGINAS
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, moviesPage, showtimesPage]);
  // ==========================================
  // MANEJADORES DE ACCIONES Y MUTACIONES
  // ==========================================
 const refreshActiveTab = async () => {
  if (activeTab === "movies") {
    await fetchDataForTab("movies", moviesPage);
  } else {
    await fetchDataForTab("showtimes", showtimesPage);
  }
};

  const handleOpenEditModal = (type, item) => {
    if (type === "movieForm") {
      const genreIds = item._MovieGenres?.map(g => g.genre) || [];
      const mappedMovie = { ...item, genres: genreIds };
      openModal("movieForm", mappedMovie);
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
        message: "El registro ha sido actualizado correctamente." 
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(error.response?.data?.message || "Error al conectar con el servidor");
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
      
      openModal("success", { 
        title: "Eliminado", 
        message: "El registro ha sido removido exitosamente." 
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(error.response?.data?.message || "Error al conectar con el servidor");
    } finally {
      hideLoader();
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      
      {/* HEADER DINÁMICO */}
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

      {/* COMPONENTE DE TABS GENÉRICO */}
     <TabsCustom 
  tabs={tabs} 
  activeTab={activeTab} 
  onChange={(tabId) => {
    setActiveTab(tabId);
    // Opcional: puedes resetear las páginas al cambiar de tab si quieres evitar desfases
    // if (tabId === "movies") setMoviesPage(1);
    // if (tabId === "showtimes") setShowtimesPage(1);
  }} 
/>
      {/* RENDERIZADO CONDICIONAL DE TABS (LAZY LOADING EN UI) */}
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
          onEdit={(type, item) => openModal(type, item)} 
          onDelete={(type, item) => openModal(type, item)} 
        />
      )}

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-100 rounded-cineflix shadow-sm">
        <div>
          <p className="text-xs text-gray-500 font-medium">
            Mostrando {" "}
            <span className="font-bold text-brand-primary">
              {activeTab === "movies" 
                ? (moviesMetadata.total === 0 ? 0 : (moviesPage - 1) * moviesMetadata.per_page + 1) 
                : (showtimesMetadata.total === 0 ? 0 : (showtimesPage - 1) * showtimesMetadata.per_page + 1)}
            </span>{" "}
            a{" "}
            <span className="font-bold text-brand-primary">
              {activeTab === "movies"
                ? Math.min(moviesPage * moviesMetadata.per_page, moviesMetadata.total)
                : Math.min(showtimesPage * showtimesMetadata.per_page, showtimesMetadata.total)}
            </span>{" "}
            de <span className="font-bold text-brand-primary">{activeTab === "movies" ? moviesMetadata.total : showtimesMetadata.total}</span> resultados
          </p>
        </div>

        <div>
          <nav className="inline-flex -space-x-px rounded-xl shadow-sm overflow-hidden border border-gray-200" aria-label="Pagination">
            <button
              onClick={() => {
                if (activeTab === "movies") {
                  if (moviesMetadata.prev_page > 0) setMoviesPage(moviesMetadata.prev_page);
                } else {
                  if (showtimesMetadata.prev_page > 0) setShowtimesPage(showtimesMetadata.prev_page);
                }
              }}
              disabled={activeTab === "movies" ? !moviesMetadata.prev_page : !showtimesMetadata.prev_page}
              className="relative inline-flex items-center px-3 py-2 text-gray-400 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-all border-r border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="relative inline-flex items-center px-4 py-2 text-xs font-bold text-brand-primary bg-white min-w-[120px] justify-center tracking-wider uppercase">
              Página {activeTab === "movies" ? moviesMetadata.current_page : showtimesMetadata.current_page} de {activeTab === "movies" ? moviesMetadata.total_pages : showtimesMetadata.total_pages}
            </div>

            <button
              onClick={() => {
                if (activeTab === "movies") {
                  if (moviesMetadata.next_page > 0) setMoviesPage(moviesMetadata.next_page);
                } else {
                  if (showtimesMetadata.next_page > 0) setShowtimesPage(showtimesMetadata.next_page);
                }
              }}
              disabled={activeTab === "movies" ? !moviesMetadata.next_page : !showtimesMetadata.next_page}
              className="relative inline-flex items-center px-3 py-2 text-gray-400 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-all border-l border-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>

      {/* --- MODALES CENTRALIZADOS --- */}
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
        movies={movies}
        rooms={MOCK_ROOMS}   
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

// ... Mocks de configuración al final del archivo permanecen iguales
const MOCK_ROOMS = [{ id: 1, descripton: "Sala 1" }, { id: 2, descripton: "Sala 2" }];
const MOCK_LIFECYCLE = [
  { id: 1, description: 'Próximamente' }, { id: 2, description: 'En Cartelera (Estreno)'},
  { id: 3, description: 'En Cartelera (Regular)'}, { id: 4, description: 'Últimos Días'}, { id: 5, description: 'Fuera de Cartelera'}
];
const MOCK_GENRES = [
  { id: 1, description: 'Acción'}, { id: 2, description: 'Comedia' }, { id: 3, description: 'Drama' },
  { id: 4, description: 'Ciencia Ficción'}, { id: 5, description: 'Terror / Suspenso'}, { id: 6, description: 'Animación / Infantil'}
];