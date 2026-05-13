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
import { createUser, getRoles } from "@/services/users.service";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export function RegisterUserModal({ open, onClose }) {
  const [step, setStep] = useState(1);

  const [employeeData, setEmployeeData] = useState({
    documentNumber: "",
    firstName: "",
    lastName: "",
    jobPosition: "",
    cinema: "",
  });

  const [userData, setUserData] = useState({
    email: "",
    password: "",
    roleId: "",
  });

  const [errorsEmp, setErrorsEmp] = useState({});
  const [errorsUser, setErrorsUser] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);

  // ⭐ Cargar roles dinámicamente
  useEffect(() => {
    if (!open) {
      setStep(1);
      setEmployeeData({
        documentNumber: "",
        firstName: "",
        lastName: "",
        jobPosition: "",
        cinema: "",
      });
      setUserData({
        email: "",
        password: "",
        roleId: "",
      });
      setErrorsEmp({});
      setErrorsUser({});
      setIsSubmitting(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error cargando roles:", error);
      }
    };

    fetchRoles();
  }, [open]);

  // ⭐ Validaciones
  const validateEmpField = (name, value) => {
    if (!value || value.toString().trim() === "")
      return "Este campo es obligatorio.";

    if (name === "firstName" || name === "lastName") {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!regex.test(value)) return "Solo se permiten letras.";
    }

    if (name === "jobPosition" || name === "cinema") {
      if (value === "") return "Debe seleccionar una opción.";
    }

    return "";
  };

  const validateUserField = (name, value) => {
    if (!value || value.toString().trim() === "")
      return "Este campo es obligatorio.";

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Correo inválido.";
    }

    if (name === "password") {
      if (value.length < 8)
        return "La contraseña debe tener al menos 8 caracteres.";
    }

    return "";
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleEmpChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrorsEmp((prev) => ({
      ...prev,
      [name]: validateEmpField(name, value),
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrorsUser((prev) => ({
      ...prev,
      [name]: validateUserField(name, value),
    }));
  };

  const validateEmployeeStep = () => {
    const newErrors = {};
    Object.keys(employeeData).forEach((key) => {
      const err = validateEmpField(key, employeeData[key]);
      if (err) newErrors[key] = err;
    });
    setErrorsEmp(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserStep = () => {
    const newErrors = {};
    Object.keys(userData).forEach((key) => {
      const err = validateUserField(key, userData[key]);
      if (err) newErrors[key] = err;
    });
    setErrorsUser(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateEmployeeStep()) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  // ⭐ SUBMIT FINAL
  const handleSubmit = async () => {
    if (!validateUserStep()) return;

    try {
      setIsSubmitting(true);

      // ⭐ FORMATO REAL DEL BACKEND
      const payloadEmployee = {
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

      const empRes = await createEmployee(payloadEmployee);
      const employeeId = empRes?.data?.id;

      if (!employeeId) {
        console.error("No se obtuvo el ID del empleado creado.");
        setIsSubmitting(false);
        return;
      }

      const payloadUser = {
        employeeId,
        roleId: Number(userData.roleId),
        email: userData.email,
        password: userData.password,
      };

      await createUser(payloadUser);

      onClose(true);
    } catch (error) {
      console.error("Error en el registro de usuario:", error);
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
            {step === 1 ? "Registrar Empleado" : "Crear Usuario de Acceso"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1
              ? "Ingrese los datos del empleado."
              : "Configure el usuario del sistema (correo, contraseña y rol)."}
          </DialogDescription>
        </DialogHeader>

        {/* PASO 1: EMPLEADO */}
        {step === 1 && (
          <div className="space-y-4 mt-4">
            <div>
              <InputForm
                label="Cédula"
                name="documentNumber"
                value={employeeData.documentNumber}
                onChange={handleEmpChange}
                placeholder="Ej: 123456789"
              />
              <ErrorMsg message={errorsEmp.documentNumber} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <InputForm
                  label="Nombre"
                  name="firstName"
                  value={employeeData.firstName}
                  onChange={handleEmpChange}
                  placeholder="Ej: María"
                />
                <ErrorMsg message={errorsEmp.firstName} />
              </div>

              <div className="flex flex-col">
                <InputForm
                  label="Apellido"
                  name="lastName"
                  value={employeeData.lastName}
                  onChange={handleEmpChange}
                  placeholder="Ej: González"
                />
                <ErrorMsg message={errorsEmp.lastName} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <SelectForm
                  label="Cargo"
                  name="jobPosition"
                  value={employeeData.jobPosition}
                  onChange={handleEmpChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="1">Administrador</option>
                  <option value="2">Gerente</option>
                  <option value="3">Cajero</option>
                  <option value="4">Operador</option>
                </SelectForm>
                <ErrorMsg message={errorsEmp.jobPosition} />
              </div>

              <div className="flex flex-col">
                <SelectForm
                  label="Sucursal"
                  name="cinema"
                  value={employeeData.cinema}
                  onChange={handleEmpChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="1">Sucursal 1</option>
                  <option value="2">Sucursal 2</option>
                  <option value="3">Sucursal 3</option>
                </SelectForm>
                <ErrorMsg message={errorsEmp.cinema} />
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: USUARIO */}
        {step === 2 && (
          <div className="space-y-4 mt-4">
            <div>
              <InputForm
                label="Correo electrónico"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                placeholder="Ej: usuario@cineflix.com"
              />
              <ErrorMsg message={errorsUser.email} />
            </div>

            <div className="relative">
              <InputForm
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={userData.password}
                onChange={handleUserChange}
                placeholder="Mínimo 8 caracteres"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 -translate-y-1/2 text-gray-600 text-xl opacity-80 hover:opacity-100"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>

              <ErrorMsg message={errorsUser.password} />
            </div>

            <div>
              <SelectForm
                label="Rol"
                name="roleId"
                value={userData.roleId}
                onChange={handleUserChange}
              >
                <option value="">Seleccione...</option>

                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code}
                    </option>
                  ))
                ) : (
                  <option disabled>Cargando roles...</option>
                )}
              </SelectForm>

              <ErrorMsg message={errorsUser.roleId} />
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-between gap-3">
          <div>
            {step === 2 && (
              <Button variant="outline" onClick={handleBack}>
                Atrás
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>

            {step === 1 && (
              <Button
                onClick={handleNext}
                className="bg-brand-primary text-white"
              >
                Siguiente
              </Button>
            )}

            {step === 2 && (
              <Button
                onClick={handleSubmit}
                className="bg-brand-primary text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Registrar Usuario"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
