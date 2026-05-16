import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts } from "../../../services/product.service";
import {
  initLocalStore,
  getProductCategories,
  getCurrencies,
  getConcessionProducts,
  deleteConcessionProduct,
} from "../../../services/localStore.service";
import ProductSearchBar from "../../../components/admin/inventory/ProductSearchBar";
import ProductTable from "../../../components/admin/inventory/ProductTable";
import ProductModal from "../../../components/admin/inventory/ProductModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { useLoading } from "../../../context/LoadingContext";

const ProductsPage = () => {
  const { showLoader, hideLoader } = useLoading();

  // ESTADOS DE DATOS Y PAGINACIÓN
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // CATÁLOGOS (para los selects del modal y las labels de la tabla)
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // ESTADOS DE PAGINACIÓN
  const [metadata, setMetadata] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // ESTADOS DE MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: "",
    message: "",
  });

  // Cargar catálogos al montar
  const fetchCatalogs = () => {
    try {
      initLocalStore();
      setCategories(getProductCategories());
      setCurrencies(getCurrencies());
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    }
  };

  const fetchProducts = () => {
    try {
      showLoader();
      initLocalStore();
      const data = getConcessionProducts();
      setProducts(data);
      // Falso metadata para paginación
      setMetadata({
        total: data.length,
        per_page: data.length || 10,
        current_page: 1,
        total_pages: 1,
        next_page: null,
        prev_page: null,
      });
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
    } finally {
      hideLoader();
    }
  };

  // Cargar catálogos al montar
  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Efecto que reacciona al cambio de página
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // MANEJO DE EDICIÓN
  const handleOpenEditModal = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchProducts(currentPage);
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

  const handleConfirmDelete = () => {
    try {
      showLoader();
      deleteConcessionProduct(itemToDelete.id);

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

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER Y BÚSQUEDA */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-montserrat font-bold text-brand-primary">
              Productos de Dulcería
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Administra los productos de la dulcería. Puedes agregar, editar o
            eliminar productos según sea necesario.
          </p>
        </div>
        <ProductSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* TABLA DE DATOS */}
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

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-xl shadow-sm">
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

      {/* MODALES DE INTERACCIÓN */}
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

      <ProductModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={productToEdit}
        categories={categories}
        currencies={currencies}
      />
    </div>
  );
};

export default ProductsPage;
