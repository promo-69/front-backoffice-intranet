import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus, Building2 } from "lucide-react"; 
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
import { getCinemas } from "@/services/cinema.service"; 

const FALLBACKS = {
  genresData: [{ id: 1, description: "Acción" }, { id: 2, description: "Comedia" }],
  classificationsData: [{ id: 1, description: "A (Todo Público)" }, { id: 2, description: "B (+12)" }],
  lifecyclesData: [{ id: 1, description: "En Cartelera" }],
  projectionTypesData: [{ id: 1, description: "2D Tradicional" }],
  currenciesData: [{ id: 1, description: "USD - Dólares", symbol: "$" }],
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

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const { modal, openModal, closeModal } = useModal();
  const { showLoader, hideLoader } = useLoading();

  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  const [movies, setMovies] = useState([]);
  const [moviesCurrentPage, setMoviesCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(10);
  const [moviesMetadata, setMoviesMetadata] = useState(null);

  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesPerPage, setShowtimesPerPage] = useState(10);
  const [showtimesTotalCount, setShowtimesTotalCount] = useState(0);

  const [filterMovieId, setFilterMovieId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [genres, setGenres] = useState([]);
  const [ageClassifications, setAgeClassifications] = useState([]);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [rooms, setRooms] = useState([]);

  // --- MANEJADOR DEL BOTÓN DINÁMICO ---
  const handleAdd = () => {
    if (activeTab === "movies") {
      openModal("movieForm", null);
    } else {
      if (!selectedCinemaId) {
        toast.warning("Debe seleccionar una sucursal para poder planificar una función.");
        return;
      }
      openModal("showtimeForm", { cinema_id: selectedCinemaId });
    }
  };

  const safeFetchCatalog = async (catalogName, fallbackKey) => {
    try {
      const response = await getCatalogByName(catalogName);
      if (Array.isArray(response) && response.length > 0) return response;
      return FALLBACKS[fallbackKey] || [];
    } catch (error) {
      return FALLBACKS[fallbackKey] || [];
    }
  };

  useEffect(() => {
    async function loadAllInitialData() {
      showLoader();
      try {
        const cinemaRes = await getCinemas();
        const cinemaList = cinemaRes.data || (Array.isArray(cinemaRes) ? cinemaRes : null);
        setCinemas(cinemaList || FALLBACKS.cinemasData);
      } catch (e) {
        setCinemas(FALLBACKS.cinemasData);
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

  useEffect(() => {
    async function loadRooms() {
      if (!selectedCinemaId) { setRooms([]); return; }
      try {
        const roomsData = await getRoomsByCinema(selectedCinemaId);
        setRooms(Array.isArray(roomsData) ? roomsData : (roomsData?.rows || []));
      } catch (error) { console.error(error); }
    }
    loadRooms();
  }, [selectedCinemaId]);

  useEffect(() => {
    async function loadMovies() {
      showLoader();
      try {
        const res = await getMovies(moviesCurrentPage, moviesPerPage);
        setMovies(res.data || []);
        if (res.metadata) setMoviesMetadata(res.metadata);
      } catch (err) { toast.error("Error al sincronizar películas"); } 
      finally { hideLoader(); }
    }
    loadMovies();
  }, [moviesCurrentPage, moviesPerPage]);

  useEffect(() => {
    async function loadShowtimes() {
      if (activeTab !== "showtimes" || !selectedCinemaId) {
        setShowtimes([]); setShowtimesTotalCount(0); return;
      }
      showLoader();
      try {
        const filters = { page: showtimesPage, limit: showtimesPerPage, movieId: filterMovieId || undefined, date: filterDate || undefined, startDate: filterStartDate || undefined, endDate: filterEndDate || undefined };
        const res = await getShowtimesByCinema(selectedCinemaId, filters);
        if (res.success) { setShowtimes(res.data?.rows || []); setShowtimesTotalCount(res.data?.count || 0); }
      } catch (err) { setShowtimes([]); } 
      finally { hideLoader(); }
    }
    loadShowtimes();
  }, [activeTab, selectedCinemaId, showtimesPage, showtimesPerPage, filterMovieId, filterDate, filterStartDate, filterEndDate]);

  const totalShowtimePages = Math.ceil(showtimesTotalCount / showtimesPerPage) || 1;
  const hasNextShowtimePage = showtimesPage < totalShowtimePages;
  const hasPrevShowtimePage = showtimesPage > 1;

  const handleMovieSuccess = async () => { closeModal(); setMoviesCurrentPage(1); };
  const handleShowtimeSuccess = async () => { closeModal(); setShowtimesPage(1); };

  const handleShowtimeSave = async (payload) => {
    showLoader();
    try {
      const targetCinemaId = modal.data?.cinema_id || selectedCinemaId;
      const enrichedPayload = { ...payload, cinema_id: Number(targetCinemaId) };
      if (modal.data?.id) {
        const { id, ...updateData } = enrichedPayload;
        await patchShowtime(id, updateData);
      } else {
        await createByCinema(targetCinemaId, enrichedPayload);
      }
      closeModal();
      setShowtimesPage(1);
    } catch (error) { toast.error("Error al procesar la función"); } 
    finally { hideLoader(); }
  };

  const handleConfirmDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      if (activeTab === "movies") { await deleteMovie(modal.data.id); await handleMovieSuccess(); }
      else { await deleteShowtime(modal.data.id); await handleShowtimeSuccess(); }
    } catch (error) { toast.error("Error al borrar"); } 
    finally { hideLoader(); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-montserrat">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mt-0.5">Administración global de películas y planificación de funciones.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {activeTab === "showtimes" && (
            <div className="flex items-center gap-2 bg-slate-100/80 border border-border p-1.5 px-3 rounded-xl shadow-sm">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <select value={selectedCinemaId} onChange={(e) => { setSelectedCinemaId(e.target.value); setShowtimesPage(1); }} className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-4">
                <option value="">-- Seleccionar Sucursal --</option>
                {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="
              bg-brand-primary text-white 
              px-5 py-2.5
              rounded-xl
              flex items-center gap-2 
              text-[11px] font-black uppercase tracking-widest
              hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5
              active:scale-95
              transition-all duration-300
              border-2 border-purple-400/30
              font-montserrat
            "
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> 
            {activeTab === "movies" ? "Registrar Película" : "Programar Función"}
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