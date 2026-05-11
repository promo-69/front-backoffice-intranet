import { useState, useEffect } from "react"; // Añadimos useEffect
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

  // --- EFECTO DE LIMPIEZA Y SINCRONIZACIÓN ---
  useEffect(() => {
    if (open) {
      // Si hay datos iniciales, cargamos para editar, si no, reseteamos a vacío
      setFormData(initialData ?? emptyBranchForm);
      setErrors({}); // Limpiamos errores visuales de intentos anteriores
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "phone") {
      const phoneRegex = /^[0-9\s-]+$/;
      if (value && !phoneRegex.test(value)) {
        error = "El teléfono solo debe contener números.";
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiamos el error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    // NUEVA LÓGICA DE VALIDACIÓN: Todos los campos obligatorios
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
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        status: 1 
      };

      if (isEdit) {
        await api.put(`/cinemas/${initialData.id}`, payload);
      } else {
        await api.post('/cinemas', payload);
      }
      onClose(true); 
    } catch (error) {
      console.error("Error al procesar la sucursal:", error);

      if (error.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          name: "Ya existe una sucursal con este nombre."
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Error de conexión. Intente más tarde."
        }));
      }
    }finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
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
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la sede seleccionada." : "Registra una nueva sede en el sistema Cineflix."}
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