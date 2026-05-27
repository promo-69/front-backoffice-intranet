import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";

function ErrorMessage({ message }) {
  return message ? (
    <span className="text-red-500 text-xs mt-1 block">{message}</span>
  ) : null;
}

export default function CategoryModal({ open, onClose, initialData, onSave }) {
  const isEdit = !!initialData;

  const emptyForm = {
    name: "",
    description: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: 1,
      };

      if (isEdit) {
        payload.id = initialData.id;
      }

      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      setErrors((prev) => ({
        ...prev,
        general: error?.response?.data?.message || "Ocurrió un error inesperado al guardar la categoría.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose(false)}>
      <DialogContent className="max-w-md bg-white p-6 rounded-xl border-none shadow-2xl font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary border-b border-gray-100 pb-3">
            {isEdit ? "Editar Categoría" : "Agregar Categoría"}
          </DialogTitle>
        </DialogHeader>

        {errors.general && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <InputForm
              label="Nombre de Categoría"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Bebidas"
            />
            <ErrorMessage message={errors.name} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Refrescos, agua, jugos"
              className="w-full bg-[#f4f4f4] border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-brand-primary outline-none resize-none min-h-[80px]"
            />
            <ErrorMessage message={errors.description} />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="rounded-lg px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-secondary text-white rounded-lg px-8 transition-colors"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
