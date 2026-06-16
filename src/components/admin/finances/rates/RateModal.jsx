import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";

function ErrorMessage({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyForm = {
  currency_id: "",
  rate: "",
};

export default function RateModal({ open, onClose, currencies = [], onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData(emptyForm);
      setErrors({});
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.currency_id) newErrors.currency_id = "Debe seleccionar una moneda.";
    if (!formData.rate) {
      newErrors.rate = "La tasa es obligatoria.";
    } else if (isNaN(Number(formData.rate)) || Number(formData.rate) <= 0) {
      newErrors.rate = "Debe ser un número mayor a 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        currency: Number(formData.currency_id), // También se podría mapear a currency_id según lo que el backend espere
        rate: parseFloat(formData.rate),
      };

      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al registrar tasa:", error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setErrors((prev) => ({
        ...prev,
        general: serverMessage || "Ocurrió un error inesperado al registrar la tasa.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-sm bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            Nueva Tasa de Cambio
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Registra una nueva tasa de cambio. Una vez registrada, no podrá ser modificada ni eliminada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="relative w-full">
            <label
              className="
                absolute 
                top-1 
                left-0 
                pl-2
                text-[11px] 
                font-montserrat 
                font-bold 
                text-brand-primary 
                tracking-wide 
                uppercase
              "
            >
              Moneda
            </label>
            <select
              name="currency_id"
              value={formData.currency_id}
              onChange={handleChange}
              className="
                w-full 
                bg-white 
                border 
                border-border 
                rounded-cineflix 
                px-3 
                pt-6 
                pb-2 
                text-sm 
                font-montserrat
                focus:outline-none 
                focus:ring-2 
                focus:ring-brand-primary/40 
                focus:border-brand-primary
                appearance-none
                cursor-pointer
              "
            >
              <option value="">Selecciona una moneda</option>
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.code} — {curr.description}
                </option>
              ))}
            </select>
            <ErrorMessage message={errors.currency_id} />
          </div>

          <div>
            <InputForm
              label="Tasa de Cambio"
              name="rate"
              type="number"
              step="0.0001"
              value={formData.rate}
              onChange={handleChange}
              placeholder="Ej: 45.50"
            />
            <ErrorMessage message={errors.rate} />
          </div>

          {errors.general && (
            <p className="text-red-500 text-xs text-center font-bold mt-2">
              {errors.general}
            </p>
          )}
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
          >
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
