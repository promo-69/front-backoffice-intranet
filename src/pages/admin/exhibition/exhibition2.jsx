import { useState } from "react"
import { useModal } from "@/hooks/useModal"
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab2"
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab2"
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm2"
import SuccessModal from "@/components/ui/SuccessModal"
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import MovieForm from "@/components/admin/exhibition/movies/MovieForm2"
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Plus } from "lucide-react";


// Mock Data actualizado con la nueva nomenclatura
const MOCK_MOVIES = [
  {
    id: 1,
    title: "The Drama",
    ageClassification: 3, // Clase C (+16)
    releaseDate: "2026-05-20",
    durationMinutes: 125,
    lifecycleStates: 2, // En Cartelera
    synopsis: "Una historia intensa sobre las relaciones modernas.",
    trailerUrl: "https://youtube.com/watch?v=example1",
    posterUrl: "https://placehold.co/400x600?text=The+Drama",
    allowPromotions: true
  },
  {
    id: 2,
    title: "Sonic 3",
    ageClassificationId: 1, // Clase A (TP)
    releaseDate: "2026-06-15",
    durationMinutes: 110,
    lifecycleStates: 1, // Próximamente
    synopsis: "Sonic regresa para una nueva aventura a toda velocidad.",
    trailerUrl: "https://youtube.com/watch?v=example2",
    posterUrl: "https://placehold.co/400x600?text=Sonic+3",
    allowPromotions: true
  },
  {
    id: 3,
    title: "Cinefilos Night",
    ageClassificationId: 4, // Clase D (+18)
    releaseDate: "2026-05-10",
    durationMinutes: 180,
    lifecycleStates: 3, // Evento Especial
    synopsis: "Maratón exclusiva para fanáticos del cine clásico.",
    trailerUrl: "https://youtube.com/watch?v=example3",
    posterUrl: "https://placehold.co/400x600?text=Evento+Especial",
    specialPrice: 15.50,
    allowPromotions: false
  }
];

export default function ExhibitionPage() {
  const { modal, openModal, closeModal } = useModal();
  const [movies, setMovies] = useState(MOCK_MOVIES);
  const [showtimes, setShowtimes] = useState(MOCK_SHOWTIMES);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("movies");

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" }
  ];

  const actions = {
    // Detecta qué formulario abrir según el Tab activo
    openForm: (data = null) => {
      const type = activeTab === "movies" ? "movieForm" : "showtimeForm";
      openModal(type, data);
    },

    openDelete: (item) => {
      openModal("delete", item);
    },

    handleSave: (formData) => {
      // Lógica de guardado genérica (aquí procesarías según el tab)
      console.log("Guardando en:", activeTab, formData);
      closeModal();
      openModal("success", { 
        title: "¡Éxito!", 
        message: "El registro ha sido actualizado correctamente." 
      });
    },

    handleDeleteConfirm: () => {
      if (activeTab === "movies") {
        setMovies(prev => prev.filter(m => m.id !== modal.data.id));
      } else {
        setShowtimes(prev => prev.filter(s => s.id !== modal.data.id));
      }
      closeModal();

      setTimeout(() => {
        openModal("success", { 
          title: modal.data?.id ? "¡Cambios Guardados!" : "¡Registro Exitoso!", 
          message: modal.data?.id 
            ? "La información de la película ha sido actualizada correctamente." 
            : "El nuevo título ha sido añadido al catálogo." 
        });
      }, 100);
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
              onClick={() => actions.openForm()}
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
            onEdit={actions.openForm} 
            onDelete={actions.openDelete} 
          />
        )}

        {/* TAB DE SHOWTIMES */}
        {activeTab === "showtimes" && (
          <ShowtimesTab 
            data={showtimes} 
            onEdit={actions.openForm} 
            onDelete={actions.openDelete} 
          />
        )}

        {/* --- MODALES CENTRALIZADOS --- */}
        <MovieForm
          open={modal.isOpen && modal.type === "movieForm"}
          initialData={modal.data}
          onClose={closeModal}
          onSuccess={actions.handleSave}
        />

        <ShowtimeForm
          open={modal.isOpen && modal.type === "showtimeForm"}
          initialData={modal.data}
          onClose={closeModal}
          onSave={actions.handleSave}
          movies={movies}
        />

        <DeleteConfirmModal 
          isOpen={modal.isOpen && modal.type === "delete"}
          onClose={closeModal}
          onConfirm={actions.handleDeleteConfirm}
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

const MOCK_SHOWTIMES = [
  {
    id: 1,
    movie_title: "The Drama",
    room_name: "Sala 01 - IMAX",
    date: "2026-05-30",
    start_time: "14:00",
    end_time: "16:30",
    price: "12.00",
  }
];