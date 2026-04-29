import { useState } from "react"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Plus } from "lucide-react"
import { MoviesTab } from "@/components/admin/exhibition/movies/MoviesTab"
import SuccessModal from "@/components/ui/SuccessModal"
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import { ShowtimesTab } from "@/components/admin/exhibition/showtimes/ShowtimesTab"
import { ShowtimeForm } from "@/components/admin/exhibition/showtimes/ShowtimeForm"
import { RegisterMovieForm } from "@/components/forms/RegisterMovieForm"
import MovieForm from "@/components/admin/exhibition/movies/MovieForm"
import { ColumnsMovies } from "@/components/admin/exhibition/movies/ColumnsMovies";
import poster1 from "@/assets/images/posters/the-drama-poster.jpg"


export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [movieToEdit, setMovieToEdit] = useState(null);
  const [showtimes, setShowtimes] = useState([
    {
      id: 1,
      movie_id: 1,
      room_id: 101,
      date: "2026-04-30",
      start_time: "14:00",
      end_time: "16:30",
      price: "10.00",
    },
    {
      id: 2,
      movie_id: 2,
      room_id: 102,
      date: "2026-04-30",
      start_time: "17:00",
      end_time: "19:00",
      price: "12.50",
    },
  ]); 
  const [itemToEdit, setItemToEdit] = useState(null);
  

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

  const [rooms] = useState([ // Esto vendría de RoomManager o API
    { id: 101, name: "Sala 1 - IMAX" },
    { id: 102, name: "Sala 2 - VIP" }
  ]);

  const handleView = (movie) => console.log("Ver:", movie.titulo);
  
  const handleOpenCreate = () => {
    if (activeTab === "movies") {
      setMovieToEdit(null);
    } else {
      setItemToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    if (activeTab === "movies") {
      setMovieToEdit(item);
    } else {
      setItemToEdit(item);
    }
    setIsFormOpen(true);
  };

  const handleDelete = (item) => {
    if (activeTab === "movies") {
      setMovieToDelete(item);
      setIsDeleteConfirmOpen(true);
    } else {
      handleDeleteMovieShowtime(item);
    }
  };

  const handleMovieConfirmDelete = () => {
    if (activeTab === "movies") {
      setData((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setTotalElements((prev) => prev - 1);
      setIsDeleteConfirmOpen(false);
      setSuccessMessage({
        title: "¡Eliminado con Éxito!",
        message: "La película ha sido removida del catálogo correctamente.",
      });
      setIsSuccessOpen(true);
    }
  };

  const handleShowtimeConfirmDelete = () => {
  if (activeTab === "movies") {
    setData(prev => prev.filter(m => m.id !== movieToDelete.id));
  } else {
    setShowtimes(prev => prev.filter(st => st.id !== movieToDelete.id));
  }
  setIsDeleteConfirmOpen(false);
  setMovieToDelete(null);
  
  setSuccessMessage({ title: "Eliminado", message: "Operación realizada con éxito" });
  setIsSuccessOpen(true);
};

  const handleFormSuccess = (isEdit) => {
    if (activeTab === "movies") {
      setSuccessMessage({
        title: isEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: isEdit
          ? "La información de la película ha sido actualizada."
          : "La nueva película ha sido añadida al catálogo correctamente.",
      });
    } else {
      setSuccessMessage({
        title: isEdit ? "¡Función Actualizada!" : "¡Función Programada!",
        message: isEdit
          ? "La información de la función ha sido actualizada."
          : "La nueva función ha sido programada correctamente.",
      });
    }
    setIsSuccessOpen(true);
  };

  const handleSaveShowtime = (newShowtime) => {
    if (itemToEdit) {
      setShowtimes(prev => prev.map(s => s.id === itemToEdit.id ? { ...newShowtime, id: s.id } : s));
    } else {
      setShowtimes(prev => [...prev, { ...newShowtime, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setItemToEdit(null);
  };

  const handleDeleteMovieShowtime = (st) => {
    setShowtimes(prev => prev.filter(item => item.id !== st.id));
  };
  const handleDeleteShowtime = (showtime) => {
  setMovieToDelete(showtime); // Usamos el mismo estado de 'movieToDelete' para el modal
  setIsDeleteConfirmOpen(true);
};

  const enrichedShowtimes = showtimes.map(st => {
    const movie = data.find(m => m.id === parseInt(st.movie_id));
    const room = rooms.find(r => r.id === parseInt(st.room_id));

    return {
      ...st,
      movie_title: movie?.titulo || "N/A",
      room_name: room?.name || "N/A",
    };
  });

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
            onClick={handleOpenCreate}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-2 border-purple-400/30 font-montserrat"
          >
            <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
            {activeTab === "movies" ? "Añadir Película" : "Añadir Función"}
          </button>
        </div>
      </div>

      {/* MINI MENÚ DE PESTAÑAS  */}
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
        <>
        <MoviesTab 
          table={table} 
          totalElements={totalElements}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(data.find((m) => m.id === id))}
          onSelectMovie={setSelectedId}
          selectedId={selectedId}
          search={search}
        />

        <MovieForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={movieToEdit}
          onSuccess={handleFormSuccess}
        />
        </>
      )}

      {activeTab === "functions" && (
        <>
          <ShowtimesTab
            data={enrichedShowtimes}
            onEdit={handleEdit}
            onDelete={handleDeleteShowtime}
            search={search}
          />

          <ShowtimeForm
            open={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setItemToEdit(null);
            }}
            initialData={itemToEdit}
            movies={data} 
            rooms={rooms}
            existingShowtimes={showtimes}
            onSave={handleSaveShowtime}
          />
        </>
      )}

      <DeleteConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleMovieConfirmDelete}
        itemName={movieToDelete?.title}
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