import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { Sparkles, Search, Package, AlertCircle, Check, MapPin } from "lucide-react";

export default function ProvisionProductModal({
  open,
  onClose,
  allProducts = [],
  cinemaInventory = [],
  onSave,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [minimumStock, setMinimumStock] = useState("0");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Filtrar los productos del catálogo que AÚN NO están vinculados en la sucursal
  const provisionedProductIds = cinemaInventory.map((item) => {
    return item.product || item._Products?.id || item.productId;
  }).filter(Boolean).map(String);

  const availableProducts = allProducts.filter((p) => {
    return !provisionedProductIds.includes(String(p.id));
  });

  // Filtrar por término de búsqueda
  const filteredProducts = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedProductId("");
      setMinimumStock("10"); // Valor por defecto amigable
      setErrors({});
      setShowDropdown(false);
    }
  }, [open]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProduct = allProducts.find((p) => String(p.id) === String(selectedProductId));

  const validate = () => {
    const newErrors = {};
    if (!selectedProductId) {
      newErrors.product = "Debe seleccionar un producto del catálogo.";
    }
    const minStockNum = Number(minimumStock);
    if (minimumStock === "" || isNaN(minStockNum) || minStockNum < 0 || !Number.isInteger(minStockNum)) {
      newErrors.minimumStock = "El stock mínimo debe ser un número entero mayor o igual a cero.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        productId: Number(selectedProductId),
        minimumStock: Number(minimumStock),
      });
      onClose(true);
    } catch (error) {
      console.error("Error al habilitar producto en sucursal:", error);
      setErrors((prev) => ({
        ...prev,
        general: error?.response?.data?.message || "Ocurrió un error inesperado al habilitar el producto.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose(false)}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl border-none shadow-2xl font-montserrat overflow-hidden">
        
        {/* Glow de estética premium */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary" />

        <DialogHeader>
          <DialogTitle className="text-xl font-black text-brand-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold animate-pulse shrink-0" />
            Habilitar Producto en Sucursal
          </DialogTitle>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            Asociar producto del catálogo general a esta sede
          </p>
        </DialogHeader>

        {errors.general && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 mt-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 relative z-10">
          
          {/* Selector de Producto */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Seleccionar Producto del Catálogo
            </label>
            
            <div className="relative">
              <div 
                onClick={() => !isSubmitting && setShowDropdown((v) => !v)}
                className={`
                  w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 bg-slate-50/50
                  ${showDropdown ? "border-brand-primary ring-2 ring-brand-primary/10" : "border-slate-200 hover:border-slate-300"}
                  ${selectedProduct ? "text-slate-800" : "text-slate-400"}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedProduct ? (
                    <>
                      {selectedProduct.image_url ? (
                        <img 
                          src={selectedProduct.image_url} 
                          alt={selectedProduct.name} 
                          className="w-7 h-7 object-cover rounded-lg shrink-0 border border-slate-100"
                        />
                      ) : (
                        <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div className="text-left min-w-0">
                        <p className="font-bold truncate text-[11px]">{selectedProduct.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-tight">SKU: {selectedProduct.sku}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Elige un producto...</span>
                    </>
                  )}
                </div>
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Dropdown Lista de Productos */}
              {showDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] focus:ring-0 outline-none text-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="divide-y divide-slate-50">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-400">
                        No hay productos disponibles para vincular.
                      </div>
                    ) : (
                      filteredProducts.map((p) => {
                        const isChosen = String(p.id) === String(selectedProductId);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProductId(String(p.id));
                              setShowDropdown(false);
                              setSearchTerm("");
                              setErrors((prev) => ({ ...prev, product: null }));
                            }}
                            className={`
                              flex items-center justify-between gap-3 px-3 py-2 text-left cursor-pointer transition-colors
                              hover:bg-brand-primary/5
                              ${isChosen ? "bg-brand-primary/8" : ""}
                            `}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {p.image_url ? (
                                <img 
                                  src={p.image_url} 
                                  alt={p.name} 
                                  className="w-7 h-7 object-cover rounded-lg shrink-0"
                                />
                              ) : (
                                <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                  <Package className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-700 truncate">{p.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono">SKU: {p.sku}</p>
                              </div>
                            </div>
                            {isChosen && <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.product && (
              <span className="text-red-500 text-[10px] font-bold mt-1 block">
                {errors.product}
              </span>
            )}
          </div>

          {/* Stock Mínimo */}
          <div>
            <InputForm
              label="Stock Mínimo Alerta"
              type="number"
              name="minimumStock"
              value={minimumStock}
              onChange={(e) => {
                setMinimumStock(e.target.value);
                setErrors((prev) => ({ ...prev, minimumStock: null }));
              }}
              placeholder="Ej: 10"
              className="bg-[#fcfcfc]"
            />
            <p className="text-[9px] text-slate-400 mt-1">
              Umbral mínimo para generar alertas de reabastecimiento en el dashboard.
            </p>
            {errors.minimumStock && (
              <span className="text-red-500 text-[10px] font-bold mt-1 block">
                {errors.minimumStock}
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="rounded-xl px-5 text-xs font-bold border-slate-200 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <DisableIfNoPermission permission={"CRUD:UPDATE:PRODUCTS"} title="No tienes permiso para habilitar productos en sucursal">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-6 text-xs font-bold transition-all shadow-sm"
              >
                {isSubmitting ? "Habilitando..." : "Habilitar en Sucursal"}
              </Button>
            </DisableIfNoPermission>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
