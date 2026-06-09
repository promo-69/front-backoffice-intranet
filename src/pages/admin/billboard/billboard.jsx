import { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import Movies from "./movies";
import Showtimes from "./showtimes";
import Events from "./events"; 
import { getCinemas } from "@/services/cinema.service";
import { getCatalogByName } from "@/services/catalog.service";
import { toast } from "sonner";

export default function BillboardPage() {
  const { modal, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState("movies");
  const [search, setSearch] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  
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
    "room-events": "Gestión de Eventos Especiales",
  };

  const descriptions = {
    movies: "Administra la información de las películas de los cines.",
    showtimes: "Administra las funciones de proyección y horarios.",
    "room-events": "Administra funciones únicas, premieres y transmisiones exclusivas.",
  };

  const placeholders = {
    movies: "Buscar película...",
    showtimes: "Buscar función...",
    "room-events": "Buscar evento...",
  };

  const modalTypes = {
    movies: "movieModal",
    showtimes: "showtimeModal",
    "room-events": "eventModal",
  };

  const fetchCatalogsData = async () => {
    try {
      const cinemasData = await getCinemas();
      setCinemas(Array.isArray(cinemasData?.data) ? cinemasData.data : []);

      const [genres, classifications, lifecycles, languages, projectionTypes, currencies] = await Promise.all([
        getCatalogByName("genres"),
        getCatalogByName("age-classifications"),
        getCatalogByName("movie-lifecycle-states"),
        getCatalogByName("languages"),
        getCatalogByName("projection-types"),
        getCatalogByName("currencies")
      ]);

      setCatalogs({
        genres: genres || [],
        classifications: classifications || [],
        lifecycles: lifecycles || [],
        languages: languages || [],
        projectionTypes: projectionTypes || [],
        currencies: currencies || []
      });
    } catch (error) {
      console.error("Error cargando catálogos operativos:", error);
      toast.error("Fallo crítico al sincronizar diccionarios de configuración");
    }
  };

  useEffect(() => {
    fetchCatalogsData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      
      {/* HEADER DINÁMICO */}
      <header className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-brand-primary leading-tight">
            {titles[activeTab] || "Gestión de Cartelera"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {descriptions[activeTab]}
          </p>
        </div>

        <div className="flex items-center gap-4">
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

          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
          />

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

      {/* PESTAÑAS */}
      <div className="flex gap-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "font-bold text-brand-gold border-brand-gold"
                : "text-muted-foreground border-transparent hover:text-brand-primary"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              setSearch(""); 
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO */}
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

        {/* NUEVA RENDERIZACIÓN CONDICIONAL */}
        {activeTab === "room-events" && (
          <Events 
            catalogs={catalogs}
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