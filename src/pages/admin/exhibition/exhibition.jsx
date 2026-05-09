import { useState } from "react"
import { 
  useReactTable, 
  getCoreRowModel, 
} from "@tanstack/react-table";
import { Plus } from "lucide-react"
import { MoviesTab } from "@/components/admin/exhibition/MoviesTab"
import SuccessModal from "@/components/ui/SuccessModal"
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import { ShowtimesTab } from "@/components/admin/exhibition/ShowtimesTab"
import { RegisterMovieForm } from "@/components/forms/RegisterMovieForm"
import { ColumnsMovies } from "@/components/admin/exhibition/ColumnsMovies";
import { useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";

import poster1 from "@/assets/images/posters/the-drama-poster.jpg"

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const [search, setSearch] = useState(""); // Estado para el buscador
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [selectedId, setSelectedId] = useState(null);

  const [totalElements, setTotalElements] = useState(3); 
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
   
  const [data, setData] = useState([
    {
      id: 1,
      titulo: "EL Drama",
      poster: poster1,  
      genero: "Drama / Suspenso",
      clasificacion: "C",
      duracion: 169,
      state: "En Cartelera"
    },
    {
        id: 2,
        titulo: "Velocidad Extrema",
        poster: null,
        genero: "Acción",
        clasificacion: "B",
        duracion: 124,
        state: "Próximamente"
    }
  ]);

  const handleView = (movie) => console.log("Ver:", movie.titulo);
  const handleEdit = (movie) => console.log("Editar:", movie.titulo);
  const handleDelete = (movie) => {
    setMovieToDelete(movie);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setData(prev => prev.filter(m => m.id !== movieToDelete.id));
    setTotalElements(prev => prev - 1);
    setIsDeleteConfirmOpen(false);
    setSuccessMessage({
      title: "¡Eliminado con Éxito!",
      message: "La película ha sido removida del catálogo correctamente."
    });
    setIsSuccessOpen(true); 
  };

  const columns = ColumnsMovies(handleView, handleEdit, handleDelete);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalElements / pageSize),
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    manualPagination: true, 
    getCoreRowModel: getCoreRowModel(),
  });

  const { showLoader, hideLoader } = useLoading();
  
    useEffect(() => {
      async function loadData() {
        showLoader();
        try {
          // Aquí va fetch real
          await new Promise((r) => setTimeout(r, 800));
        } finally {
          hideLoader();
        }
      }
  
      loadData();
    }, []);

  return (
    <div className="space-y-6">
      {/* BARRA DE ACCIONES SUPERIOR (IGUAL A USUARIOS) */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            {activeTab === "movies" ? "Cartelera de Películas" : "Gestión de Funciones"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {activeTab === "movies" 
              ? "Administra el catálogo de películas y estrenos" 
              : "Asigna horarios y salas a las películas activas"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={activeTab === "movies" ? "Buscar Película..." : "Buscar Función..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 rounded-cineflix border border-gray-300 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />

          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-2 border-purple-400/30 font-montserrat"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            {activeTab === "movies" ? "Añadir Película" : "Añadir Función"}
          </button>
        </div>
      </div>

      {/* MINI MENÚ DE PESTAÑAS (IGUAL A USUARIOS) */}
      <div className="flex gap-4 border-b pb-2">
        <button
          className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
            activeTab === "movies"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("movies")}
        >
          Películas
        </button>

        <button
          className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors ${
            activeTab === "functions"
              ? "font-bold text-brand-gold border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("functions")}
        >
          Funciones
        </button>
      </div>

      {/* CONTENIDO CONDICIONAL */}
      {activeTab === "movies" && (
        <MoviesTab 
          table={table} 
          totalElements={totalElements}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(data.find(m => m.id === id))}
          onSelectMovie={setSelectedId}
          selectedId={selectedId}
          search={search} // Pasamos el buscador si el componente lo necesita
        />
      )}
      
      {activeTab === "functions" && (
        <ShowtimesTab search={search} />
      )}

      {/* MODALES */}
      <RegisterMovieForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage({ title: "¡Registro Exitoso!", message: "La película se ha añadido al catálogo." });
          setIsSuccessOpen(true);
        }} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={movieToDelete?.titulo}
      />

      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)}
        title={successMessage.title}
        message={successMessage.message} 
      />
    </div>
  );
}