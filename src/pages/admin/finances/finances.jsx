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
import { usePermission } from "@/hooks/usePermission";
import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";
import { paymentsService } from "@/services/payments.service";
import { toast } from "sonner";

import BankAccountSearchBar from "@/components/admin/finances/bank-accounts/BankAccountSearchBar";
import BankAccountTable from "@/components/admin/finances/bank-accounts/BankAccountTable";
import BankAccountModal from "@/components/admin/finances/bank-accounts/BankAccountModal";

import PriceModifierSearchBar from "@/components/admin/finances/price-modifiers/PriceModifierSearchBar";
import PriceModifierTable from "@/components/admin/finances/price-modifiers/PriceModifierTable";
import PriceModifierModal from "@/components/admin/finances/price-modifiers/PriceModifierModal";
import {
  getPriceModifiers,
  createPriceModifier,
  updatePriceModifier,
  deletePriceModifier,
} from "@/services/price-modifiers.service";

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

function BankAccountsTab() {
  const { showLoader, hideLoader } = useLoading();
  const [accounts, setAccounts] = useState([]);
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
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchData = async () => {
    try {
      showLoader();
      const response = await paymentsService.getBankAccounts({ page: currentPage, limit: metadata.per_page });
      setAccounts(response?.data ?? []);
      if (response?.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error("Error al cargar cuentas bancarias:", error);
      setAccounts([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleOpenEditModal = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchData();
      setSuccessConfig({
        title: accountToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: accountToEdit
          ? "La información de la cuenta bancaria ha sido actualizada."
          : "La nueva cuenta bancaria ha sido registrada.",
      });
      setIsSuccessOpen(true);
    }
    setAccountToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await paymentsService.deleteBankAccount(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Cuenta Eliminada!",
        message: `Se ha eliminado la cuenta bancaria exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar cuenta bancaria:", error);
      const backendMessage = error.response?.data?.message || "Ocurrió un error al eliminar";
      toast.error(backendMessage);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const handleSaveAccount = async (payload) => {
    if (payload.id) {
      await paymentsService.updateBankAccount(payload.id, payload);
    } else {
      await paymentsService.createBankAccount(payload);
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const bankName = a._Banks?.name?.toLowerCase() || "";
    const currency = a._Currencies?.code?.toLowerCase() || "";
    return bankName.includes(search) || currency.includes(search);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Cuentas Bancarias
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Gestiona las cuentas bancarias para métodos de pago.
          </p>
        </div>
        <BankAccountSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => {
            setAccountToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <BankAccountTable
        data={filteredAccounts}
        onEdit={handleOpenEditModal}
        onDelete={(id) => {
          const acc = accounts.find((x) => x.id === id);
          setItemToDelete(acc);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Paginación simplificada */}
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
              Mostrando página <span className="font-medium">{metadata.current_page}</span> de <span className="font-medium">{metadata.total_pages}</span>
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
        itemName={`Cuenta de ${itemToDelete?._Banks?.name || 'Banco'}`}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />
      <BankAccountModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={accountToEdit}
        onSave={handleSaveAccount}
      />
    </div>
  );
}

function PriceModifiersTab() {
  const { showLoader, hideLoader } = useLoading();
  const [modifiers, setModifiers] = useState([]);
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
  const [modifierToEdit, setModifierToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successConfig, setSuccessConfig] = useState({ title: "", message: "" });

  const fetchModifiersData = async () => {
    try {
      showLoader();
      const response = await getPriceModifiers({ page: currentPage, limit: metadata.per_page });
      setModifiers(response?.data ?? []);
      if (response?.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error("Error al cargar modificadores:", error);
      setModifiers([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchModifiersData();
  }, [currentPage]);

  const handleOpenEditModal = (modifier) => {
    setModifierToEdit(modifier);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchModifiersData();
      setSuccessConfig({
        title: modifierToEdit ? "¡Cambios Guardados!" : "¡Registro Exitoso!",
        message: modifierToEdit
          ? "La información del modificador ha sido actualizada."
          : "El nuevo modificador ha sido registrado.",
      });
      setIsSuccessOpen(true);
    }
    setModifierToEdit(null);
  };

  const handleConfirmDelete = async () => {
    try {
      showLoader();
      await deletePriceModifier(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessConfig({
        title: "¡Modificador Eliminado!",
        message: `Se ha removido el modificador exitosamente.`,
      });
      setIsSuccessOpen(true);
      fetchModifiersData();
    } catch (error) {
      console.error("Error al eliminar modificador:", error);
      const backendMessage = error.response?.data?.message || "Ocurrió un error al eliminar";
      toast.error(backendMessage);
    } finally {
      setItemToDelete(null);
      hideLoader();
    }
  };

  const handleSaveModifier = async (payload) => {
    if (payload.id) {
      await updatePriceModifier(payload.id, payload);
    } else {
      await createPriceModifier(payload);
    }
  };

  const filteredModifiers = modifiers.filter(
    (m) =>
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Modificadores de Precio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Administra los modificadores, recargos y descuentos.
          </p>
        </div>
        <PriceModifierSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => {
            setModifierToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <PriceModifierTable
        data={filteredModifiers}
        onEdit={handleOpenEditModal}
        onDelete={(id) => {
          const m = modifiers.find((x) => x.id === id);
          setItemToDelete(m);
          setIsDeleteModalOpen(true);
        }}
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
        itemName={itemToDelete?.description}
      />
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successConfig.title}
        message={successConfig.message}
      />
      <PriceModifierModal
        open={isModalOpen}
        onClose={handleCloseModal}
        initialData={modifierToEdit}
        onSave={handleSaveModifier}
      />
    </div>
  );
}

const FinancesPage = () => {
  const { can } = usePermission();

  const TABS = [];
  if (can(ROUTE_PERMISSIONS.CURRENCIES_PAGE) || can(ROUTE_PERMISSIONS.FINANCES_READ)) {
    TABS.push({ id: "currencies", label: "Monedas" });
  }
  if (can(ROUTE_PERMISSIONS.RATES_PAGE) || can(ROUTE_PERMISSIONS.FINANCES_READ)) {
    TABS.push({ id: "rates", label: "Tasas de Cambio" });
  }
  if (can(ROUTE_PERMISSIONS.BANK_ACCOUNTS_PAGE) || can(ROUTE_PERMISSIONS.BANK_ACCOUNTS_READ)) {
    TABS.push({ id: "bank-accounts", label: "Cuentas Bancarias" });
  }
  if (can(ROUTE_PERMISSIONS.PRICE_MODIFIERS_PAGE) || can(ROUTE_PERMISSIONS.FINANCES_READ)) {
    TABS.push({ id: "price-modifiers", label: "Modificadores de Precio" });
  }

  const [activeTab, setActiveTab] = useState(TABS[0]?.id || "");

  if (TABS.length === 0) {
    return <div className="p-6 text-center text-gray-500">No tienes permisos para ver las opciones de finanzas.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selector de pestañas */}
      <TabsCustom tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenido de la pestaña */}
      <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm min-h-[500px]">
        {activeTab === "currencies" && <CurrenciesTab />}
        {activeTab === "rates" && <RatesTab />}
        {activeTab === "bank-accounts" && <BankAccountsTab />}
        {activeTab === "price-modifiers" && <PriceModifiersTab />}
      </div>
    </div>
  );
};

export default FinancesPage;
