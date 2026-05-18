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
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie} from "@/services/movie.service";
import { showtimesService } from "@/services/showtime.service";
import { getAllRooms } from "@/services/room.service";
import { Alert } from "@/components/ui/alert"
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
  
  const [movies, setMovies] = useState([]);
  const [moviesPage, setMoviesPage] = useState(1);
  const [moviesMetadata, setMoviesMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: 0,
    prev_page: 0
  });

  const [showtimes, setShowtimes] = useState([]);
  const [showtimesPage, setShowtimesPage] = useState(1);
  const [showtimesMetadata, setShowtimesMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: 0,
    prev_page: 0
  });

  const [search, setSearch] = useState("")

  
  /*const fetchAllData = useCallback(async () => {
    showLoader();
    try {
      const [moviesRes] = await Promise.all([
        moviesService.getAll(),
      
      ]);
      setMovies(moviesRes.data || []);
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);*/

  const fetchMovies = useCallback(async (page=1) => {
    showLoader();
    try {
      
      const response = await getMovies({ page, per_page: 10 });
        
        // Guardamos los datos de las películas
      setMovies(response.data || []);
        
       
      if (response.metadata) {
          setMoviesMetadata(response.metadata);
      }
      } catch (error) {
        console.error("Error al cargar películas:", error);
        const messageError=error.response?.data?.message || "Error al conectar con el servidor";
        toast.error(messageError);
        setMovies([]);
      } finally {
        hideLoader();
      }
    }, [showLoader, hideLoader]);

    /*const fetchShowtimes = useCallback(async (page=1) => {
      showLoader();
      try {
        const response = await showtimesService.getAll({ page, per_page: 10 });
        setShowtimes(response.data || []);
        if (response.metadata) {
          setShowtimesMetadata(response.metadata);
        } 
      } catch (error) {
        console.error("Error al cargar funciones:", error);
        const messageError=error.response?.data?.message || "Error al conectar con el servidor";
        toast.error(messageError);
        setShowtimes([]);
      } finally {
        hideLoader();
      }
    }, [showLoader, hideLoader]);*/

    const fetchShowtimes = useCallback(async ()=> {
      showLoader();
      try {
        const response = await showtimesService.getAll();
        setShowtimes(response.data || []);
      } catch (error) {
        console.error("Error al cargar funciones:", error);
        const messageError=error.response?.data?.message || "Error al conectar con el servidor";
        toast.error(messageError);
        setShowtimes([]);
      } finally {
        hideLoader();
      }
    }, [showLoader, hideLoader]);

    useEffect(() => {
  const loadInitialData = async () => {
    showLoader(); // Sube el contador a 1 de forma limpia
    try {
      // Se ejecutan en paralelo de forma controlada
      await Promise.all([
        fetchMovies(moviesPage),
        fetchShowtimes()
      ]);
    } catch (error) {
      console.error("Error cargando cartelera:", error);
    } finally {
      hideLoader(); // Baja el contador a 0 limpiamente
    }
  };

  loadInitialData();
}, [moviesPage]);


   /*     
    useEffect(() => {
      console.log("-> useEffect de películas ejecutado. moviesPage actual:", moviesPage);
      fetchMovies(moviesPage);
    }, [moviesPage, fetchMovies]); 


   useEffect(() => {
    /* * Como el endpoint actual de showtimes no maneja paginación en el backend,
     * llamamos a fetchShowtimes sin pasarle ningún parámetro de página.
     * Esto ejecutará la petición directa limpia y evitará ciclos innecesarios.
     
    console.log("-> useEffect de funciones ejecutado.");
    fetchShowtimes(); 
  }, [fetchShowtimes]); */


    const refreshActiveTab = async () => {
    if (activeTab === "movies") {
      await fetchMovies(moviesPage);
    } else {
      await fetchShowtimes(showtimesPage);
    }
  };


  const handleOpenEditModal = (type, item) => {
  if (type === "movieForm") {
    // CORREGIDO: Mapeamos accediendo a la propiedad exacta ".genre" que devuelve tu API
    const genreIds = item._MovieGenres?.map(g => g.genre) || [];
    
    const mappedMovie = {
      ...item,
      genres: genreIds 
    };
    
    openModal("movieForm", mappedMovie);
  } else {
    openModal(type, item);
  }
};

// --- ACCIONES MUTABLES (SAVE & DELETE) ---
  const handleSave = async (payload) => {
    showLoader()
    try {
      if (activeTab === "movies") {
        // Si el payload viene con un arreglo de números [2], lo convertimos a string "[2]"
        let finalPayload = payload;
        if (payload && Array.isArray(payload.genres)) {
          finalPayload = {
            ...payload,
            genres: JSON.stringify(payload.genres) 
          }
        }

        modal.data?.id 
          ? await updateMovie(modal.data.id, finalPayload)
          : await createMovie(finalPayload)
          
      } else {
        modal.data?.id
          ? await showtimesService.update(modal.data.id, payload)
          : await showtimesService.create(payload)
      }
      
      closeModal()
      await refreshActiveTab()
      
      openModal("success", { 
        title: "¡Operación Exitosa!", 
        message: "El registro ha sido actualizado correctamente." 
      })
    } catch (error) {
      console.error("Error al guardar:", error)
      toast.error(error.response?.data?.message || "Error al conectar con el servidor")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async () => {
    if (!modal.data?.id) return
    
    showLoader()
    try {
      if (activeTab === "movies") {
        await deleteMovie(modal.data.id)
      } else {
        await showtimesService.delete(modal.data.id)
      }
      
      closeModal()
      await refreshActiveTab()
      
      openModal("success", { 
        title: "Eliminado", 
        message: "El registro ha sido removido exitosamente." 
      })
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast.error(error.response?.data?.message || "Error al conectar con el servidor")
    } finally {
      hideLoader()
    }
  }

  // Filtro de búsqueda en tiempo real sobre los datos locales de la página
  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    
      <div className="max-w-7xl mx-auto font-montserrat space-y-6">
        
        {/* HEADER DINÁMICO */}
        <header className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
          <div>
            
              <h3 className="text-lg font-bold text-brand-primary leading-tight">
                {activeTab === "movies" ? "Gestión de Catálogo" : "Gestión de Funciones"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeTab === "movies" 
                  ? "Administra las películas y sus clasificaciones" 
                  : "Organiza horarios, salas y precios"}
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
        <TabsCustom tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* TAB DE PELÍCULAS */}
        {activeTab === "movies" && (
          <MoviesTab 
            data={movies} 
            onEdit={(type, item) => handleOpenEditModal(type, item)} 
            onDelete={(type, item) => openModal(type, item)}
            
          />
        )}

        {/* TAB DE SHOWTIMES */}
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
              
              <div className="relative inline-flex items-center px-4 py-2 text-xs font-bold text-brand-primary bg-white min-w-[120px] justify-center tracking-wider uppercase font-montserrat">
                Página {activeTab === "movies" ? moviesMetadata.current_page : showtimesMetadata.current_page} de {activeTab === "movies" ? moviesMetadata.total_pages : showtimesMetadata.total_pages}
              </div>

              <button
                onClick={() => {
                  activeTab === "movies"
                    ? setMoviesPage(moviesMetadata.next_page)
                    : setShowtimesPage(showtimesMetadata.next_page);
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
       {/* Formulario de Películas */}
       
        <MovieForm
          open={modal.isOpen && modal.type === "movieForm"}
          initialData={modal.data}
          onClose={closeModal}
          onSuccess={handleSave} 
          lifecycleStatesList={MOCK_LIFECYCLE}
          genresList={MOCK_GENRES}
        />


        {/* Formulario de Funciones */}
        
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

const MOCK_ROOMS = [
  { id: 1, descripton: "Sala 1" },
  { id: 2, descripton: "Sala 2" }
];

const MOCK_CLASSIFICATIONS = [
  { id: 1, description: "A (Todo Público)" },
  { id: 2, description: "B (+12)" },
  { id: 3, description: "C (+15)" },
  { id: 4, description: "D (+18)"  }
];

const MOCK_LIFECYCLE = [
  { id: 1, description: 'Próximamente' },
  { id: 2, description: 'En Cartelera (Estreno)'},
  { id: 3, description: 'En Cartelera (Regular)'},
  { id: 4, description: 'Últimos Días'},
  { id: 5, description: 'Fuera de Cartelera'},
           
]

const MOCK_GENRES =[
{ id: 1, description: 'Acción'},
{ id: 2, description: 'Comedia' },
{ id: 3, description: 'Drama' },
{ id: 4, description: 'Ciencia Ficción'},
{ id: 5, description: 'Terror / Suspenso'},
{ id: 6, description: 'Animación / Infantil'}
];