import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductSearchBar from "../../../components/admin/inventory/ProductSearchBar";
import CategoryTable from "../../../components/admin/inventory/CategoryTable";
import CategoryModal from "../../../components/admin/inventory/CategoryModal";
import DeleteConfirmModal from "../../../components/ui/DialogConfirmModal";
import SuccessModal from "../../../components/ui/SuccessModal";
import { useLoading } from "../../../context/LoadingContext";
import {
  getCatalogRecords,
  createCatalogRecord,
  updateCatalogRecord,
  deleteCatalogRecord,
} from "../../../services/catalog.service";

const CATALOG_NAME = "product-categories";

const CategoriesPage = () => {
  const { showLoader, hideLoader } = useLoading();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchCategories = async () => {
    try {
      showLoader();
      const response = await getCatalogRecords(CATALOG_NAME);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenEditModal = (category) => {
    setItemToEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchCategories();
      setSuccessConfig({
        title: itemToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: itemToEdit
          ? "La categoría ha sido actualizada."
          : "La nueva categoría ha sido registrada.",
      });
      setIsSuccessOpen(true);
    }
    setItemToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteCatalogRecord(CATALOG_NAME, itemToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Categoría Eliminada!",
        message: `Se ha removido "${itemToDelete.name}" exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const handleSaveCategory = async (payload) => {
    if (payload.id) {
      await updateCatalogRecord(CATALOG_NAME, payload.id, payload);
    } else {
      await createCatalogRecord(CATALOG_NAME, payload);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER Y BÚSQUEDA */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-montserrat font-bold text-brand-primary">
              Categorías de Dulcería
            </h3>
            <Link 
              to="/admin/inventario" 
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-semibold transition-colors"
            >
              ← Volver a Productos
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Administra las categorías de los productos (Bebidas, Snacks, etc.)
          </p>
        </div>
        <ProductSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar categoría..."
          buttonText="NUEVA CATEGORÍA"
          onAddClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* TABLA DE DATOS */}
      <CategoryTable
        data={filteredCategories}
        onEdit={handleOpenEditModal}
        onDelete={(id) => {
          const category = categories.find((c) => c.id === id);
          setItemToDelete(category);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* MODALES */}
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

      <CategoryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={itemToEdit}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default CategoriesPage;
