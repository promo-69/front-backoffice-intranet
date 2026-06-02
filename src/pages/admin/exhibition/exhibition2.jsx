import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus, Calendar, Clock, Building2 } from "lucide-react"; 
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab2";
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab2";
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm2";
import MovieForm from "@/components/admin/exhibition/movies/MovieForm";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import { getMovies, deleteMovie } from "@/services/movie.service";
import { 
  getShowtimesByCinema, 
  deleteShowtime,
  createByCinema,
  patchShowtime
} from "@/services/showtime.service";
import { getCatalogByName } from "@/services/catalog.service"; 
import { getRoomsByCinema } from "@/services/room.service"; 
// IMPORTANTE: Asegúrate de tener o mapear el servicio para obtener los cines disponibles
import { getCinemas } from "@/services/cinema.service"; 

const FALLBACKS = {
  genresData: [{ id: 1, description: "Acción" }, { id: 2, description: "Comedia" }],
  classificationsData: [{ id: 1, description: "A (Todo Público)" }, { id: 2, description: "B (+12)" }],
  lifecyclesData: [{ id: 1, description: "En Cartelera" }],
  projectionTypesData: [{ id: 1, description: "2D Tradicional" }],
  currenciesData: [{ id: 1, description: "USD - Dólares", symbol: "$" }],
  bookingsData: [],
  cinemasData: [
    { id: 1, name: "Cineflix Sambil Barquisimeto" },
    { id: 2, name: "Cineflix Las Trinitarias" },
    { id: 3, name: "Cineflix Sambil Caracas" }
  ]
};

const tabs = [
  { id: "movies", label: "Películas" },
  { id: "showtimes", label: "Funciones" }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const { modal, openModal, closeModal } = useModal();
  const { showLoader, hideLoader } = useLoading();

  // CONTEXTO DE SUCURSAL SELECCIONADA POR EL SUPER ADMIN
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  // ESTADOS DE PELÍCULAS (Paginación)
  const [movies, setMovies] = useState([]);
  const [moviesCurrentPage, setMoviesCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(10);
  const [moviesMetadata, setMoviesMetadata] = useState(null);

  // 🍿 ESTADOS DE FUNCIONES (Paginación y Filtros Query)
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesPerPage, setShowtimesPerPage] = useState(10);
  const [showtimesTotalCount, setShowtimesTotalCount] = useState(0);

  // Filtros query para funciones
  const [filterMovieId, setFilterMovieId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // ESTADOS DE CATÁLOGOS ELEVADOS
  const [genres, setGenres] = useState([]);
  const [ageClassifications, setAgeClassifications] = useState([]);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Helper de catálogos
  const safeFetchCatalog = async (catalogName, fallbackKey) => {
    try {
      const response = await getCatalogByName(catalogName);
      if (Array.isArray(response) && response.length > 0) return response;
      
      const fb = FALLBACKS[fallbackKey] || [];
      console.warn(`⚠️ Usando datos fallback para: ${catalogName}`);
      return fb;
    } catch (error) {
      console.error(`Catálogo [${catalogName}] falló en red. Degradación grácil activa.`, error);
      return FALLBACKS[fallbackKey] || [];
    }
  };

  // Carga inicial única de catálogos, salas y lista de cines disponibles
  useEffect(() => {
    async function loadAllInitialData() {
      showLoader();
      // Carga de cines de la cadena corporativa
      try {
        const cinemaRes = await getCinemas();
        // En el patrón de nuestros servicios, cinemaRes es el body (res.data)
        // por lo que el array de cines está en cinemaRes.data
        const cinemaList = cinemaRes.data || (Array.isArray(cinemaRes) ? cinemaRes : null);
        setCinemas(cinemaList || FALLBACKS.cinemasData);
      } catch (e) {
        setCinemas(FALLBACKS.cinemasData);
        console.log(e);
      }

      const genresData = await safeFetchCatalog("genres", "genresData");
      const classificationsData = await safeFetchCatalog("age-classifications", "classificationsData");
      const lifecyclesData = await safeFetchCatalog("movie-lifecycle-states", "lifecyclesData");
      const projectionsData = await safeFetchCatalog("projection-types", "projectionTypesData");
      const languagesData = await safeFetchCatalog("languages", "languagesData");
      const currenciesData = await safeFetchCatalog("currencies", "currenciesData");

      setGenres(genresData);
      setAgeClassifications(classificationsData);
      setLifecycleStates(lifecyclesData);
      setProjectionTypes(projectionsData);
      setLanguages(languagesData);
      setCurrencies(currenciesData);
      hideLoader();
    }

    loadAllInitialData();
  }, []);

  // ⚡ EFECTO: CARGA DE SALAS (Depende de la sucursal seleccionada por el Super Admin)
  useEffect(() => {
    async function loadRooms() {
      if (!selectedCinemaId) {
        setRooms([]);
        return;
      }
      try {
        const roomsData = await getRoomsByCinema(selectedCinemaId);
        // Normalizamos la respuesta: el backend puede devolver el array directo o un objeto con { rows }
        // Esto asegura que el selector en ShowtimeForm tenga siempre un array para mapear.
        const roomsList = Array.isArray(roomsData) ? roomsData : (roomsData?.rows || []);
        setRooms(roomsList);
      } catch (error) {
        console.error("Error cargando las salas de la sucursal seleccionada:", error);
      }
    }
    loadRooms();
  }, [selectedCinemaId]);

  // ⚡ EFECTO: CARGA DE PELÍCULAS (No dependen de la sucursal)
  useEffect(() => {
    async function loadMovies() {
      showLoader();
      try {
        const res = await getMovies(moviesCurrentPage, moviesPerPage);
        setMovies(res.data || []);
        if (res.metadata) setMoviesMetadata(res.metadata);
      } catch (err) {
        toast.error("Error al sincronizar listado de películas");
        console.log(err);
      } finally {
        hideLoader();
      }
    }
    loadMovies();
  }, [moviesCurrentPage, moviesPerPage]);

  // ⚡ EFECTO: CARGA DE FUNCIONES (DINÁMICA por selectedCinemaId)
  useEffect(() => {
    async function loadShowtimes() {
      // Condición de seguridad: Si no hay pestaña activa o no se ha seleccionado sucursal, limpiar y frenar
      if (activeTab !== "showtimes" || !selectedCinemaId) {
        setShowtimes([]);
        setShowtimesTotalCount(0);
        return;
      }
      
      showLoader();
      try {
        const filters = {
          page: showtimesPage,
          limit: showtimesPerPage,
          movieId: filterMovieId || undefined,
          date: filterDate || undefined,
          startDate: filterStartDate || undefined,
          endDate: filterEndDate || undefined
        };

        const res = await getShowtimesByCinema(selectedCinemaId, filters);
        if (res.success) {
          setShowtimes(res.data?.rows || []);
          setShowtimesTotalCount(res.data?.count || 0);
        }
      } catch (err) {
        toast.error("Error al sincronizar cartelera de la sucursal seleccionada");
        console.log(err);
        setShowtimes([]);
      } finally {
        hideLoader();
      }
    }
    loadShowtimes();
  }, [
    activeTab, 
    selectedCinemaId, // Escucha activa al selector global del Super Admin
    showtimesPage, 
    showtimesPerPage, 
    filterMovieId, 
    filterDate, 
    filterStartDate, 
    filterEndDate
  ]);

  // --- CÁLCULO DE METADATA PARA FUNCIONES ---
  const totalShowtimePages = Math.ceil(showtimesTotalCount / showtimesPerPage) || 1;
  const hasNextShowtimePage = showtimesPage < totalShowtimePages;
  const hasPrevShowtimePage = showtimesPage > 1;

  // --- MANEJADORES DE OPERACIONES EXITOSAS ---
  const handleMovieSuccess = async () => {
    closeModal();
    setMoviesCurrentPage(1);
  };

  const handleShowtimeSuccess = async () => {
    closeModal();
    setShowtimesPage(1);
  };

  // --- MANEJADOR DE GUARDADO/ACTUALIZACIÓN DE FUNCIONES ---
const handleShowtimeSave = async (payload) => {
  showLoader();
  try {
    // Capturamos el ID del cine y enriquecemos el payload para asegurar la integridad de la sucursal
    const targetCinemaId = modal.data?.cinema_id || selectedCinemaId;
    const enrichedPayload = {
      ...payload,
      cinema_id: Number(targetCinemaId)
    };

    if (modal.data?.id) {
      // MODO EDICIÓN
      const { id, ...updateData } = enrichedPayload;
      const res = await patchShowtime(id, updateData);
      
      if (res.success) {
        toast.success(res.message || "Función modificada con éxito");
      }
    } else {
      // MODO CREACIÓN
      const res = await createByCinema(targetCinemaId, enrichedPayload);
      
      if (res.success) {
        // Aquí recibes el body que me acabas de mostrar: res.data.showtime_id y res.data.booking_id
        toast.success(`¡Función #${res.data.showtime_id} programada! Sala reservada exitosamente.`);
      }
    }
    
    // Cerrar modal y refrescar la tabla apuntando a la primera página
    closeModal();
    setShowtimesPage(1);
  } catch (error) {
    console.error("Error en la operación de función:", error);
    toast.error(error.response?.data?.message || "Error crítico al procesar la función");
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
        await deleteShowtime(modal.data.id);
        toast.success("Función cancelada correctamente");
        await handleShowtimeSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al procesar la acción");
    } finally {
      hideLoader();
    }
  };

  // Interceptor para validar el botón de creación de funciones
  const handleOpenShowtimeForm = () => {
    if (!selectedCinemaId) {
      toast.warning("Debe seleccionar una sucursal para poder planificar una función.");
      return;
    }
    // Pasamos el selectedCinemaId dentro del objeto de contexto o inicialización si tu formulario lo requiere
    openModal("showtimeForm", { cinema_id: selectedCinemaId });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-montserrat">
      
      {/* HEADER DE LA SECCIÓN CORPORATIVA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mt-0.5">
            Administración global de películas y planificación de funciones por sucursales.
          </p>
        </div>

        {/* CONTROLES ACCIONABLES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* SELECTOR GLOBAL DE SUCURSAL PARA EL SUPER ADMIN */}
          {activeTab === "showtimes" && (
            <div className="flex items-center gap-2 bg-slate-100/80 border border-border p-1.5 px-3 rounded-xl shadow-sm">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={selectedCinemaId}
                onChange={(e) => {
                  setSelectedCinemaId(e.target.value);
                  setShowtimesPage(1); // Resetea la página al cambiar de sucursal
                }}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-4"
              >
                <option value="">-- Seleccionar Sucursal --</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => activeTab === "movies" ? openModal("movieForm", null) : handleOpenShowtimeForm()}
            className="bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 text-xs py-2.5 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {activeTab === "movies" ? "REGISTRAR PELÍCULA" : "PLANIFICAR FUNCIÓN"}
          </button>
        </div>
      </div>

      {/* TABS SELECTORES */}
      <TabsCustom tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 🔍 BARRA DE FILTROS EXCLUSIVA PARA LA PESTAÑA DE FUNCIONES */}
      {activeTab === "showtimes" && selectedCinemaId && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-cineflix border border-border text-xs font-montserrat shadow-sm/40">
          <div className="flex flex-col gap-1 text-left">
            <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Película</label>
            <select 
              value={filterMovieId} 
              onChange={(e) => { setFilterMovieId(e.target.value); setShowtimesPage(1); }}
              className="w-full bg-white border border-border p-2 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-brand-primary cursor-pointer shadow-sm text-[11px]"
            >
              <option value="">Todas las películas</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Fecha Exacta</label>
            <input 
              type="date" 
              value={filterDate}
              disabled={!!filterStartDate || !!filterEndDate}
              onChange={(e) => { setFilterDate(e.target.value); setShowtimesPage(1); }}
              className="w-full bg-white border border-border p-1.5 rounded-xl text-slate-700 font-bold disabled:bg-slate-200/70 focus:outline-none focus:border-brand-primary shadow-sm text-[11px]"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Rango: Desde</label>
            <input 
              type="date" 
              value={filterStartDate}
              disabled={!!filterDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setShowtimesPage(1); }}
              className="w-full bg-white border border-border p-1.5 rounded-xl text-slate-700 font-bold disabled:bg-slate-200/70 focus:outline-none focus:border-brand-primary shadow-sm text-[11px]"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Rango: Hasta</label>
            <input 
              type="date" 
              value={filterEndDate}
              disabled={!!filterDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setShowtimesPage(1); }}
              className="w-full bg-white border border-border p-1.5 rounded-xl text-slate-700 font-bold disabled:bg-slate-200/70 focus:outline-none focus:border-brand-primary shadow-sm text-[11px]"
            />
          </div>
        </div>
      )}

      {/* RENDERIZADO PRINCIPAL CON TABLAS Y PAGINACIÓN INLINE */}
      {activeTab === "movies" ? (
        <div className="flex flex-col gap-4">
          <MoviesTab 
            data={movies}
            onEdit={(type, data) => openModal(type, data)}
            onDelete={(type, data) => openModal(type, data)}
          />
          
          {/* PAGINACIÓN INLINE: PELÍCULAS */}
          {moviesMetadata && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-surface-container border border-border rounded-cineflix font-montserrat text-xs shadow-sm">
              <div className="flex items-center gap-3 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <span>Mostrar</span>
                <select
                  value={moviesPerPage}
                  onChange={(e) => { setMoviesPerPage(Number(e.target.value)); setMoviesCurrentPage(1); }}
                  className="border border-border bg-white py-1 px-2.5 rounded-xl text-gray-700 font-bold focus:outline-none focus:border-brand-primary cursor-pointer shadow-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>Películas de {moviesMetadata.total} en total</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={moviesMetadata.prev_page === null}
                  onClick={() => setMoviesCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-white text-gray-600 font-bold uppercase text-[9px] tracking-widest transition-all hover:bg-gray-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from({ length: moviesMetadata.total_pages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setMoviesCurrentPage(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-xl font-black text-[10px] border shadow-sm ${
                      moviesMetadata.current_page === pageNum
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white text-gray-500 border-border hover:border-brand-primary/40"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={moviesMetadata.next_page === null}
                  onClick={() => setMoviesCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-white text-gray-600 font-bold uppercase text-[9px] tracking-widest transition-all hover:bg-gray-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* CONTROL DE VISTA VACÍA POR FALTA DE SELECCIÓN DE CINE */}
          {!selectedCinemaId ? (
            <div className="text-center py-16 border border-dashed border-border bg-slate-50/50 rounded-cineflix p-6">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="font-bold text-slate-700 uppercase tracking-tight text-sm">No se ha seleccionado ninguna sucursal</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Por favor, elija un complejo de cines desde el menú superior para poder ver, auditar o planificar las funciones disponibles.
              </p>
            </div>
          ) : (
            <>
              <ShowtimesTab 
                data={showtimes}
                onEdit={(type, data) => openModal(type, data)}
                onDelete={(type, data) => openModal(type, data)}
              />

              {/* PAGINACIÓN INLINE: FUNCIONES */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-surface-container border border-border rounded-cineflix font-montserrat text-xs shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <span>Mostrar</span>
                  <select
                    value={showtimesPerPage}
                    onChange={(e) => { setShowtimesPerPage(Number(e.target.value)); setShowtimesPage(1); }}
                    className="border border-border bg-white py-1 px-2.5 rounded-xl text-gray-700 font-bold focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>Funciones de {showtimesTotalCount} en total</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!hasPrevShowtimePage}
                    onClick={() => setShowtimesPage(prev => prev - 1)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-white text-gray-600 font-bold uppercase text-[9px] tracking-widest transition-all hover:bg-gray-50 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalShowtimePages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setShowtimesPage(pageNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded-xl font-black text-[10px] border shadow-sm ${
                        showtimesPage === pageNum
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-gray-500 border-border hover:border-brand-primary/40"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!hasNextShowtimePage}
                    onClick={() => setShowtimesPage(prev => prev + 1)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-white text-gray-600 font-bold uppercase text-[9px] tracking-widest transition-all hover:bg-gray-50 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* FORMULARIO DE PELÍCULAS */}
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

      {/* FORMULARIO DE FUNCIONES (Pasa el id del cine actual dinámicamente) */}
      <ShowtimeForm 
        open={modal.isOpen && modal.type === "showtimeForm"}
        onClose={closeModal}
        movies={movies} 
        roomsList={rooms} 
        projectionTypes={projectionTypes}
        languagesList={languages}
        currenciesList={currencies} 
        initialData={modal.data}
        onSave={handleShowtimeSave}
      />

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <DeleteConfirmModal 
        isOpen={modal.isOpen && modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemName={
          activeTab === "movies" 
            ? modal.data?.title 
            : (modal.data?.movie?.title || "esta función")
        }
      />
    </div>
  );
}