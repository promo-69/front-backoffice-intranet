import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab2";
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab2";
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm2";
import MovieForm from "@/components/admin/exhibition/movies/MovieForm";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import { getMovies, deleteMovie } from "@/services/movie.service";
import { showtimesService } from "@/services/showtime.service";
import { getCatalogByName } from "@/services/catalog.service"; 
import { getRooms } from "@/services/room.service"; 

// --- RESPALDOS ESTÁTICOS DE SEGURIDAD (FALLBACKS) ---
// Evitan pantallas en blanco si el servidor está suspendido o colapsado
const FALLBACKS = {
  "genres": [
    { id: 1, description: "Acción" },
    { id: 2, description: "Comedia" },
    { id: 3, description: "Drama" },
    { id: 4, description: "Ciencia Ficción" }
  ],
  "age-classifications": [
    { id: 1, description: "A (Todo Público)" },
    { id: 2, description: "B (+12)" },
    { id: 3, description: "C (+15)" },
    { id: 4, description: "D (+18)" }
  ],
  "movie-lifecycle-states": [
    { id: 1, description: "Próximamente" },
    { id: 2, description: "En Cartelera (Estreno)" },
    { id: 3, description: "En Cartelera (Regular)" },
    { id: 4, description: "Últimos Días" }
  ],
  "projection-types": [
    { id: 1, description: "2D Tradicional" },
    { id: 2, description: "3D Dolby Atmos" }
  ],
  "currencies": [
    { id: 1, description: "USD - Dólares", symbol: "$" },
    { id: 2, description: "VES - Bolívares", symbol: "Bs" }
  ],
  bookingsData: [
  { id: 1, room: 1, start_time: "2026-05-25T14:00:00.000Z", end_time: "2026-05-25T16:30:00.000Z", booking_type: 1 },
  { id: 2, room: 2, start_time: "2026-05-25T17:00:00.000Z", end_time: "2026-05-25T19:30:00.000Z", booking_type: 1 } 
  ]
};


const tabs = [
  { id: "movies", label: "Películas" },
  { id: "showtimes", label: "Funciones" }
];

// Utilidad síncrona para dar un respiro al backend entre peticiones
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const { modal, openModal, closeModal } = useModal();
  const { showLoader, hideLoader } = useLoading();

  // Estados de Películas
  const [movies, setMovies] = useState([]);
  const [moviesCurrentPage, setMoviesCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(10);
  const [moviesMetadata, setMoviesMetadata] = useState(null);

  // Estados de Funciones
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesPerPag, setShowtimesPerPage] = useState(10);
  const [showtimesMetadata, setShowtimesMetadata] = useState({ total: 0, limit: 10, current_page: 1, total_pages: 1 });

  // --- ESTADOS LOCALES PARA CATÁLOGOS ELEVADOS (LIFTING STATE UP) ---
  const [genres, setGenres] = useState([]);
  const [ageClassifications, setAgeClassifications] = useState([]);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);

  const [rooms, setRooms] = useState([]);

  // Helper para extraer datos individuales de catálogo de forma segura
  const safeFetchCatalog = async (catalogName) => {
    try {
      const response = await getCatalogByName (catalogName);
      //const cleanData = response?.data || response;
      if (Array.isArray(response) && response.length > 0) {
        return response;
      }
      return FALLBACKS[catalogName] || [];
    } catch (error) {
      console.error(error);
      console.warn(`Catálogo [${catalogName}] falló en red. Degradación grácil activada.`);
      return FALLBACKS[catalogName] || [];
    }
  };

  //  CARGA INICIAL DE CATÁLOGOS (Se ejecuta una sola vez al montar la vista)
  useEffect(() => {
    async function loadAllCatalogs() {
  
      const genresData = await safeFetchCatalog("genres");
      await delay(150);

      const classificationsData = await safeFetchCatalog("age-classifications");
      await delay(150);

      const lifecyclesData = await safeFetchCatalog("movie-lifecycle-states");
      await delay(150);

      const projectionsData = await safeFetchCatalog("projection-types");
      await delay(150);

      const languagesData = await safeFetchCatalog("languages");
      await delay(150);

      const currenciesData = await safeFetchCatalog("currencies");
      await delay(150);

      const bookingsData = await safeFetchCatalog("room-bookings");

      setGenres(genresData);
      setAgeClassifications(classificationsData);
      setLifecycleStates(lifecyclesData);
      setProjectionTypes(projectionsData);
      setLanguages(languagesData);
      setCurrencies(currenciesData);
      setRoomBookings(bookingsData);
    }

    loadAllCatalogs();
  }, []);

  // EFECTO CARGA RECURSIVA EXCLUSIVA DE PELÍCULAS (paginación)
  useEffect(() => {
    async function loadMovies() {
      if (activeTab !== "movies") return;
      showLoader();
      try {
        const res = await getMovies( moviesCurrentPage, moviesPerPage );
        setMovies(res.data || []);
        if (res.metadata) setMoviesMetadata(res.metadata);
      } catch (err) {
        toast.error("Error al sincronizar listado de películas");
        console.error(err);
      } finally {
        hideLoader();
      }
    }
    loadMovies();
  }, [moviesCurrentPage, moviesPerPage, activeTab]);


useEffect(() => {
  const fetchRoomsData = async () => {
    try {
      // Reemplaza esto por tu servicio o llamada axios real, ej: getRooms() o api.get('/rooms')
      const response = await getRooms(); 
      // Supongamos que la estructura de respuesta es la estándar de tu backend: response.data.data
      setRooms(response.data.data); 
    } catch (error) {
      console.error("Error cargando el catálogo de salas independientes:", error);
    }
  };

  fetchRoomsData();
}, []);


  //EFECTO CARGA RECURSIVA EXCLUSIVA DE FUNCIONES ( paginación)
  useEffect(() => {
    async function loadShowtimes() {
      if (activeTab !== "showtimes") return;
      showLoader();
      try {
        const res = await showtimesService.getAll(showtimesPage, 10);
        setShowtimes(res.data || []);
        if (res.metadata) setShowtimesMetadata(res.metadata);
      } catch (err) {
        toast.error("Error al sincronizar cartelera de funciones");
        console.error(err);
      } finally {
        hideLoader();
      }
    }
    loadShowtimes();
  }, [showtimesPage, activeTab]);

  // --- MANEJADORES DE OPERACIONES EXITOSAS  ---
  const handleMovieSuccess = async () => {
    closeModal();
    setMoviesCurrentPage(1);
    showLoader();
    try {
      const res = await getMovies( moviesCurrentPage, moviesPerPage );
      setMovies(res.data || []);
      if (res.metadata) setMoviesMetadata(res.metadata);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoader();
    }
  };

  const handleShowtimeSuccess = async () => {
    closeModal();
    setShowtimesPage(1);
    showLoader();
    try {
      const res = await showtimesService.getAll(1, 10);
      setShowtimes(res.data || []);
      if (res.metadata) setShowtimesMetadata(res.metadata);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoader();
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      if (activeTab === "movies") {
        await deleteMovie(modal.data.id);
        toast.success("Película removida correctamente");
        await handleMovieSuccess();
      } else {
        await showtimesService.delete(modal.data.id);
        toast.success("Función cancelada correctamente");
        await handleShowtimeSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al procesar la eliminación");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-montserrat">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
            Gestión de Exhibición
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitorea las películas disponibles y planifica los horarios de las salas de cine.
          </p>
        </div>

        <button
          onClick={() => openModal(activeTab === "movies" ? "movieForm" : "showtimeForm", null)}
          className="bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {activeTab === "movies" ? "REGISTRAR PELÍCULA" : "PLANIFICAR FUNCIÓN"}
        </button>
      </div>

      {/* TABS SELECTORES */}
      <TabsCustom 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab}
      
      />

      {/* CONTENIDO ACCESIBLE SEGÚN PESTAÑA */}
      {activeTab === "movies" ? (
        <MoviesTab 
          data={movies}
          onEdit={(type, data) => openModal(type, data)}
          onDelete={(type, data) => openModal(type, data)}
          currentPage={moviesCurrentPage}
          onPageChange={setMoviesCurrentPage}
          metadata={moviesMetadata}
        />
      ) : (
        <ShowtimesTab 
          data={showtimes}
          onEdit={(type, data) => openModal(type, data)}
          onDelete={(type, data) => openModal(type, data)}
          currentPage={showtimesPage}
          onPageChange={setShowtimesPage}
          metadata={showtimesMetadata}
          moviesList={movies}    
          bookingsList={roomBookings}
          roomsList={rooms}
          
        />
      )}

      {/* FORMULARIO: PELÍCULAS */}
      <MovieForm 
        open={modal.isOpen && modal.type === "movieForm"}
        onClose={closeModal}
        genresList={genres}
        ageClassificationsList={ageClassifications}
        lifecycleStatesList={lifecycleStates}
        languagesList={languages}
        projectionTypesList={projectionTypes}
        initialData={modal.data}
        onSuccess={handleMovieSuccess}
      />

      {/* FORMULARIO: FUNCIONES */}
      <ShowtimeForm 
        open={modal.isOpen && modal.type === "showtimeForm"}
        onClose={closeModal}
        movies={movies} 
        bookingsList={roomBookings}
        projectionTypes={projectionTypes}
        currenciesList={currencies} 
        initialData={modal.data}
        onSave={handleShowtimeSuccess}
      />

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <DeleteConfirmModal 
        isOpen={modal.isOpen && modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemName={
          activeTab === "movies" 
            ? modal.data?.title 
            : (movies.find(m => String(m.id) === String(modal.data?.movie))?.title || "esta función")
        }
      />
    </div>
  );
}