import { useState, useEffect } from "react"
import { 
  useReactTable, 
  getCoreRowModel, 
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { MoviesTab } from "@/components/admin/exhibition/MoviesTab"
import  SuccessModal from "@/components/ui/SuccessModal"
import  DeleteConfirmModal from "@/components/ui/DialogConfirmModal"
import { ShowtimesTab } from "@/components/admin/exhibition/ShowtimesTab"
import { RegisterMovieForm } from "@/components/forms/RegisterMovieForm"
import { ColumnsMovies } from "@/components/admin/exhibition/ColumnsMovies";

// Importación de imagen de prueba (asegúrate de que la ruta sea correcta)
import poster1 from "@/assets/images/posters/the-drama-poster.jpg"

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [selectedId, setSelectedId] = useState(null); // Para manejar la fila seleccionada

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
      poster: null, // Probará el fallback del icono
      genero: "Acción",
      clasificacion: "B",
      duracion: 124,
      state: "Próximamente"
    },
    {
      id: 3,
      titulo: "Aventura en la Selva",
      poster: null, 
      genero: "Animación / Familiar",
      clasificacion: "A",
      duracion: 95,
      state: "En Cartelera"
    }
  ]);
 
  // HANDLERS PARA ACCIONES
  const handleView = (movie) => {
    console.log("Visualizando detalle de:", movie.titulo);
    // Aquí abrirías un modal de detalles o navegarías
  };

  const handleEdit = (movie) => {
    console.log("Abriendo editor para:", movie.titulo);
    // Aquí cargarías el formulario con los datos de 'movie'
  };

  const handleDelete = (movie) => {
    setMovieToDelete(movie);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Eliminando:", movieToDelete.titulo);
    
    // Simulación de eliminación local
    setData(prev => prev.filter(m => m.id !== movieToDelete.id));
    setTotalElements(prev => prev - 1);
    
    setIsDeleteConfirmOpen(false);
    setSuccessMessage({
      title: "¡Eliminado con Éxito!",
      message: "La película ha sido removida del catálogo correctamente."
    });
    setIsSuccessOpen(true); 
  };

  // Definición de columnas (TanStack Table)
  const columns = ColumnsMovies(handleView, handleEdit, handleDelete);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalElements / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    manualPagination: true, 
    getCoreRowModel: getCoreRowModel(),
  });
 
  return (
    <div className="flex flex-col w-full space-y-4">
      <Tabs defaultValue="movies" onValueChange={setActiveTab} className="w-full flex flex-col">
        
        {/* ENCABEZADO DE TABS Y BOTÓN */}
        <div className="flex flex-row justify-between items-end border-b border-slate-200 mb-6 gap-4">
          <TabsList className="bg-transparent rounded-none border-b h-auto p-0 flex gap-8">
            <TabsTrigger 
              value="movies" 
              className="relative h-12 rounded-none bg-transparent px-2 pb-3 pt-2 font-montserrat text-base font-semibold text-muted-foreground transition-all duration-200 border-b-4 border-transparent data-[state=active]:border-b-brand-gold data-[state=active]:text-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Películas
            </TabsTrigger>
            <TabsTrigger 
              value="functions" 
              className="relative h-12 rounded-none bg-transparent px-2 pb-3 pt-2 font-montserrat text-base font-semibold text-muted-foreground transition-all duration-200 border-b-4 border-transparent data-[state=active]:border-b-brand-gold data-[state=active]:text-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Funciones
            </TabsTrigger>
          </TabsList>

          <div className="pb-3">
            <Button onClick={() => setIsFormOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 py-5 rounded-cineflix transition-all active:scale-95 shadow-md flex items-center">
              <Plus className="mr-2 h-5 w-5 border-white" />
              {activeTab === "movies" ? "Agregar Película" : "Agregar Función"}
            </Button>
          </div>
        </div>

        {/* CONTENIDO DE PELÍCULAS */}
        <TabsContent value="movies" className="mt-0 outline-none">
          <p className="text-sm text-slate-500 mb-4 italic">
            Gestiona el catálogo de películas disponibles
          </p>
          <MoviesTab 
            table={table} 
            totalElements={totalElements}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(id) => {
              // Buscamos la película por ID para el modal de confirmación
              const movie = data.find(m => m.id === id);
              handleDelete(movie);
            }}
            onSelectMovie={setSelectedId}
            selectedId={selectedId}
          />
        </TabsContent>

        {/* CONTENIDO DE FUNCIONES */}
        <TabsContent value="functions" className="mt-0 outline-none">
          <p className="text-sm text-slate-500 mb-4 italic">
            Asigna horarios y salas a las películas activas
          </p>
          <ShowtimesTab />
        </TabsContent>
      </Tabs>

      {/* MODALES */}
      <RegisterMovieForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage({
            title: "¡Registro Exitoso!",
            message: "La película se ha añadido al catálogo."
          });
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
  )
}