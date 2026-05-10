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
import { SelectForm } from "@/components/ui/SelectForm";

export function RegisterUserModal({ open, onClose }) {
  const [formData, setFormData] = useState({
  "documentNumber": "",
  "firstName": "",
  "lastName": "",
  "jobPosition": "",
  "cinema": "",
  "startDate": "",
  "salaryBase": "",
  "status": ""
  });

  const [errors, setErrors] = useState({});

  // Limpiar el formulario al cerrar/abrir
  useEffect(() => {
    if (!open) {
      setFormData({ documentNumber: "", firstName: "", lastName: "", jobPosition: "", cinema: "", startDate: "", salaryBase: "", status: "" });
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
    if (name === "firstName") {
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
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
              label="Cedula"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Ej: 123456789"
            />
            <ErrorMsg message={errors.documentNumber} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <InputForm
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ej: María"
              />
              <ErrorMsg message={errors.firstName} />
            </div>
            <div className="flex flex-col">
              <InputForm
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Ej: Gonzalez"
              />
              <ErrorMsg message={errors.lastName} />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <SelectForm
                label="Cargo"
                name="jobPosition"
                value={formData.jobPosition}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="SUPER_ADMIN">Administrador</option>
                <option value="CINEMA_MANAGER">Gerente</option>
                <option value="CASHIER">Cajero</option>
                <option value="USHER">Operador</option>
              </SelectForm>
              <ErrorMsg message={errors.jobPosition} />
            </div>

            <div className="flex flex-col">
              <SelectForm
                label="Sucursal"
                name="cinema"
                value={formData.cinema}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="SUCURSAL_1">Sucursal 1</option>
                <option value="SUCURSAL_2">Sucursal 2</option>
                <option value="SUCURSAL_3">Sucursal 3</option>
              </SelectForm>
              <ErrorMsg message={errors.cinema} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <InputForm
                label="Fecha de ingreso"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                placeholder="Ej: María"
              />
              <ErrorMsg message={errors.startDate} />
            </div>
            <div className="flex flex-col">
              <InputForm
                label="Salario base"
                name="salaryBase"
                type="number"
                value={formData.salaryBase}
                onChange={handleChange}
                placeholder="Ej: 50000"
              />
              <ErrorMsg message={errors.salaryBase} />
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <InputForm
            label="Estatus"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Ej: Activo"
          />
          <ErrorMsg message={errors.status} />
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