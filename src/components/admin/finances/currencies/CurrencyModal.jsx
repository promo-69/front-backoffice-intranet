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
  code: "",
  description: "",
  symbol: "",
};

export default function CurrencyModal({ open, onClose, initialData, onSave }) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          code: initialData.code || "",
          description: initialData.description || initialData.name || "",
          symbol: initialData.symbol || "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    const requiredFields = ["code", "description", "symbol"];
    requiredFields.forEach((key) => {
      const value = formData[key]?.toString().trim();
      if (!value) {
        newErrors[key] = "Este campo es obligatorio.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        symbol: formData.symbol.trim(),
      };

      if (isEdit) {
        payload.id = initialData.id;
      }
      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar moneda:", error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setErrors((prev) => ({
        ...prev,
        general: serverMessage || "Ocurrió un error inesperado al guardar la moneda.",
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
            {isEdit ? "Editar Moneda" : "Nueva Moneda"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifica los datos de la moneda seleccionada."
              : "Registra una nueva moneda."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <InputForm
              label="Código (Ej: USD, VES)"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ej: USD"
            />
            <ErrorMessage message={errors.code} />
          </div>

          <div>
            <InputForm
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Dólares"
            />
            <ErrorMessage message={errors.description} />
          </div>

          <div>
            <InputForm
              label="Símbolo"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="Ej: $"
            />
            <ErrorMessage message={errors.symbol} />
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
            {isEdit ? "Actualizar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
