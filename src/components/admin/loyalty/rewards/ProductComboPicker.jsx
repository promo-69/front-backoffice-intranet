import { useState, useEffect, useMemo } from "react";
import { Search, X, Package, Gift, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { concessionsService } from "@/services/concessions.service";

const PAGE_SIZE = 8;

export default function ProductComboPicker({ open, mode, cinemaId, onSelect, onClose }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const isCombo = mode === "combo";

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setPage(1);
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, cinemaId]);

  const fetchItems = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = isCombo
        ? await concessionsService.getAvailableCombos(cinemaId)
        : await concessionsService.getProducts();

      // Log temporal para depurar — revisa la consola del navegador.
      console.log(`[ProductComboPicker] respuesta cruda (${mode}):`, data);

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      // Antes esto se tragaba silenciosamente. Ahora se ve el error real.
      console.error(`[ProductComboPicker] Error al cargar ${isCombo ? "combos" : "productos"}:`, error);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          `No se pudo cargar el catálogo de ${isCombo ? "combos" : "productos"}.`
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      (item.name || item.description || "").toLowerCase().includes(term)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const Icon = isCombo ? Gift : Package;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl bg-white rounded-cineflix p-0 shadow-2xl border-none flex flex-col max-h-[80vh] min-h-[560px] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-brand-primary/10 bg-gradient-to-r from-brand-primary/[0.06] to-transparent">
          <DialogTitle className="text-lg font-bold text-brand-primary flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Icon className="w-4.5 h-4.5" />
            </span>
            Seleccionar {isCombo ? "Combo" : "Producto"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 ml-11">
            {isCombo
              ? "Combos disponibles en la sucursal seleccionada."
              : "Catálogo global de productos."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/50" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Buscar ${isCombo ? "combo" : "producto"} por nombre...`}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-brand-primary/[0.04] border border-brand-primary/10 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[280px]">
          {isLoading ? (
            <p className="text-center text-xs text-slate-400 py-16">Cargando...</p>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <p className="text-xs text-red-500 font-semibold max-w-sm">{loadError}</p>
              <button
                onClick={fetchItems}
                className="text-[11px] font-bold text-brand-primary underline underline-offset-2 mt-1"
              >
                Reintentar
              </button>
            </div>
          ) : pageItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-16">
              {isCombo && !cinemaId
                ? "Selecciona primero una sucursal."
                : "No se encontraron resultados."}
            </p>
          ) : (
            <div className="space-y-2.5">
              {pageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-brand-primary/10 bg-brand-primary/[0.02] hover:border-brand-primary/40 hover:bg-brand-primary/[0.08] transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700">{item.name || item.description}</p>
                    {item.description && item.name && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase text-brand-primary shrink-0 bg-brand-primary/10 px-2.5 py-1 rounded-full">
                    Seleccionar
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-brand-primary/[0.04] border-t border-brand-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-brand-primary/15 bg-white disabled:opacity-40"
            >
              ◀
            </button>
            <span className="text-[11px] text-slate-500 font-semibold">
              Página {safePage} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-brand-primary/15 bg-white disabled:opacity-40"
            >
              ▶
            </button>
          </div>
          <Button variant="outline" onClick={onClose} className="text-xs border-brand-primary/20">
            <X className="w-3.5 h-3.5 mr-1" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
