import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { useLoading } from "@/context/LoadingContext"; 
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { ShowtimesTab } from "@/components/admin/billboard/showtimes/ShowtimesTab"; 
import { ShowtimeModal } from "@/components/admin/billboard/showtimes/ShowtimeModal"; 
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SelectForm } from "@/components/ui/SelectForm"; 
import { getShowtimesByCinema, deleteShowtime, createByCinema, updateShowtime } from "@/services/showtime.service";

export default function Showtimes({ catalogs, cinemaId, search, modal, openModal, closeModal }) {
  const { showLoader, hideLoader } = useLoading();
  
  const [loading, setIsLoading] = useState(false);
  const [showtimes, setShowtimes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de control para la segmentación cronológica basada en query parameters
  const [filterType, setFilterType] = useState("future"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null
  });

  const fetchShowtimes = async () => {
    if (!cinemaId) return; // Utiliza el prop cinemaId del componente
    setIsLoading(true);

    try {
      let onlyFutureParam = undefined;
      if (filterType === "future") onlyFutureParam = true;
      if (filterType === "all") onlyFutureParam = false;

      const responseData = await getShowtimesByCinema({
        cinemaId: cinemaId, // Utiliza el prop cinemaId
        page: currentPage,
        limit: metadata.per_page,
        onlyFuture: onlyFutureParam,
        startDate: filterType === "all" && startDate ? startDate : undefined,
        endDate: filterType === "all" && endDate ? endDate : undefined
      });

      const rows = responseData?.showtimes || [];
      setShowtimes(rows);
      // Normalizar metadata
      const total = responseData?.count ?? responseData?.total ?? responseData?.metadata?.total ?? 0;
      const per_page = metadata.per_page;
      const current_page = currentPage;
      const total_pages = Math.max(1, Math.ceil(total / per_page));

      setMetadata({
        total,
        per_page,
        current_page,
        total_pages,
        next_page: current_page < total_pages ? current_page + 1 : null,
        prev_page: current_page > 1 ? current_page - 1 : null
      });
    } catch (error) {
      console.error("Error en fetchShowtimes:", error);
      toast.error("Error al sincronizar el cuadrante de funciones");
      setShowtimes([]);
      setMetadata({
        total: 0,
        per_page: metadata.per_page,
        current_page: 1,
        total_pages: 1,
        next_page: null,
        prev_page: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto secundario: Monitorea mutaciones en los filtros cronológicos y paginación para re-ejecutar queries
  useEffect(() => {
    if (cinemaId) {
      fetchShowtimes();
    }
  }, [currentPage, cinemaId, filterType, startDate, endDate]);

  // Efecto de reseteo: Retorna a la página inicial ante variaciones en filtros estructurales o búsquedas
  useEffect(() => {
    setCurrentPage(1);
  }, [cinemaId, search, filterType]);

const filteredShowtimes = Array.isArray(showtimes)
    ? showtimes.filter((s) => {
        const searchLower = search.toLowerCase();
        
        // Extraer títulos previniendo valores nulos
        const movieTitle = s.movie?.title?.toLowerCase() || "";
        const eventTitle = s.special_event?.title?.toLowerCase() || s.specialEvent?.title?.toLowerCase() || "";
        const roomName = s.room?.name?.toLowerCase() || "";

        return (
          movieTitle.includes(searchLower) ||
          eventTitle.includes(searchLower) ||
          roomName.includes(searchLower)
        );
      })
    : [];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= metadata.total_pages) {
      setCurrentPage(newPage);
    }
  };

  // Handlers para la apertura de modales basados en polimorfismo de useModal
  const handleEditClick = (showtime) => openModal("form", showtime, "showtime");
  const handleDeleteClick = (showtime) => openModal("delete", showtime, "showtime");

  /**
   * Callback de cierre para el formulario de mutación (Creación/Edición).
   * Si requiere recarga, destruye el índice actual y sincroniza con el servidor.
   */
  const handleFormClose = (shouldRefresh, customMessage) => {
    closeModal();
    if (shouldRefresh === true) {
      setCurrentPage(1);
      fetchShowtimes(1); 
      openModal("success", {
        title: "Programación Actualizada",
        message: customMessage || "La función ha sido configurada exitosamente.",
        onConfirm: () => closeModal()
      }, "showtime");
    }
  };

  /**
   * Ejecuta la persistencia de datos (Crear o Actualizar) invocada desde el Modal.
   */
  const handleSave = async (responseData) => {
    showLoader();
    try {
      if (responseData.id) {
        await updateShowtime(responseData.id, responseData);
        handleFormClose(true, "Los cambios en la programación se guardaron correctamente.");
      } else {
        await createByCinema(cinemaId, responseData);
        handleFormClose(true, "La nueva función ha sido añadida al calendario del cine.");
      }
    } catch (error) {
      console.error("Error al guardar función:", error);
      const errorMessage = error.response?.data?.message || "Error al procesar la operación en el servidor";
      toast.error(errorMessage);
    } finally {
      hideLoader();
    }
  };

  /**
   * Procesa la baja lógica o física del registro a través del API Service.
   * Implementa bloqueo global de UI mediante LoadingContext para prevenir concurrencia destructiva.
   */
  const handleConfirmDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      await deleteShowtime(modal.data.id);
      closeModal();
      await fetchShowtimes(currentPage); 
      openModal("success", {
        title: "Función Cancelada",
        message: "La función programada ha sido cancelada correctamente.",
        onConfirm: () => closeModal()
      }, "showtime");
    } catch (error) {
      console.error("Error en handleConfirmDelete:", error);
      const errorMessage = error.response?.data?.message || "No se pudo cancelar la función del servidor";
      toast.error(errorMessage);
    } finally {
      hideLoader();
    }
  };

  // Banderas booleanas de control semántico para evitar colisiones entre modales de distintas entidades
  const isShowtimeContext = modal.context === "showtime" || modal.type === "showtimeModal";
  const isFormOpen = modal.isOpen && (modal.type === "showtimeModal" || modal.type === "form") && isShowtimeContext;
  const isDeleteOpen = modal.isOpen && modal.type === "delete" && isShowtimeContext;
  const isSuccessOpen = modal.isOpen && modal.type === "success" && isShowtimeContext;

 
  if (!cinemaId) {
    return (
      <div className="text-center py-20 border border-dashed border-gray-200 bg-slate-50/50 rounded-cineflix p-6 animate-fade-in font-montserrat">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">No se ha seleccionado ninguna sucursal</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Por favor, selecciona un complejo de cines en el menú superior para desplegar y auditar el cuadrante horario operativo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Controles de segmentación cronológica */}
      <div className="grid grid-cols-1 md:flex md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
          
          <SelectForm
            label="Periodo Operativo"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-72"
          >
            <option value="future">Ver funciones futuras</option>
            <option value="all">Ver todo el historial</option>
          </SelectForm>

          {/* Renderizado condicional basado en cortocircuito lóbico AND para el modo por rango */}
          {filterType === "all" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-left-2 duration-200">
              
              <div className="relative w-full sm:w-40 h-14 bg-white border border-slate-200 rounded-2xl px-4 flex flex-col justify-center">
                <span className="absolute top-0 left-3 px-1 text-[10px] -translate-y-1/2 bg-white font-black text-brand-primary uppercase tracking-widest">
                  Desde
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer mt-1"
                />
              </div>

              <div className="relative w-full sm:w-40 h-14 bg-white border border-slate-200 rounded-2xl px-4 flex flex-col justify-center">
                <span className="absolute top-0 left-3 px-1 text-[10px] -translate-y-1/2 bg-white font-black text-brand-primary uppercase tracking-widest">
                  Hasta
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer mt-1"
                />
              </div>

            </div>
          )}
        </div>
      </div>

      <ShowtimesTab 
        data={filteredShowtimes} 
        isLoading={loading} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteClick} 
      />

      {!loading && (
        <CustomPagination 
          metadata={metadata} 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
        />
      )}

      <ShowtimeModal 
      open={isFormOpen} 
      onClose={handleFormClose} 
      onSave={handleSave}
      cinemaId={cinemaId}
      projectionTypes={catalogs.projectionTypes}
      languagesList={catalogs.languages} 
      currenciesList={catalogs.currencies} 
      initialData={modal.data} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={closeModal} 
        onConfirm={handleConfirmDelete} 
        itemName={`la función de "${
          modal.data?.movie?.title || 
          modal.data?.special_event?.title || 
          modal.data?.specialEvent?.title || 
          "Evento Especial"
        }"`} 
      />
      
      <SuccessModal 
      isOpen={isSuccessOpen} 
      onClose={closeModal} 
      title={modal.data?.title}
      message={modal.data?.message} 
      onConfirm={modal.data?.onConfirm} 
      />
    </div>
  );
}