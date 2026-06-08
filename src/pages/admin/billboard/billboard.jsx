import { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import Movies from "./movies";
import Showtimes from "./showtimes";
import { getCinemas } from "@/services/cinema.service";
import { getCatalogByName } from "@/services/catalog.service";
import { toast } from "sonner";

export default function BillboardPage() {
  const { modal, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState("movies");
  const [search, setSearch] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  
  // ESTADOS GLOBALES DE CATÁLOGOS (Diccionarios compartidos)
  const [cinemas, setCinemas] = useState([]);
  const [catalogs, setCatalogs] = useState({
    genres: [],
    classifications: [],
    lifecycles: [],
    languages: [],
    projectionTypes: [],
    currencies: []
  });

  const tabs = [
    { id: "movies", label: "Películas" },
    { id: "showtimes", label: "Funciones" },
    { id: "room-events", label: "Eventos" },
  ];

  const titles = {
    movies: "Gestión de Películas",
    showtimes: "Gestión de Funciones",
    events: "Gestión de Eventos",
    
  };

  const descriptions = {
    movies: "Administra la información de las películas de los cines",
    showtimes: "Administra las funciones de proyección",
    events: "Administra los eventos especiales y funciones exclusivas.",
    rentals: "Administra las solicitudes y reservas de alquiler de salas.",
  };

  const placeholders = {
    movies: "Buscar película...",
    showtimes: "Buscar función...",
    events: "Buscar evento...",
    rentals: "Buscar alquiler...",
  };

  const modalTypes = {
    movies: "movieModal",
    showtimes: "showtimeModal",
    events: "eventModal",
    rentals: null,
  };

   const fetchCatalogsData = async () => {
      try {
        // Ejecutamos las llamadas en paralelo para optimizar tiempos de respuesta por red
      const cinemasData = await getCinemas();
      const cinemasList = cinemasData?.data;
      setCinemas(Array.isArray(cinemasList) ? cinemasList : []);
      

      // Bloque 1 de catálogos
      const genresData = await getCatalogByName("genres");
      const classificationsData = await getCatalogByName("age-classifications");
      const lifecyclesData = await getCatalogByName("movie-lifecycle-states");

      // Bloque 2 de catálogos
      const languagesData = await getCatalogByName("languages");
      const projectionTypesData = await getCatalogByName("projection-types");
      const currenciesData = await getCatalogByName("currencies");

      setCatalogs({
        genres: genresData || [],
        classifications: classificationsData || [],
        lifecycles: lifecyclesData || [],
        languages: languagesData || [],
        projectionTypes: projectionTypesData || [],
        currencies: currenciesData || []
      });
    }
    catch (error){
        console.error("Error cargando catálogos operativos:", error);
        toast.error("Fallo crítico al sincronizar diccionarios de configuración");
    }
  }

  // Carga e inicialización de diccionarios operativos para evitar peticiones duplicadas
  useEffect(() => {
    fetchCatalogsData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      
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

        {/* Bloque de Acciones y Filtros Maestros */}
        <div className="flex items-center gap-4">
          
          {/* Selector de Sucursales condicional para Funciones */}
          {activeTab === "showtimes" && (
            <div className="flex items-center gap-2 bg-slate-100/80 border p-2 px-3 rounded-xl shadow-sm">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <select 
                value={selectedCinemaId} 
                onChange={(e) => setSelectedCinemaId(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value=""> Seleccionar Sucursal </option>
                {cinemas.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* BUSCADOR DINÁMICO  */}
          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />

          {/* BOTÓN DE INSERCIÓN */}
          <button
            onClick={() => {
              if (activeTab === "showtimes" && !selectedCinemaId) {
                toast.warning("Por favor, selecciona una sucursal primero para poder programar una función.");
              } else {
                openModal(modalTypes[activeTab]);
              }
            }}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-6 h-6 text-brand-gold" strokeWidth={3} />
            {activeTab === "movies" ? "Añadir Película" 
             : activeTab === "showtimes" ? "Programar Función" : "Crear Evento"}
          </button>
        </div>
      </header>

      {/* NAVEGACION POR PESTAÑAS (TABS) */}
      <div className="flex gap-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "font-bold text-brand-gold border-brand-gold"
                : "text-muted-foreground border-transparent hover:text-brand-primary"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINAMICO */}
      <div className="transition-all duration-200">
        {activeTab === "movies" && (
          <Movies 
            catalogs={catalogs} 
            search={search}
            modal={modal}
            openModal={openModal}
            closeModal={closeModal}
          />
        )}

        {activeTab === "showtimes" && (
          <Showtimes 
            cinemas={cinemas} 
            catalogs={catalogs} 
            cinemaId={selectedCinemaId} 
            search={search}
            modal={modal}
            openModal={openModal}
            closeModal={closeModal}
          />
        )}
      </div>

    </div>
  );
}
