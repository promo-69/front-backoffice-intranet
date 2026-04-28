import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";

export function RegisterUserModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    branch: "",
  });

  const [errors, setErrors] = useState({});

  // Limpiar el formulario al cerrar/abrir
  useEffect(() => {
    if (!open) {
      setFormData({ fullName: "", email: "", role: "", branch: "" });
      setErrors({});
    }
  }, [open]);

  const validateField = (name, value) => {
    let error = "";

    // Validación de obligatoriedad
    if (!value || value.trim() === "") {
      return "Este campo es obligatorio.";
    }

    // Validación específica para Nombre (Solo letras y espacios)
    if (name === "fullName") {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nameRegex.test(value)) {
        error = "Solo se permiten letras en este campo.";
      }
    }

    // Validación básica de email
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Ingrese un correo electrónico válido.";
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validar en tiempo real
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validar todos los campos al intentar enviar
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Si todo está bien
    console.log("Empleado registrado:", formData);
    onClose();
  };

  // Componente de error reutilizable
  const ErrorMsg = ({ message }) => (
    message ? <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{message}</p> : null
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Registrar Empleado
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingrese los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <InputForm 
              label="Nombre completo" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ej: María González" 
            />
            <ErrorMsg message={errors.fullName} />
          </div>

          <div>
            <InputForm
              label="Correo electrónico"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: maria.gonzalez@example.com"
            />
            <ErrorMsg message={errors.email} />
          </div>

          <div>
            <SelectForm 
              label="Rol" 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
            >
              <option value="">Seleccione un rol</option>
              <option value="CAJERO">Cajero</option>
              <option value="OPERADOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </SelectForm>
            <ErrorMsg message={errors.role} />
          </div>

          <div>
            <SelectForm 
              label="Sucursal" 
              name="branch" 
              value={formData.branch} 
              onChange={handleChange}
            >
              <option value="">Seleccione una sucursal</option>
              <option value="SUCURSAL_1">Sucursal 1</option>
              <option value="SUCURSAL_2">Sucursal 2</option>
              <option value="SUCURSAL_3">Sucursal 3</option>
            </SelectForm>
            <ErrorMsg message={errors.branch} />
          </div>

          <p className="text-[11px] text-gray-500 mt-2 text-center leading-relaxed">
            Se enviarán las credenciales automáticamente al correo registrado.
            El usuario deberá cambiar su contraseña en el primer inicio de
            sesión.
          </p>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="
              font-montserrat 
              border-gray-300 
              transition-all 
              duration-200 
              hover:bg-gray-50 
              hover:border-gray-400 
              active:scale-95
            "
          >
            Cancelar
          </Button>

          <Button 
            onClick={handleSubmit}
            className="
              bg-brand-primary 
              text-white 
              font-montserrat 
              font-bold 
              px-6 
              rounded-cineflix 
              transition-all 
              duration-200 
              hover:bg-brand-primary/90 
              hover:shadow-md 
              hover:-translate-y-0.5 
              active:scale-95
            "
          >
            Registrar Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}