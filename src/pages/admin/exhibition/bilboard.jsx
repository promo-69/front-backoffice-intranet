import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getCinemas } from "@/services/cinema.service";

// Importamos los nuevos subcomponentes (Managers)
import MoviesManager from "../../../components/admin/exhibition/movies/MoviesManager";
// import ShowtimesManager from "./showtimes/ShowtimesManager";
// import EventsManager from "./events/EventsManager";
// import RentalsManager from "./rentals/RentalsManager";

export default function BillboardPage() {
  const { modal, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState("movies");
  
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  useEffect(() => {
    async function loadCinemas() {
      try {
        const res = await getCinemas();
        setCinemas(res.data || []);
      } catch (e) {
        toast.error("Error al cargar sucursales");
      }
    }
    loadCinemas();
  }, []);

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" },
    { id: "events", label: "Eventos Especiales" },
    { id: "rentals", label: "Alquiler de Salas" }
  ];

  const titles = {
    movies: "Gestión de Películas",
    showtimes: "Programación de Funciones",
    events: "Eventos Especiales",
    rentals: "Alquiler de Salas",
  };

  const descriptions = {
    movies: "Administra el catálogo global de películas del sistema.",
    showtimes: "Planifica y audita las funciones por sucursal.",
    events: "Gestiona eventos especiales, preestrenos y festivales.",
    rentals: "Administra las solicitudes de alquiler de salas corporativas.",
  };

  const buttonLabels = {
    movies: "Registrar Película",
    showtimes: "Programar Función",
    events: "Crear Evento",
    rentals: "Nuevo Alquiler",
  };

  const modalTypes = {
    movies: "movieForm",
    showtimes: "showtimeForm",
    events: "eventForm",
    rentals: "rentalForm",
  };

  // --- MANEJADOR DEL BOTÓN PRINCIPAL ---
  const handleAdd = () => {
    // Si la pestaña requiere saber en qué cine estamos, validamos primero
    if (activeTab !== "movies" && !selectedCinemaId) {
      toast.warning(`Debe seleccionar una sucursal para poder añadir ${tabs.find(t => t.id === activeTab).label.toLowerCase()}.`);
      return;
    }

    openModal(modalTypes[activeTab], { cinema_id: selectedCinemaId });
  };

  return (
    <div className="space-y-6">
      
      {/* ⭐ HEADER DINÁMICO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm gap-4">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {titles[activeTab]}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {descriptions[activeTab]}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selector de Sucursales (Visible en todo menos en películas globales) */}
          {activeTab !== "movies" && (
            <div className="flex items-center gap-2 bg-slate-100/80 border border-border p-1.5 px-3 rounded-xl shadow-sm w-full sm:w-auto">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <select 
                value={selectedCinemaId} 
                onChange={(e) => setSelectedCinemaId(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-4 w-full"
              >
                <option value="">-- Seleccionar Sucursal --</option>
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Botón Dinámico */}
          <button
            onClick={handleAdd}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            {buttonLabels[activeTab]}
          </button>
        </div>
      </header>

      {/* ⭐ TABS SELECTORES */}
      <div className="flex gap-4 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors duration-300 ${
              activeTab === tab.id
                ? "font-black text-brand-gold border-brand-gold"
                : "text-slate-400 border-transparent hover:text-brand-primary"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ⭐ CONTENIDO DINÁMICO (Delegando la responsabilidad) */}
      <main>
        {activeTab === "movies" && (
          <MoviesManager />
        )}
        
        {activeTab === "showtimes" && (
          <ShowtimesManager selectedCinemaId={selectedCinemaId} />
        )}

        {activeTab === "events" && (
          <EventsManager selectedCinemaId={selectedCinemaId} />
        )}

        {activeTab === "rentals" && (
          <RentalsManager selectedCinemaId={selectedCinemaId} />
        )}
      </main>
      
    </div>
  );
}