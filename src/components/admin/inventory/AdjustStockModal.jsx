import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { ArrowUpRight, ArrowDownLeft, AlertCircle, Sparkles } from "lucide-react";

export default function AdjustStockModal({ open, onClose, item, onSave }) {
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("IN"); // "IN" = Ingreso, "OUT" = Egreso
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = item?._Products || item?.product || {};
  const currentStock = item?.stock ?? 0;

  useEffect(() => {
    if (open) {
      setQuantity("");
      setType("IN");
      setReason("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};
    if (!quantity) {
      newErrors.quantity = "La cantidad es obligatoria.";
    } else {
      const qNum = Number(quantity);
      if (isNaN(qNum) || qNum <= 0 || !Number.isInteger(qNum)) {
        newErrors.quantity = "Ingrese un número entero mayor a cero.";
      } else if (type === "OUT" && qNum > currentStock) {
        newErrors.quantity = `No puede retirar más del stock actual (${currentStock} u.).`;
      }
    }
    if (!reason.trim()) {
      newErrors.reason = "El motivo o justificación es obligatorio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        quantity: Number(quantity),
        type,
        reason: reason.trim(),
      };
      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al ajustar stock:", error);
      setErrors((prev) => ({
        ...prev,
        general: error?.response?.data?.message || "Ocurrió un error inesperado al ajustar el stock.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose(false)}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl border-none shadow-2xl font-montserrat overflow-hidden">
        
        {/* Glow efecto premium en top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-xl font-black text-brand-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold animate-pulse shrink-0" />
            Ajustar Inventario
          </DialogTitle>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
            {product.name || "Producto"}
          </p>
        </DialogHeader>

        {errors.general && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 mt-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 relative z-10">
          {/* Info de stock actual */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">Stock Actual en Sucursal:</span>
            <span className="font-black text-sm text-slate-800 bg-white shadow-sm px-2.5 py-1 rounded-lg border border-slate-100">
              {currentStock} u.
            </span>
          </div>

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tipo de Ajuste
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("IN");
                  setErrors((prev) => ({ ...prev, quantity: null }));
                }}
                className={`
                  flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black transition-all duration-200
                  ${type === "IN"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }
                `}
              >
                <span className={`p-1 rounded-lg ${type === "IN" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                Ingreso (+ Stock)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("OUT");
                  setErrors((prev) => ({ ...prev, quantity: null }));
                }}
                className={`
                  flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-black transition-all duration-200
                  ${type === "OUT"
                    ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }
                `}
              >
                <span className={`p-1 rounded-lg ${type === "OUT" ? "bg-red-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </span>
                Egreso (- Stock)
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <InputForm
              label="Cantidad a ajustar"
              type="number"
              name="quantity"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: null }));
              }}
              placeholder="Ej: 10"
              className="bg-[#fcfcfc]"
            />
            {errors.quantity && (
              <span className="text-red-500 text-[10px] font-bold mt-1 block">
                {errors.quantity}
              </span>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Motivo o Justificación
            </label>
            <textarea
              name="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => ({ ...prev, reason: null }));
              }}
              placeholder="Ej: Ajuste por inventario mensual, merma, reabastecimiento..."
              className="w-full bg-[#fcfcfc] border border-slate-200 hover:border-slate-300 focus:border-brand-primary rounded-xl p-3 text-xs focus:ring-1 focus:ring-brand-primary outline-none resize-none min-h-[70px] transition-all"
            />
            {errors.reason && (
              <span className="text-red-500 text-[10px] font-bold mt-1 block">
                {errors.reason}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`
                text-white rounded-xl px-6 text-xs font-bold transition-all shadow-sm
                ${type === "IN"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  : "bg-red-600 hover:bg-red-700 shadow-red-100"
                }
              `}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Ajuste"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
