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
import { createEmployee } from "@/services/employees.service";

export function RegisterUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    documentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    jobPosition: "",
    cinema: "",
    startDate: "",
    salaryBase: "",
    status: "",
  });

  const [errors, setErrors] = useState({});

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setFormData({
        documentNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        jobPosition: "",
        cinema: "",
        startDate: "",
        salaryBase: "",
        status: "",
      });
      setErrors({});
    }
  }, [open]);

  // Validaciones
  const validateField = (name, value) => {
    if (!value || value.trim() === "") return "Este campo es obligatorio.";

    if (name === "firstName" || name === "lastName") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!regex.test(value)) return "Solo se permiten letras.";
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Correo inválido.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit
  const handleSubmit = async () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      const payload = {
        documentNumber: formData.documentNumber,
        firstName,
        lastName,
        email: formData.email,
        employeeCode: `${firstName[0]}${lastName[0]}-${Math.floor(
          Math.random() * 9000 + 1000,
        )}`,
        jobPosition: Number(formData.jobPosition),
        cinema: Number(formData.cinema),
        startDate: formData.startDate,
        salaryBase: Number(formData.salaryBase),
        status: Number(formData.status),
      };

      await createEmployee(payload);

      if (onSuccess) onSuccess(); // refresca tabla
      onClose();
    } catch (error) {
      console.error("Error creando empleado:", error);
      alert("No se pudo registrar el empleado.");
    }
  };

  const ErrorMsg = ({ message }) =>
    message ? (
      <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">
        {message}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition"
        >
          ✕
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Registrar Empleado
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingrese los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        {/* FORMULARIO */}
        <div className="space-y-4 mt-4">
          {/* CÉDULA */}
          <div>
            <InputForm
              label="Cédula"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Ej: 123456789"
            />
            <ErrorMsg message={errors.documentNumber} />
          </div>

          {/* NOMBRE + APELLIDO */}
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
                placeholder="Ej: González"
              />
              <ErrorMsg message={errors.lastName} />
            </div>
          </div>

          {/* CORREO */}
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

          {/* CARGO + SUCURSAL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <SelectForm
                label="Cargo"
                name="jobPosition"
                value={formData.jobPosition}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Administrador</option>
                <option value="2">Gerente</option>
                <option value="3">Cajero</option>
                <option value="4">Operador</option>
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
                <option value="1">Sucursal 1</option>
                <option value="2">Sucursal 2</option>
                <option value="3">Sucursal 3</option>
              </SelectForm>
              <ErrorMsg message={errors.cinema} />
            </div>
          </div>

          {/* FECHA + SALARIO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <InputForm
                label="Fecha de ingreso"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
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

          {/* ESTATUS */}
          <div className="flex flex-col">
            <SelectForm
              label="Estatus"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </SelectForm>
            <ErrorMsg message={errors.status} />
          </div>
        </div>

        {/* BOTONES */}
        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-brand-primary text-white"
          >
            Registrar Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
