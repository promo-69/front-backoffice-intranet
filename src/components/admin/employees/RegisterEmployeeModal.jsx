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

export default function RegisterEmployeeModal({ open, onClose }) {
  const [employeeData, setEmployeeData] = useState({
    documentNumber: "",
    firstName: "",
    lastName: "",
    jobPosition: "",
    cinema: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⭐ Reset al abrir/cerrar
  useEffect(() => {
    if (!open) {
      setEmployeeData({
        documentNumber: "",
        firstName: "",
        lastName: "",
        jobPosition: "",
        cinema: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  // ⭐ Validaciones
  const validateField = (name, value) => {
    if (!value || value.toString().trim() === "")
      return "Este campo es obligatorio.";

    if (name === "firstName" || name === "lastName") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!regex.test(value)) return "Solo se permiten letras.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(employeeData).forEach((key) => {
      const err = validateField(key, employeeData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⭐ SUBMIT
  const handleSubmit = async () => {
    if (!validateAll()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        person: {
          document_number: employeeData.documentNumber,
          first_name: employeeData.firstName.trim(),
          last_name: employeeData.lastName.trim(),
        },
        employee_code: `${employeeData.firstName[0] || "X"}${
          employeeData.lastName[0] || "X"
        }-${Math.floor(Math.random() * 9000 + 1000)}`,
        job_position: Number(employeeData.jobPosition),
        cinema: Number(employeeData.cinema),
      };

      await createEmployee(payload);

      onClose(true);
    } catch (error) {
      console.error("Error registrando empleado:", error);
      setIsSubmitting(false);
    }
  };

  const ErrorMsg = ({ message }) =>
    message ? (
      <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">
        {message}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition"
        >
          ✕
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Registrar Empleado
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingrese los datos del empleado.
          </DialogDescription>
        </DialogHeader>

        {/* FORMULARIO */}
        <div className="space-y-4 mt-4">
          <div>
            <InputForm
              label="Cédula"
              name="documentNumber"
              value={employeeData.documentNumber}
              onChange={handleChange}
              placeholder="Ej: 123456789"
            />
            <ErrorMsg message={errors.documentNumber} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm
                label="Nombre"
                name="firstName"
                value={employeeData.firstName}
                onChange={handleChange}
                placeholder="Ej: María"
              />
              <ErrorMsg message={errors.firstName} />
            </div>

            <div>
              <InputForm
                label="Apellido"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleChange}
                placeholder="Ej: González"
              />
              <ErrorMsg message={errors.lastName} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SelectForm
                label="Cargo"
                name="jobPosition"
                value={employeeData.jobPosition}
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

            <div>
              <SelectForm
                label="Sucursal"
                name="cinema"
                value={employeeData.cinema}
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
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-brand-primary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Registrar Empleado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
