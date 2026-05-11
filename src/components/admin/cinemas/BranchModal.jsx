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

const emptyBranchForm = { 
  name: "", 
  address: "", 
  phone: "", 
  openingTime: "", 
  closingTime: "" 
};

export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const { showLoader, hideLoader } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyBranchForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mapeo desde la base de datos al estado del formulario
        setFormData({
          name: initialData.name || "",
          address: initialData.address || "",
          phone: initialData.phone || "",
          openingTime: initialData.openingTime || initialData.opening_time || "", 
          closingTime: initialData.closingTime || initialData.closing_time || "", 
        });
      } else {
        setFormData(emptyBranchForm);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "phone") {
      const phoneRegex = /^[0-9\s-]+$/;
      if (value && !phoneRegex.test(value)) {
        error = "El teléfono solo debe contener números.";
      }
    }

    if (name === "openingTime" || name === "closingTime") {
      const time24hRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (value && !time24hRegex.test(value)) {
        error = "Formato 24h inválido (Ej: 14:30).";
      }
    }
    return error;
  };
  
  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(emptyBranchForm).forEach((key) => {
      const value = formData[key]?.toString().trim(); 
      if (!value) {
        newErrors[key] = "Este campo es obligatorio.";
      } else {
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      // El servidor espera camelCase según el error 400 detectado
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        openingTime: formData.openingTime, 
        closingTime: formData.closingTime, 
        status: 1 
      };
      
      console.log("Enviando a DB:", payload);

      if (isEdit) {
        await api.put(`/cinemas/${initialData.id}`, payload);
      } else {
        await api.post('/cinemas', payload);
      }
      onClose(true);
    } catch (error) {
      const status = error.response?.status;
      const serverData = error.response?.data;

      if (status === 400) {
        console.log("Detalles del error 400:", serverData); //
        setErrors((prev) => ({
          ...prev,
          general: "Datos inválidos. Revisa el formato de los campos."
        }));
      } else if (status === 409) {
        setErrors((prev) => ({
          ...prev,
          name: "Ya existe una sucursal con este nombre."
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Error al guardar. Intente de nuevo."
        }));
      }
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la sede seleccionada." : "Registra una nueva sede."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <InputForm label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Cine Plaza" />
            <ErrorMessage message={errors.name} />
          </div>

          <div>
            <InputForm label="Dirección" name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Av. Principal 123" />
            <ErrorMessage message={errors.address} />
          </div>

          <div>
            <InputForm label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej: 0251 123 1234" />
            <ErrorMessage message={errors.phone} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm label="Apertura (HH:mm)" name="openingTime" value={formData.openingTime} onChange={handleChange} placeholder="11:00" />
              <ErrorMessage message={errors.openingTime} />
            </div>
            <div>
              <InputForm label="Cierre (HH:mm)" name="closingTime" value={formData.closingTime} onChange={handleChange} placeholder="22:30" />
              <ErrorMessage message={errors.closingTime} />
            </div>
          </div>
          {errors.general && (
            <p className="text-red-500 text-xs text-center font-bold mt-2">
              {errors.general}
            </p>
          )}
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="flex-1">Cancelar</Button>
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