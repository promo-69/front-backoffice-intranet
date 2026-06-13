import { useState, useCallback, useEffect } from "react"
import { useModal } from "@/hooks/useModal"
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab2"
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab2"
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm2"
import SuccessModal from "@/components/ui/SuccessModal"
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import MovieForm from "@/components/admin/exhibition/movies/MovieForm"
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";
import { moviesService } from "@/services/movie.service";
import { showtimesService } from "@/services/showtime.service";
import { getRoomsByCinema } from "@/services/room.service";
import { getCatalogRecords } from "@/services/catalog.service";



export default function ExhibitionPage() {
  const { modal, openModal, closeModal } = useModal();
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const [cinemaId, setCinemaId] = useState(1);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [genres, setGenres] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const [activeTab, setActiveTab] = useState("movies");

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" }
  ];

  const fetchAllData = useCallback(async () => {
    showLoader();
    try {
      const [moviesRes, showtimesRes] = await Promise.all([
        moviesService.getAll(),
        showtimesService.getAll(),
      ]);
      setMovies(Array.isArray(moviesRes) ? moviesRes : moviesRes?.data || []);
      setShowtimes(Array.isArray(showtimesRes) ? showtimesRes : showtimesRes?.data || []);
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const fetchRooms = useCallback(async (cid) => {
    try {
      const roomsRes = await getRoomsByCinema(cid);
      setRooms(Array.isArray(roomsRes) ? roomsRes : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  }, []);

  const fetchCatalogs = useCallback(async () => {
    try {
      const [lifecycleRes, genresRes] = await Promise.all([
        getCatalogRecords('movie-lifecycle_states'),
        getCatalogRecords('genres'),
      ]);
      setLifecycleStates(lifecycleRes?.data || []);
      setGenres(genresRes?.data || []);
    } catch (error) {
      console.error("Error fetching catalogs:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchCatalogs();
  }, [fetchAllData, fetchCatalogs]);

  useEffect(() => {
    if (activeTab === "showtimes") fetchRooms(cinemaId);
  }, [activeTab, cinemaId, fetchRooms]);

  // Función para Crear o Editar (POST/PUT)
  const handleSave = async (payload) => {
    showLoader();
    try {
      if (activeTab === "movies") {
        modal.data?.id 
          ? await moviesService.update(modal.data.id, payload)
          : await moviesService.create(payload);
      } else {
        modal.data?.id
          ? await showtimesService.update(modal.data.id, payload)
          : await showtimesService.create(payload);
      }
      
      closeModal();
      await fetchAllData();
      
      openModal("success", { 
        title: "¡Operación Exitosa!", 
        message: "La cartelera ha sido actualizada correctamente." 
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(error.response?.data?.message || "Error al conectar con el servidor");
    } finally {
      hideLoader();
    }
  };

  const handleDeleteConfirm = async () => {
  if (!modal.data?.id) return;
  
  showLoader();
  try {
    if (activeTab === "movies") {
      await moviesService.delete(modal.data.id);
    } else {
      await showtimesService.delete(modal.data.id);
    }
    
    closeModal();
    await fetchAllData();
    
    openModal("success", { 
      title: "Eliminado", 
      message: "El registro ha sido removido" 
    });
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert(error.response?.data?.message || "Error al conectar con el servidor");
  } finally {
    hideLoader();
  }
};

  return (
    
      <div className="max-w-7xl mx-auto font-montserrat space-y-6">
        
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
            {activeTab === "showtimes" && (
              <select
                value={cinemaId}
                onChange={(e) => setCinemaId(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              >
                <option value={1}>Cine Central</option>
                <option value={2}>Cine Plaza</option>
                <option value={3}>Cine Premium</option>
              </select>
            )}
            <button 
              onClick={() => openModal(activeTab === "movies" ? "movieForm" : "showtimeForm")}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />
              {activeTab === "movies" ? "Añadir Película" : "Programar Función"}
            </button>
          </div>
        </header>

        <TabsCustom tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "movies" && (
          <MoviesTab 
            data={movies} 
            onEdit={openModal} 
            onDelete={openModal} 
          />
        )}

        {activeTab === "showtimes" && (
          <ShowtimesTab 
            data={showtimes} 
            onEdit={openModal} 
            onDelete={openModal} 
          />
        )}

       {modal.isOpen && modal.type === "movieForm"&& (
        <MovieForm
          open={true}
          initialData={modal.data}
          onClose={closeModal}
          onSuccess={handleSave} 
          lifecycleStatesList={lifecycleStates}
          genresList={genres}
        />)}

        <ShowtimeForm
          open={modal.isOpen && modal.type === "showtimeForm"}
          initialData={modal.data}
          onClose={closeModal}
          onSave={handleSave}    
          movies={movies}
          rooms={rooms}         
        />

        <DeleteConfirmModal 
          isOpen={modal.isOpen && modal.type === "delete"}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
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