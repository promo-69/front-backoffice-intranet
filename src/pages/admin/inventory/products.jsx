import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getMyInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryByCinema,
} from "../../../services/inventory.service";
import { getCatalogRecords } from "../../../services/catalog.service";
import { concessionsService } from "../../../services/concessions.service";
import ProductSearchBar from "../../../components/admin/inventory/ProductSearchBar";
import ProductTable from "../../../components/admin/inventory/ProductTable";
import ProductModal from "../../../components/admin/inventory/ProductModal";
import BranchInventoryTable from "../../../components/admin/inventory/BranchInventoryTable";
import ComboTable from "../../../components/admin/inventory/ComboTable";
import ComboModal from "../../../components/admin/inventory/ComboModal";
import CinemaSelector from "../../../components/admin/inventory/CinemaSelector";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { useLoading } from "../../../context/LoadingContext";

const ProductsPage = () => {
  const { showLoader, hideLoader } = useLoading();

  // Gestión de Pestañas
  const [activeTab, setActiveTab] = useState("products"); // "products", "byBranch", o "combos"
  const tabs = [
    { id: "products", label: "Productos de Dulcería" },
    { id: "byBranch", label: "Producto por Sucursal" },
    { id: "combos", label: "Combos por Sucursal" },
  ];

  // Catálogos
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cinemasLoading, setCinemasLoading] = useState(true);

  // Pestaña 1: Productos Generales
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Pestaña 2: Inventario por Sucursal
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [cinemaInventory, setCinemaInventory] = useState([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  // Pestaña 3: Combos por Sucursal
  const [combos, setCombos] = useState([]);
  const [comboSearchTerm, setComboSearchTerm] = useState("");
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState(null);
  const [isComboDeleteModalOpen, setIsComboDeleteModalOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState(null);

  // Modales Compartidos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: "",
    message: "",
  });

  const fetchCatalogs = async () => {
    try {
      const catRes = await getCatalogRecords("product-categories").catch(() => null);
      if (catRes) {
        setCategories(catRes?.data ?? catRes ?? []);
      }

      const curRes = await getCatalogRecords("currencies").catch(() => null);
      if (curRes) {
        setCurrencies(curRes?.data ?? curRes ?? []);
      }

      setCinemasLoading(true);
      const cinemasRes = await getCatalogRecords("cinemas").catch(() => null);
      if (cinemasRes) {
        const cinemasList = cinemasRes?.data ?? cinemasRes ?? [];
        setCinemas(cinemasList);
        // Auto-select the first cinema so inventory loads immediately
        if (cinemasList.length > 0) {
          setSelectedCinemaId((prev) => prev || String(cinemasList[0].id));
        }
      }

      const prodRes = await concessionsService.getProducts().catch(() => null);
      if (prodRes) {
        setAllProducts(prodRes);
      }
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    } finally {
      setCinemasLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      showLoader();
      const response = await getMyInventory({ page: currentPage, limit: metadata.per_page });
      const list = response?.data ?? [];
      setProducts(list);
      if (response?.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
    } finally {
      hideLoader();
    }
  };

  const fetchCinemaInventory = async () => {
    if (!selectedCinemaId) {
      setCinemaInventory([]);
      return;
    }
    try {
      showLoader();
      const response = await getInventoryByCinema(selectedCinemaId);
      console.log("[Inventario] Raw response:", response);
      // The backend returns: { count, rows } or wrapped in { data: { count, rows } }
      // or { success, data: [...] } — handle all shapes
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.rows)) {
        list = response.rows;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.data?.rows)) {
        list = response.data.rows;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      } else if (Array.isArray(response?.data?.data?.rows)) {
        list = response.data.data.rows;
      }
      console.log("[Inventario] Lista extraída:", list);
      setCinemaInventory(list);
    } catch (error) {
      console.error("Error al cargar inventario de sucursal:", error);
      const status = error?.response?.status;
      if (status === 403 || status === 401) {
        toast.error("Sin permisos para ver el inventario de esta sucursal.");
      } else if (status === 404) {
        toast.error("Sucursal no encontrada.");
      } else {
        toast.error("Error al cargar el inventario. Revisa la consola para más detalles.");
      }
      setCinemaInventory([]);
    } finally {
      hideLoader();
    }
  };

  const fetchCombos = async () => {
    try {
      showLoader();
      // Si hay una sucursal seleccionada, traer los disponibles de esa sucursal, sino traer todos
      const list = selectedCinemaId
        ? await concessionsService.getAvailableCombos(selectedCinemaId)
        : await concessionsService.getCombos();
      setCombos(list);
    } catch (error) {
      console.error("Error al cargar combos:", error);
      setCombos([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    if (activeTab === "byBranch") {
      fetchCinemaInventory();
    }
  }, [selectedCinemaId, activeTab]);

  useEffect(() => {
    if (activeTab === "combos") {
      fetchCombos();
    }
  }, [selectedCinemaId, activeTab]);

  // Manejo de Producto Modal
  const handleOpenEditModal = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchProducts();
      setSuccessConfig({
        title: productToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: productToEdit
          ? "La información del producto ha sido actualizada."
          : "El nuevo producto ha sido registrado en el sistema.",
      });
      setIsSuccessOpen(true);
    }
    setProductToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteInventoryItem(itemToDelete.id);

      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Producto Eliminado!",
        message: `Se ha removido "${itemToDelete.name}" exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const handleSaveProduct = async (payload) => {
    const id = payload.get("id");
    if (id) {
      await updateInventoryItem(id, payload);
    } else {
      await createInventoryItem(payload);
    }
  };

  // Manejo de Combos Modal
  const handleOpenEditComboModal = async (combo) => {
    try {
      showLoader();
      const fullCombo = await concessionsService.getComboById(combo.id);
      setComboToEdit(fullCombo);
      setIsComboModalOpen(true);
    } catch (error) {
      console.error("Error al cargar detalles del combo:", error);
      toast.error("No se pudieron cargar los detalles del combo.");
    } finally {
      hideLoader();
    }
  };

  const handleCloseComboModal = (shouldRefresh) => {
    setIsComboModalOpen(false);
    if (shouldRefresh) {
      fetchCombos();
      setSuccessConfig({
        title: comboToEdit ? "¡Combo Guardado!" : "¡Registro Exitoso!",
        message: comboToEdit
          ? "El combo ha sido actualizado exitosamente."
          : "El nuevo combo ha sido registrado en el sistema.",
      });
      setIsSuccessOpen(true);
    }
    setComboToEdit(null);
  };

  const handleConfirmDeleteCombo = async () => {
    try {
      showLoader();
      await concessionsService.deleteCombo(comboToDelete.id);
      setIsComboDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Combo Eliminado!",
        message: `Se ha removido "${comboToDelete.name}" exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchCombos();
    } catch (error) {
      console.error("Error al eliminar combo:", error);
    } finally {
      setComboToDelete(null);
      hideLoader();
    }
  };

  const handleSaveCombo = async (payload) => {
    const id = payload.get("id");
    if (id) {
      await concessionsService.updateCombo(id, payload);
    } else {
      await concessionsService.createCombo(payload);
    }
  };

  const handleAdjustStock = (item) => {
    const productName = item._Products?.name || item.product?.name || "Producto";
    toast.info(`Ajuste de stock para "${productName}" (Simulación Visual)`);
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = cinemaInventory.filter((item) => {
    const productName = item._Products?.name || item.product?.name || "";
    return productName.toLowerCase().includes(inventorySearchTerm.toLowerCase());
  });

  const filteredCombos = combos.filter((c) =>
    c.name?.toLowerCase().includes(comboSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-montserrat font-bold text-brand-primary">
              {activeTab === "products"
                ? "Productos de Dulcería"
                : activeTab === "byBranch"
                  ? "Inventario por Sucursal"
                  : "Combos Promocionales"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTab === "products"
              ? "Administra los productos globales de la dulcería. Puedes agregar, editar o eliminar productos."
              : activeTab === "byBranch"
                ? "Consulta y ajusta el stock disponible de productos de dulcería según la sucursal seleccionada."
                : "Administra los combos y promociones especiales configurados por sucursal."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Sucursal para Inventario y Combos */}
          {activeTab !== "products" && (
            <CinemaSelector
              cinemas={cinemas}
              value={selectedCinemaId}
              onChange={setSelectedCinemaId}
              showAll={activeTab === "combos"}
              loading={cinemasLoading}
            />
          )}

          {/* Botones de acción y barras de búsqueda dinámicas */}
          {activeTab === "products" ? (
            <ProductSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddClick={() => {
                setProductToEdit(null);
                setIsModalOpen(true);
              }}
            />
          ) : activeTab === "byBranch" ? (
            <input
              type="text"
              placeholder="Buscar en inventario..."
              value={inventorySearchTerm}
              onChange={(e) => setInventorySearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all w-60"
            />
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar combo..."
                value={comboSearchTerm}
                onChange={(e) => setComboSearchTerm(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all w-60"
              />
              <button
                onClick={() => {
                  setComboToEdit(null);
                  setIsComboModalOpen(true);
                }}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
                Añadir Combo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <div className="flex gap-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`text-xs font-montserrat uppercase tracking-wide pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
                ? "font-bold text-brand-gold border-brand-gold"
                : "text-muted-foreground border-transparent hover:text-brand-primary"
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DINÁMICO DE PESTAÑAS */}
      <div className="transition-all duration-200">
        {activeTab === "products" ? (
          <>
            <ProductTable
              data={filteredProducts}
              categories={categories}
              currencies={currencies}
              onEdit={handleOpenEditModal}
              onDelete={(id) => {
                const product = products.find((p) => p.id === id);
                setItemToDelete(product);
                setIsDeleteModalOpen(true);
              }}
            />

            {/* Paginación de Productos */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm mt-4">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!metadata.prev_page}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!metadata.next_page}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {metadata.total > 0
                        ? (currentPage - 1) * metadata.per_page + 1
                        : 0}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * metadata.per_page, metadata.total)}
                    </span>{" "}
                    de <span className="font-medium">{metadata.total}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(metadata.prev_page)}
                      disabled={!metadata.prev_page}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-brand-primary border border-gray-300 bg-white">
                      Página {metadata.current_page} de {metadata.total_pages}
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
        ) : activeTab === "byBranch" ? (
          <BranchInventoryTable
            data={filteredInventory}
            onAdjustStock={handleAdjustStock}
            categories={categories}
            currencies={currencies}
            selectedCinemaId={selectedCinemaId}
          />
        ) : (
          <ComboTable
            data={filteredCombos}
            onEdit={handleOpenEditComboModal}
            onDelete={(id) => {
              const combo = combos.find((c) => c.id === id);
              setComboToDelete(combo);
              setIsComboDeleteModalOpen(true);
            }}
            cinemas={cinemas}
            currencies={currencies}
          />
        )}
      </div>

      {/* Modal Eliminar Producto */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
      />

      {/* Modal Eliminar Combo */}
      <DeleteConfirmModal
        isOpen={isComboDeleteModalOpen}
        onClose={() => setIsComboDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteCombo}
        itemName={comboToDelete?.name}
      />

      {/* Modal de Alertas/Exito */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />

      {/* Modal Formulario de Producto */}
      <ProductModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={productToEdit}
        categories={categories}
        currencies={currencies}
        onSave={handleSaveProduct}
      />

      {/* Modal Formulario de Combo */}
      <ComboModal
        open={isComboModalOpen}
        onClose={handleCloseComboModal}
        initialData={comboToEdit}
        products={allProducts}
        currencies={currencies}
        onSave={handleSaveCombo}
      />
    </div>
  );
};

export default ProductsPage;
