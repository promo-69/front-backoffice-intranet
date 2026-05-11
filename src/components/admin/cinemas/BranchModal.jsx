import { useState } from "react";
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
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyBranchForm = {
  name: "",
  address: "",
  phone: "",
  openingTime: "",
  closingTime: "",
};

export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const { showLoader, hideLoader } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialData ?? emptyBranchForm);
  const [errors, setErrors] = useState({});

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
        error = "Formato 24h inválido (Ej: 14:30 o 09:00).";
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
      if (!formData[key] && key !== "status")
        newErrors[key] = "Este campo es obligatorio.";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    showLoader();
    try {
      if (isEdit) {
        await api.put(`/cinemas/${initialData.id}`, formData);
      } else {
        await api.post('/cinemas', formData);
      }
      
      // Enviamos 'true' para que el padre sepa que debe refrescar la tabla
      // y disparar el SuccessModal
      onClose(true); 
      
    } catch (error) {
      console.error("Error al procesar la sucursal:", error);
      
      // Capturamos el mensaje específico del backend (como el 409 Conflict)
      const serverDetail = error.response?.data?.message || error.response?.data?.error;
      const errorMessage = serverDetail || "No se pudo guardar la información.";
      
      alert(errorMessage);
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? "Modifique los detalles de la sucursal seleccionada."
              : "Complete los datos para registrar una nueva sede en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <InputForm
              label="Nombre de Sucursal"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Sambil Barquisimeto"
            />
            <ErrorMessage message={errors.name} />
          </div>

          <div>
            <InputForm
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej: Av. Venezuela..."
            />
            <ErrorMessage message={errors.address} />
          </div>

          {/* REINSTALADO: Campo de Teléfono */}
          <div>
            <InputForm
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0251-XXXXXXX"
            />
            <ErrorMessage message={errors.phone} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm
                label="Hora Apertura (24h)"
                name="openingTime"
                type="text"
                value={formData.openingTime}
                onChange={handleChange}
                placeholder="09:00"
              />
              <ErrorMessage message={errors.openingTime} />
            </div>
            <div>
              <InputForm
                label="Hora Cierre (24h)"
                name="closingTime"
                type="text" 
                value={formData.closingTime}
                onChange={handleChange}
                placeholder="22:30"
              />
              <ErrorMessage message={errors.closingTime} />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="font-montserrat" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix"
          >
            {isSubmitting ? "Procesando..." : isEdit ? "Guardar Cambios" : "Registrar Sucursal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}