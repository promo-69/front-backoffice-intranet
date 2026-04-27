
import { useState, useEffect } from "react"
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender 
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { MoviesTab } from "@/components/admin/exhibition/MoviesTab"
import { SuccessModal } from "@/components/ui/SuccessModal"
import { ShowtimesTab } from "@/components/admin/exhibition/ShowtimesTab"
import { RegisterMovieForm } from "@/components/forms/RegisterMovieForm"
import poster1 from "@/assets/images/posters/the-drama-poster.jpg"

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState("movies");
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [moviesData, setMoviesData] = useState([
    {
      id: 1,
      title: "EL Drama",
      poster_url: poster1,
      age_classification: "C",
      duration_minutes: 169,
      state: "En Cartelera"
    }
  ]);
 
  const handleRegistrationSuccess = () => {
    setIsSuccessOpen(true);
  };
/** 
 *  const table = useReactTable({
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
    
  // Fetch al backend 
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/movies?page=${pageIndex}&limit=${pageSize}`);
      const result = await response.json();
      setData(result.movies);
      setTotalElements(result.total);
    };
    fetchData();
  }, [pageIndex, pageSize]);
*/
 

  return (
    <div className="flex flex-col w-full space-y-4">
      <Tabs defaultValue="movies" onValueChange={setActiveTab} className="w-full flex flex-col">
        
        {/* CONTENEDOR PRINCIPAL: Pestañas a la izquierda, Botón a la derecha */}
        <div className="flex flex-row justify-between items-end border-b border-slate-200 mb-6 gap-4">
          
          {/* Listado de Pestañas (Sin fondo, estilo underline) */}
          <TabsList className="bg-transparent rounded-none border-b h-auto p-0 flex gap-8">
            <TabsTrigger 
              value="movies" 
              className="
              relative h-12 rounded-none bg-transparent px-2 pb-3 pt-2 font-montserrat text-base font-semibold text-muted-foreground 
              transitio-all duration-200
              border-b-4 border-transparent
              data-[state=active]:border-b-brand-gold 
              data-[state=active]:text-brand-primary 
              data-[state=active]:bg-transparent
              data-[state=active]:shadow-none"
            >
              Películas
            </TabsTrigger>
            <TabsTrigger 
              value="functions" 
              className="relative h-12 rounded-none bg-transparent px-2 pb-3 pt-2 font-montserrat text-base font-semibold text-muted-foreground 
              transitio-all duration-200
              border-b-4 border-transparent
              data-[state=active]:border-b-brand-gold 
              data-[state=active]:text-brand-primary 
              data-[state=active]:bg-transparent
              data-[state=active]:shadow-none"
            >
              Funciones
            </TabsTrigger>
          </TabsList>

          {/* Botón de Acción*/}
          <div className="pb-3">
            <Button onClick={() => setIsFormOpen(true)}className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 py-5 rounded-cineflix transition-all active:scale-95 shadow-md flex items-center">
              <Plus className="mr-2 h-5 w-5 border-white" />
              {activeTab === "movies" ? "Agregar Película" : "Agregar Función"}
            </Button>
          </div>
        </div>

        {/* CONTENIDOS*/}
        <TabsContent value="movies" className="mt-0 outline-none">
          <p className="text-sm text-slate-500 mb-4 italic">
            Gestiona el catálogo de películas disponibles
          </p>
          <MoviesTab moviesData={moviesData} />
          {/* <MoviesTab table={table} totalElements={totalElements} /> */}
        </TabsContent>

        <TabsContent value="functions" className="mt-0 outline-none">
          <p className="text-sm text-slate-500 mb-4 italic">
            Asigna horarios y salas a las películas activas
          </p>
          <ShowtimesTab />
        </TabsContent>
      </Tabs>
      <RegisterMovieForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setIsSuccessOpen(true)} 
      />

      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
      />

      {/* Botón de prueba (puedes borrarlo luego o integrarlo al flujo real) */}
      <Button onClick={handleRegistrationSuccess} >
        Probar Éxito
      </Button>
    </div>
  )
}