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



export default function ExhibitionPage() {
  const { modal, openModal, closeModal } = useModal();
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const [activeTab, setActiveTab] = useState("movies");

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" }
  ];

  const fetchAllData = useCallback(async () => {
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
  }, [showLoader, hideLoader]);

  const fetchRooms = useCallback(async () => {
    showLoader();
    try {
      const roomsRes = await showtimesService.getRooms();
      setRooms(roomsRes);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
  // Disparar la carga inicial automáticamente
  fetchAllData(); 
  //etchRooms();
}, [/*, fetchRooms]*/]); 


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
      await fetchAllData(); // Recarga la lista automáticamente
      
      // Abrimos modal de éxito
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

  // Función para Eliminar (DELETE)
  const handleDelete = async () => {
    showLoader();
    try {
      if (activeTab === "movies") {
        await moviesService.delete(modal.data.id);
      } else {
        await showtimesService.delete(modal.data.id);
      }
      closeModal();
      await fetchAllData();
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
            onEdit={openModal} 
            onDelete={openModal} 
          />
        )}

        {/* TAB DE SHOWTIMES */}
        {activeTab === "showtimes" && (
          <ShowtimesTab 
            data={showtimes} 
            onEdit={openModal} 
            onDelete={openModal} 
          />
        )}

        {/* --- MODALES CENTRALIZADOS --- */}
       {/* Formulario de Películas */}
       {modal.isOpen && modal.type === "movieForm"&& (
        <MovieForm
          open={true}
          initialData={modal.data}
          onClose={closeModal}
          onSuccess={handleSave} 
          lifecycleStatesList={MOCK_LIFECYCLE}
          genresList={MOCK_GENRES}
        />)}


        {/* Formulario de Funciones */}
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