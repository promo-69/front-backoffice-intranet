import { useState } from "react";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { useNavigate } from "react-router-dom";

// Componentes de cada pestaña
import MoviesManager from "@/components/admin/exhibition/movies/MoviesManager";
//import ShowsManager from "@/pages/admin/billboard/ShowsManager";
//import EventsManager from "@/pages/admin/billboard/EventsManager";
//import RentalsManager from "@/pages/admin/billboard/RentalsManager";

// Modales correspondientes
import RegisterMovieModal from "@/components/admin/exhibition/movies/MovieForm";

export default function BillboardPage() {
  const { modal, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("movies");
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "shows", label: "Funciones" },
    { id: "events", label: "Eventos Especiales" },
    { id: "rentals", label: "Alquiler de Salas" },
  ];

  const titles = {
    movies: "Gestión de Películas",
    shows: "Gestión de Funciones",
    events: "Gestión de Eventos Especiales",
    rentals: "Gestión de Alquiler de Salas",
  };

  const descriptions = {
    movies: "Administra el catálogo global de películas del sistema.",
    shows: "Administra los horarios, salas y proyecciones de las películas.",
    events: "Administra los eventos especiales y funciones exclusivas.",
    rentals: "Administra las solicitudes y reservas de alquiler de salas.",
  };

  const placeholders = {
    movies: "Buscar película...",
    shows: "Buscar función...",
    events: "Buscar evento...",
    rentals: "Buscar alquiler...",
  };

  const modalTypes = {
    movies: "movieForm",
    shows: "showForm",
    events: "eventForm",
    rentals: null,
  };

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6 text-left">
      
      {/* HEADER DINÁMICO */}
      <header className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {titles[activeTab]}
          </h3>
          <p className="text-xs text-muted-foreground">
            {descriptions[activeTab]}
          </p>
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />

          {/* BOTÓN DINÁMICO */}
          {activeTab !== "rentals" && (
            <button
              onClick={() => {
                if (activeTab === "shows") {
                  navigate("/admin/billboard/create-show");
                } else {
                  openModal(modalTypes[activeTab]);
                }
              }}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />

              {activeTab === "movies"
                ? "Registrar Película"
                : activeTab === "shows"
                  ? "Programar Función"
                  : activeTab === "events"
                    ? "Crear Evento"
                    : ""}
            </button>
          )}
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "font-bold text-brand-gold border-brand-gold"
                : "text-muted-foreground border-transparent hover:text-brand-primary"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              setSearch(""); // Limpia la barra de búsqueda al cambiar de vista
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO POR PESTAÑA */}
      {activeTab === "movies" && <MoviesManager search={search} />}
      {activeTab === "shows" && <ShowsManager search={search} />}
      {activeTab === "events" && <EventsManager search={search} />}
      {activeTab === "rentals" && <RentalsManager search={search} />}

      {/* INYECCIÓN DE MODALES CENTRALIZADOS */}
      {modal.isOpen && modal.type === "movieForm" && (
        <RegisterMovieModal open={true} onClose={closeModal} />
      )}

      {/* {modal.isOpen && modal.type === "showForm" && (
        <RegisterShowModal open={true} onClose={closeModal} />
      )} */}
    </div>
  );
}