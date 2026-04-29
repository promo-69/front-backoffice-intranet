import { useEffect, useState } from "react";
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
import { SelectForm } from "@/components/ui/SelectForm";
import api from '../api/axios'; // Importación de la instancia de Axios

export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false); // Estado para controlar el envío

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    opening_time: "",
    closing_time: "",
    status: "Activo",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        opening_time: "",
        closing_time: "",
        status: "Activo",
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "phone") {
      const phoneRegex = /^[0-9\s-]+$/;
      if (value && !phoneRegex.test(value)) {
        error = "El teléfono solo debe contener números.";
      }
    }
    if (name === "opening_time" || name === "closing_time") {
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
      if (value && !timeRegex.test(value)) {
        error = "Formato inválido (Ej: 10:00 AM).";
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

    setLoading(true);
    try {
      if (isEdit) {
        // CONEXIÓN: Actualizar sucursal existente
        await api.put(`/cinemas/${initialData.id}`, formData);
      } else {
        // CONEXIÓN: Crear nueva sucursal
        await api.post('/cinemas', formData);
      }
      
      // Notificamos éxito y refrescamos la tabla pasando 'true' a la página padre
      onClose(true); 
    } catch (error) {
      console.error("Error al procesar la sucursal:", error);
      alert("No se pudo guardar la información. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ message }) =>
    message ? (
      <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
        {message}
      </p>
    ) : null;

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
                label="Hora Apertura"
                name="opening_time"
                value={formData.opening_time}
                onChange={handleChange}
                placeholder="10:00 AM"
              />
              <ErrorMessage message={errors.opening_time} />
            </div>
            <div>
              <InputForm
                label="Hora Cierre"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleChange}
                placeholder="11:00 PM"
              />
              <ErrorMessage message={errors.closing_time} />
            </div>
          </div>

          {isEdit && (
            <SelectForm
              label="Estado de la Sucursal"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </SelectForm>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="font-montserrat" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix"
          >
            {loading ? "Procesando..." : isEdit ? "Guardar Cambios" : "Registrar Sucursal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}