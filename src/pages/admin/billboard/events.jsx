import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { useLoading } from "@/context/LoadingContext"; 
import { getEvents, deleteEvent } from "@/services/events.service";
import { EventsTab } from "@/components/admin/billboard/events/EventsTab"; 
import EventModal from "@/components/admin/billboard/events/EventModal"; 
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { toast } from "sonner";

export default function Events({ catalogs, search, modal, openModal, closeModal }) {
  const [loading, setIsLoading] = useState(false);
  const { showLoader, hideLoader } = useLoading();
 
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState({
    total: 0, per_page: 10, current_page: 1, total_pages: 1, next_page: null, prev_page: null
  });

  const fetchEvents = async (pageToFetch) => {
    setIsLoading(true); 
    try {
      const res = await getEvents({ page: pageToFetch || currentPage });
      // Manejo seguro por si la API responde con .rows o array plano
      const rawData = res.data?.rows || res.data || [];
      setEvents(rawData);
      
      setMetadata(res.metadata || {
        total: rawData.length, per_page: 10, current_page: 1, total_pages: Math.ceil(rawData.length / 10), next_page: null, prev_page: null
      });
    } catch (error) {
      console.error("Error cargando eventos especiales:", error);
      toast.error("Error al sincronizar catálogo de eventos especiales");
      setEvents([]);
    } finally {
      setIsLoading(false); 
    }
  };

  // Escucha del índice de paginación activa
  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  // Si cambia el criterio de búsqueda superior, vuelve a la primera página
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filtrado reactivo al buscador principal (evalúa título o nombre de evento)
  const filteredEvents = events.filter((e) =>
    (e.title || e.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= metadata.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditClick = (eventItem) => openModal("form", eventItem, "event");
  const handleDeleteClick = (eventItem) => openModal("delete", eventItem, "event");

  // Sincronización del cierre y mutación del formulario
  const handleFormClose = (shouldRefresh, customMessage) => {
    closeModal();
    if (shouldRefresh) {
      setCurrentPage(1);
      fetchEvents(1); 
      openModal("success", {
        title: "Registro de Eventos",
        message: customMessage || "Los datos de la función especial se configuraron con éxito.",
        onConfirm: () => closeModal()
      }, "event");
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.data?.id) return;
    showLoader();
    try {
      await deleteEvent(modal.data.id);
      closeModal();
      await fetchEvents(currentPage); 

      openModal("success", {
        title: "Evento Removido",
        message: `"${modal.data?.title || modal.data?.name}" ha sido removido del catálogo correctamente.`,
        onConfirm: () => closeModal()
      }, "event");
    } catch (error) {
      console.error("Error eliminando evento:", error);
      const errorMessage = error.response?.data?.message || "No se pudo dar de baja el evento en el servidor";
      toast.error(errorMessage);
    } finally {
      hideLoader();
    }
  };

  // Contextualización para evitar interferencias visuales con los modales de películas
  const isEventContext = modal.context === "event" || modal.type === "eventModal";
  const isFormOpen = modal.isOpen && (modal.type === "eventModal" || modal.type === "form") && isEventContext;
  const isDeleteOpen = modal.isOpen && modal.type === "delete" && isEventContext;
  const isSuccessOpen = modal.isOpen && modal.type === "success" && isEventContext;

  return (
    <div className="space-y-6">
      <EventsTab 
        data={filteredEvents} 
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

      {/* MODAL DE FORMULARIO DE EVENTOS */}
      <EventModal 
        open={isFormOpen} 
        onClose={() => handleFormClose(false)} 
        onSuccess={(msg) => handleFormClose(true, msg)} 
        currenciesList={catalogs.currencies} // Por si requiere monedas u otros diccionarios del padre
        initialData={modal.data} 
      />

      {/* MODAL DE CONFIRMACIÓN DE BAJA */}
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={closeModal} 
        onConfirm={handleConfirmDelete} 
        itemName={modal.data?.title || modal.data?.name} 
      />

      {/* MODAL DE ÉXITO */}
      <SuccessModal 
        isOpen={isSuccessOpen}
        onClose={closeModal}
        title={modal.data?.title || "Operación Exitosa"}
        message={modal.data?.message}
        onConfirm={modal.data?.onConfirm}
      />
    </div>
  );
}