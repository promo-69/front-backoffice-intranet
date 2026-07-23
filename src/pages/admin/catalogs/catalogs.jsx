import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/dropdown-menu";
import { getAvailableCatalogs, getCatalogRecords, deleteCatalogRecord, getCatalogMetadata } from "../../../services/catalog.service";
import CatalogSearchBar from "../../../components/admin/catalogs/CatalogSearchBar";
import CatalogTable from "../../../components/admin/catalogs/CatalogTable";
import CatalogModal from "../../../components/admin/catalogs/CatalogModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { useLoading } from "../../../context/LoadingContext";

// Diccionario de traducción para los catálogos que vienen en inglés desde la API
const CATALOG_TRANSLATIONS = {
  "actions": "Maestros",
  "age-classifications": "Clasificaciones por Edad",
  "audience-categories": "Categorías de Audiencia",
  "booking-types": "Tipos de Reserva",
  "cinemas": "Sucursales",
  "currencies": "Monedas",
  "customers": "Clientes",
  "employee-positions": "Cargos de Empleados",
  "employees": "Empleados",
  "genres": "Géneros",
  "genders": "Género",
  "job-positions": "Puestos de Trabajo",
  "languages": "Idiomas",
  "line-types": "Tipos de Línea",
  "loyalty-levels": "Niveles de Fidelidad",
  "modifier-scopes": "Alcances de Modificadores",
  "movie-lifecycle-states": "Estados de Película",
  "operation-types": "Tipos de Operación",
  "order-statuses": "Estados de Pedido",
  "payment-methods": "Métodos de Pago",
  "permission-types": "Tipos de Permiso",
  "product-categories": "Categorías de Producto",
  "projection-types": "Tipos de Proyección",
  "resources": "Recursos",
  "room-types": "Tipos de Sala",
  "seat-categories": "Categorías de Asientos",
  "seat-conditions": "Condición de Asiento",
  "user-types": "Tipos de Usuario",
  "week-days": "Días de la Semana",
};

// Lista blanca de catálogos que queremos mostrar
const CATALOG_WHITELIST = [
  "actions",
  "age-classifications",
  "audience-categories",
  "product-categories",
  "currencies",
  "customers",
  "employee-positions",
  "employees",
];

const CatalogsPage = () => {
  const { showLoader, hideLoader } = useLoading();

  const [availableCatalogs, setAvailableCatalogs] = useState(["actions", "product-categories"]);
  const [availablePage, setAvailablePage] = useState(1);
  const [availableMetadata, setAvailableMetadata] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState("actions");
  const [catalogs, setCatalogs] = useState([]);
  const [catalogMetadata, setCatalogMetadata] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogToEdit, setCatalogToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  // Cargar lista de catálogos disponibles al iniciar
  const fetchedAvailableRef = React.useRef(false);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await getAvailableCatalogs(1);
        // La API puede devolver { data: [...] } o simplemente [...]
        let list = res.data || res;
        const metadata = res.metadata || null;
        setAvailableMetadata(metadata);

        // Normalizar como array de nombres (strings)
        const names = list.map(c => (typeof c === "string" ? c : c.name)).filter(Boolean);
        // Normalizar como array de nombres (strings) (no whitelist)

        // Mezclar con "actions" y "product-categories" precargados sin duplicar
        setAvailableCatalogs(prev => {
          const existing = new Set(prev.map(c => (typeof c === "string" ? c : c.name)));
          const newItems = names.filter(name => !existing.has(name));
          return [...prev, ...newItems];
        });
        setAvailablePage(1);
      } catch (error) {
        console.error("Error al cargar catálogos disponibles:", error);
      }
    };
    // Evitar llamadas duplicadas (React StrictMode monta dos veces en dev)
    if (!fetchedAvailableRef.current) {
      fetchedAvailableRef.current = true;
      fetchAvailable();
    }
  }, []);

  const loadMoreAvailable = async () => {
    try {
      const nextPage = (availablePage || 1) + 1;
      const res = await getAvailableCatalogs(nextPage);
      let list = res.data || res;
      const metadata = res.metadata || null;
      setAvailableMetadata(metadata);

      // Normalizar como array de nombres (strings) (no whitelist)
      const names = list.map(c => (typeof c === "string" ? c : c.name)).filter(Boolean);

      setAvailableCatalogs(prev => {
        const existing = new Set(prev.map(c => (typeof c === "string" ? c : c.name)));
        const newItems = names.filter(name => !existing.has(name));
        return [...prev, ...newItems];
      });

      setAvailablePage(nextPage);
    } catch (error) {
      console.error("Error cargando más catálogos:", error);
    }
  };

  const fetchCatalogs = async (page = 1) => {
    if (!selectedCatalog || selectedCatalog === "actions") {
      setCatalogs([]);
      return;
    }
    try {
      showLoader();
      // Obtenemos los campos dinámicos que necesita este catálogo
      const meta = await getCatalogMetadata(selectedCatalog);
      setCatalogMetadata(meta.data);

      const data = await getCatalogRecords(selectedCatalog, page);
      setCatalogs(data.data || []);
      setMetadata(data.metadata || { total: 0, per_page: 10, current_page: 1, total_pages: 1 });
    } catch (error) {
      console.error("Error al cargar registros del catalogo:", error);
      setCatalogs([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchCatalogs(currentPage);
  }, [currentPage, selectedCatalog]);

  const handleOpenEditModal = (catalog) => {
    setCatalogToEdit(catalog);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchCatalogs(currentPage);
      setSuccessConfig({
        title: catalogToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: catalogToEdit
          ? "La información del maestro ha sido actualizada."
          : "El nuevo maestro ha sido incorporado al sistema."
      });
      setIsSuccessOpen(true);
    }
    setCatalogToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteCatalogRecord(selectedCatalog, itemToDelete.id);
      if (selectedId === itemToDelete.id) setSelectedId(null);

      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Maestro Eliminado!",
        message: `Se ha removido "${itemToDelete?.name || itemToDelete?.description || itemToDelete?.code || 'el registro'}" exitosamente.`
      });
      setIsSuccessOpen(true);
      fetchCatalogs(currentPage);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const filteredCatalogs = catalogs.filter((c) => {
    if (!searchTerm) return true;
    // Buscar el término en cualquier campo del registro (id, description, code, etc.)
    return Object.values(c).some(val =>
      val !== null && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de Maestros
          </h3>
          <p className="text-xs text-muted-foreground">
            Selecciona un catálogo para administrar sus registros.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-[320px] flex items-center justify-between border border-gray-200 rounded-lg p-2 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white text-brand-primary font-semibold capitalize">
                  <span>
                    {(() => {
                      const val = selectedCatalog;
                      const autoLabel = val ? val.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "";
                      return CATALOG_TRANSLATIONS[val?.toLowerCase()] || autoLabel;
                    })()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[320px] max-h-64 bg-white text-brand-primary border border-gray-200 shadow-sm rounded-lg p-1">
                {availableCatalogs.map((cat, idx) => {
                  const val = typeof cat === "string" ? cat : cat.name;
                  const autoLabel = val ? val.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "";
                  const label = CATALOG_TRANSLATIONS[val?.toLowerCase()] || autoLabel;
                  return (
                    <DropdownMenuItem
                      key={idx}
                      onSelect={() => {
                        setSelectedCatalog(val);
                        setCurrentPage(1);
                      }}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}

                <div className="px-2 py-2 border-t">
                  {(() => {
                    const canLoadMore = availableMetadata
                      ? (availableMetadata.next_page || (availableMetadata.current_page && availableMetadata.total_pages && availableMetadata.current_page < availableMetadata.total_pages))
                      : (availableCatalogs.length >= 10);
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadMoreAvailable();
                        }}
                        disabled={!canLoadMore}
                        className="w-full text-left text-sm px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cargar más...
                      </button>
                    );
                  })()}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CatalogSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={() => { setCatalogToEdit(null); setIsModalOpen(true); }}
            disabled={!selectedCatalog || selectedCatalog === "actions"}
          />
        </div>
      </div>

      {selectedCatalog && selectedCatalog !== "actions" ? (
        <>
          <CatalogTable
            data={filteredCatalogs}
            metadata={catalogMetadata}
            selectedId={selectedId}
            onSelectCatalog={(id) => setSelectedId(id)}
            onEdit={handleOpenEditModal}
            onDelete={(id) => {
              const catalog = catalogs.find(c => c.id === id);
              setItemToDelete(catalog);
              setIsDeleteModalOpen(true);
            }}
          />

          {/* CONTROLES DE PAGINACIÓN */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!metadata.prev_page}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!metadata.next_page}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * metadata.per_page + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * metadata.per_page, metadata.total)}
                  </span>{" "}
                  de <span className="font-medium">{metadata.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(metadata.prev_page)}
                    disabled={!metadata.prev_page}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">
                    Página {metadata.current_page} de {metadata.total_pages || 1}
                  </div>

                  <button
                    onClick={() => setCurrentPage(metadata.next_page)}
                    disabled={!metadata.next_page}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 mt-6">
          <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[11px] tracking-[0.2em] leading-relaxed">
            Selecciona un catálogo en el menú de arriba para visualizar y administrar sus registros.
          </p>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />

      <CatalogModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={catalogToEdit}
        selectedCatalog={selectedCatalog}
        metadata={catalogMetadata}
      />
    </div>
  );
};

export default CatalogsPage;
