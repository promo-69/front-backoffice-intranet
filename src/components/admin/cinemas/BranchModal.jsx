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
import { useLoading } from "../../../context/LoadingContext";
import api from '../../../api/axios';

function ErrorMessage({ message }) {
  return message ? <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">{message}</p> : null;
}

const emptyBranchForm = { name: "", address: "", phone: "", openingTime: "", closingTime: "" };

export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const { showLoader, hideLoader } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyBranchForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        // SOLUCIÓN: Quitamos los segundos (:00) al cargar los datos
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          address: initialData.address || "",
          phone: initialData.phone || "",
          openingTime: (initialData.opening_time || initialData.openingTime || "").slice(0, 5),
          closingTime: (initialData.closing_time || initialData.closingTime || "").slice(0, 5),
        });
      } else {
        setFormData(emptyBranchForm);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      setErrors({ name: !formData.name ? "Obligatorio" : "", address: !formData.address ? "Obligatorio" : "" });
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      // Mapeamos de vuelta a snake_case para que el backend lo entienda
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        status: 1 // O el status que manejes por defecto
      };

      if (isEdit) {
        await api.put(`/cinemas/${initialData.id}`, payload);
      } else {
        await api.post('/cinemas', payload);
      }
      onClose(true);
    } catch (error) {
      alert(error.response?.data?.message || "Error al procesar");
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 border-none shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat uppercase tracking-wider">
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la sede seleccionada." : "Registra una nueva sede en el sistema Cineflix."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <InputForm label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Cine Plaza" />
          <ErrorMessage message={errors.name} />

          <InputForm label="Dirección" name="address" value={formData.address} onChange={handleChange} />
          <ErrorMessage message={errors.address} />

          <InputForm label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <InputForm label="Apertura (HH:mm)" name="openingTime" value={formData.openingTime} onChange={handleChange} placeholder="11:00" />
            <InputForm label="Cierre (HH:mm)" name="closingTime" value={formData.closingTime} onChange={handleChange} placeholder="22:30" />
          </div>
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all">
            {isEdit ? "Actualizar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}