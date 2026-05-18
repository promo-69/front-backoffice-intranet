import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  "cinemas": "Sucursales",
  "product-categories": "Categorías de Producto",
  "currencies": "Monedas",
  "customers": "Clientes",
  "employee-positions": "Cargos de Empleados",
  "employees": "Empleados",
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
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await getAvailableCatalogs();
        // La API puede devolver { data: [...] } o simplemente [...]
        let list = res.data || res;

        // Filtrar los catálogos usando la lista blanca (WHITELIST)
        list = list.filter(cat => {
          const val = typeof cat === "string" ? cat : cat.name;
          return CATALOG_WHITELIST.includes(val);
        });

        // Mezclar con "actions" y "product-categories" precargados sin duplicar
        setAvailableCatalogs(prev => {
          const existing = new Set(prev.map(c => typeof c === "string" ? c : c.name));
          const newItems = list.filter(c => {
            const val = typeof c === "string" ? c : c.name;
            return !existing.has(val);
          });
          return [...prev, ...newItems];
        });
      } catch (error) {
        console.error("Error al cargar catálogos disponibles:", error);
      }
    };
    fetchAvailable();
  }, []);

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
          <select
            value={selectedCatalog}
            onChange={(e) => {
              setSelectedCatalog(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-gray-50 text-brand-primary font-semibold capitalize"
          >
            {availableCatalogs.map((cat, idx) => {
              const val = typeof cat === "string" ? cat : cat.name;

              // Generar un label bonito por si no está en el diccionario (ej: "movie-genres" -> "Movie Genres")
              const autoLabel = val
                ? val.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
                : "";

              // Si tenemos traducción la usamos, si no, mostramos el valor arreglado
              const label = CATALOG_TRANSLATIONS[val?.toLowerCase()] || autoLabel;

              return <option key={idx} value={val}>{label}</option>
            })}
          </select>

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
