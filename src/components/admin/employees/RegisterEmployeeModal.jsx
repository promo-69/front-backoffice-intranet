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
import { getCinemas } from "@/services/cinema.service";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";


export default function RegisterEmployeeModal({ open, onClose }) {
  const [cinemas, setCinemas] = useState([]);

  const [employeeData, setEmployeeData] = useState({
    documentNumber: "",
    firstName: "",
    lastName: "",
    jobPosition: "",
    cinema: "",
    startDate: "",
    salaryBase: "",
    email: "",
    password: "",
    role:"",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCinemas = async () => {
    try {
      const data = await getCinemas();
      setCinemas(data.data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  // ⭐ Cargar sucursales al abrir
  useEffect(() => {
    if (open) loadCinemas();
  }, [open]);

  // ⭐ Reset al cerrar
  useEffect(() => {
    if (!open) {
      setEmployeeData({
        documentNumber: "",
        firstName: "",
        lastName: "",
        jobPosition: "",
        cinema: "",
        startDate: "",
        salaryBase: "",
        email: "",
        password: "",
        role:"",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  // ⭐ Validaciones
  const validateField = (name, value) => {
    if (!value || value.toString().trim() === "")
      return "Este campo es obligatorio.";

    if (["firstName", "lastName"].includes(name)) {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!regex.test(value)) return "Solo se permiten letras.";
    }

    if (name === "salaryBase" && Number(value) <= 0)
      return "El salario debe ser mayor a 0.";

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Correo inválido.";
    }

    if (name === "password" && value.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
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
        documentNumber: employeeData.documentNumber,
        firstName: employeeData.firstName.trim(),
        lastName: employeeData.lastName.trim(),
        employeeCode: `${employeeData.firstName[0] || "X"}${
          employeeData.lastName[0] || "X"
        }-${Math.floor(Math.random() * 9000 + 1000)}`,
        jobPosition: Number(employeeData.jobPosition),
        cinema: Number(employeeData.cinema),
        startDate: employeeData.startDate,
        salaryBase: Number(employeeData.salaryBase),
        email: employeeData.email.trim(),
        password: employeeData.password,
        role: Number(employeeData.role),
      };

      await createEmployee(payload);

      setTimeout(() => {
        onClose(true);
      }, 100);
      
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-cineflix p-6 shadow-2xl border-none">
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
          {/* DOCUMENTO */}
          <InputForm
            label="Cédula"
            name="documentNumber"
            value={employeeData.documentNumber}
            onChange={handleChange}
            placeholder="Ej: 123456789"
          />
          <ErrorMsg message={errors.documentNumber} />

          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm
                label="Nombre"
                name="firstName"
                value={employeeData.firstName}
                onChange={handleChange}
                placeholder="Ej: Maria"
              />
              <ErrorMsg message={errors.firstName} />
            </div>

            <div>
              <InputForm
                label="Apellido"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleChange}
                placeholder="Ej: Pérez"
              />
              <ErrorMsg message={errors.lastName} />
            </div>
          </div>

          {/* CARGO Y SUCURSAL */}
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
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectForm>
              <ErrorMsg message={errors.cinema} />
            </div>
          </div>

          {/* FECHA DE INICIO */}
          <InputForm
            label="Fecha de Inicio"
            name="startDate"
            type="date"
            value={employeeData.startDate}
            onChange={handleChange}
          />
          <ErrorMsg message={errors.startDate} />

          {/* SALARIO */}
          <InputForm
            label="Salario Base"
            name="salaryBase"
            type="number"
            value={employeeData.salaryBase}
            onChange={handleChange}
            placeholder="Ej: 1200"
          />
          <ErrorMsg message={errors.salaryBase} />

          {/* EMAIL */}
          <div>
            <InputForm
              label="Correo electrónico"
              name="email"
              value={employeeData.email}
              onChange={handleChange}
              placeholder="Ej: usuario@cineflix.com"
            />
            <ErrorMsg message={errors.email} />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <InputForm
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={employeeData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 -translate-y-1/2 text-gray-600 text-xl opacity-80 hover:opacity-100"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>

            <ErrorMsg message={errors.password} />
          </div>
          <div>
            <SelectForm
              label="Rol del Sistema"
              name="role"
              value={employeeData.role}
              onChange={handleChange}
            >
              <option value="">Seleccione un rol...</option>
              <option value="2">GENERAL_MANAGER</option>
              <option value="3">CINEMA_MANAGER</option>
              <option value="4">CASHIER</option>
              <option value="5">USHER</option>
            </SelectForm>
            <ErrorMsg message={errors.role} />
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
