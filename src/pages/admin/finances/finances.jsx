import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabsCustom } from "@/components/ui/TabsCustom";
import { useLoading } from "@/context/LoadingContext";

import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  getExchangeRates,
  createExchangeRate,
} from "@/services/rates.service";

import CurrencySearchBar from "@/components/admin/finances/currencies/CurrencySearchBar";
import CurrencyTable from "@/components/admin/finances/currencies/CurrencyTable";
import CurrencyModal from "@/components/admin/finances/currencies/CurrencyModal";

import RateSearchBar from "@/components/admin/finances/rates/RateSearchBar";
import RateTable from "@/components/admin/finances/rates/RateTable";
import RateModal from "@/components/admin/finances/rates/RateModal";

import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";

function CurrenciesTab() {
  const { showLoader, hideLoader } = useLoading();
  const [currencies, setCurrencies] = useState([]);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencyToEdit, setCurrencyToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchCurrenciesData = async () => {
    try {
      showLoader();
      const response = await getCurrencies({ page: currentPage, limit: metadata.per_page });
      const list = response?.data ?? [];
      setCurrencies(list);
      if (response?.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error("Error al cargar monedas:", error);
      setCurrencies([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchCurrenciesData();
  }, [currentPage]);

  const handleOpenEditModal = (currency) => {
    setCurrencyToEdit(currency);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchCurrenciesData();
      setSuccessConfig({
        title: currencyToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: currencyToEdit
          ? "La información de la moneda ha sido actualizada."
          : "La nueva moneda ha sido registrada.",
      });
      setIsSuccessOpen(true);
    }
    setCurrencyToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deleteCurrency(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Moneda Eliminada!",
        message: `Se ha removido la moneda exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchCurrenciesData();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const handleSaveCurrency = async (payload) => {
    if (payload.id) {
      await updateCurrency(payload.id, payload);
    } else {
      await createCurrency(payload);
    }
  };

  const handleToggleBase = async (currency, checked) => {
    // Evitar que el usuario quite la moneda base directamente
    if (currency.is_base_currency && !checked) {
      setSuccessConfig({
        title: "Acción no permitida",
        message: "No puedes remover el estado de moneda base directamente. Para cambiarla, debes habilitar otra moneda como base.",
      });
      setIsSuccessOpen(true);
      return;
    }

    try {
      showLoader();
      await updateCurrency(currency.id, { isBaseCurrency: checked });
      
      // Notificación visual de éxito (opcional)
      setSuccessConfig({
        title: "¡Configuración Actualizada!",
        message: `La moneda ${currency.code} ha sido ${checked ? 'marcada como' : 'removida de'} base.`,
      });
      setIsSuccessOpen(true);

      // Refrescamos los datos para asegurar que las demás monedas se actualicen correctamente si el backend maneja apagar las demás
      fetchCurrenciesData();
    } catch (error) {
      console.error("Error al actualizar moneda base:", error);
    } finally {
      hideLoader();
    }
  };

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Gestión de Monedas
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Administra las monedas disponibles para transacciones y tasas de cambio.
          </p>
        </div>
        <CurrencySearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => {
            setCurrencyToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <CurrencyTable
        data={filteredCurrencies}
        onEdit={handleOpenEditModal}
        onDelete={(id) => {
          const c = currencies.find((x) => x.id === id);
          setItemToDelete(c);
          setIsDeleteModalOpen(true);
        }}
        onToggleBase={handleToggleBase}
      />

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
                {metadata.total > 0 ? (currentPage - 1) * metadata.per_page + 1 : 0}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(currentPage * metadata.per_page, metadata.total)}
              </span>{" "}
              de <span className="font-medium">{metadata.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.description || itemToDelete?.code}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />
      <CurrencyModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={currencyToEdit}
        onSave={handleSaveCurrency}
      />
    </div>
  );
}

function RatesTab() {
  const { showLoader, hideLoader } = useLoading();
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchData = async () => {
    try {
      showLoader();
      // Obtenemos monedas para el select del modal y para renderizar la tabla
      const curRes = await getCurrencies({ page: 1, limit: 10 });
      setCurrencies(curRes?.data ?? []);

      // Obtenemos tasas
      const response = await getExchangeRates({ page: currentPage, limit: metadata.per_page });
      const list = response?.data ?? [];
      setRates(list);
      if (response?.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error("Error al cargar tasas:", error);
      setRates([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchData();
      setSuccessConfig({
        title: "¡Registro Exitoso!",
        message: "La nueva tasa de cambio ha sido registrada.",
      });
      setIsSuccessOpen(true);
    }
  };

  const handleSaveRate = async (payload) => {
    await createExchangeRate(payload);
  };

  // Filtrado local básico si se desea, aunque la paginación es de servidor
  const filteredRates = rates.filter((r) => {
    if (!searchTerm) return true;
    const curr = currencies.find((c) => c.id == (r.currency_id || r.currency));
    const label = curr ? `${curr.code} ${curr.description}` : "";
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Tasas de Cambio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Consulta y registra nuevas tasas de cambio del sistema.
          </p>
        </div>
        <RateSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => setIsModalOpen(true)}
        />
      </div>

      <RateTable data={filteredRates} currencies={currencies} />

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
                {metadata.total > 0 ? (currentPage - 1) * metadata.per_page + 1 : 0}
              </span>{" "}
              a{" "}
              <span className="font-medium">
                {Math.min(currentPage * metadata.per_page, metadata.total)}
              </span>{" "}
              de <span className="font-medium">{metadata.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm">
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

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />
      <RateModal
        open={isModalOpen}
        onClose={handleCloseModal}
        currencies={currencies}
        onSave={handleSaveRate}
      />
    </div>
  );
}

const FinancesPage = () => {
  const [activeTab, setActiveTab] = useState("currencies");

  const TABS = [
    { id: "currencies", label: "Monedas" },
    { id: "rates", label: "Tasas de Cambio" },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de pestañas */}
      <TabsCustom tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenido de la pestaña */}
      <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[500px]">
        {activeTab === "currencies" && <CurrenciesTab />}
        {activeTab === "rates" && <RatesTab />}
      </div>
    </div>
  );
};

export default FinancesPage;
