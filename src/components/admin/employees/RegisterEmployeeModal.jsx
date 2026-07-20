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
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { SelectForm } from "@/components/ui/SelectForm";
import { SelectCustom } from "@/components/ui/SelectCustom";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";

import {
  createEmployee,
  changeEmployeePosition,
} from "@/services/employees.service";
import { getCinemas } from "@/services/cinema.service";
import { getRoles } from "@/services/roles.service";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useLoading } from "@/context/LoadingContext";

function ErrorMsg({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyEmployeeForm = {
  documentNumber: "",
  firstName: "",
  lastName: "",
  jobPosition: "",
  cinema: "",
  startDate: "",
  salaryBase: "",
  email: "",
  password: "",
  role: "",
};

export default function RegisterEmployeeModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const [cinemas, setCinemas] = useState([]);
  const [roles, setRoles] = useState([]);
  const { showLoader, hideLoader } = useLoading();

  const [employeeData, setEmployeeData] = useState(emptyEmployeeForm);

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCinemas = async () => {
    try {
      const data = await getCinemas();
      setCinemas(data?.data?.rows ?? data?.data ?? []);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  // Cargar sucursales al abrir
  useEffect(() => {
    if (open) loadCinemas();
  }, [open]);

  //cargar roles
  useEffect(() => {
    async function loadRolesData() {
      try {
        const data = await getRoles();
        setRoles(data || []);
      } catch (err) {
        console.error(
          "Error al cargar los roles en el modal de empleados:",
          err,
        );
        setRoles([]);
      }
    }

    loadRolesData();
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mapeamos los datos basándonos en tu función normalizeEmployee
        setEmployeeData({
          documentNumber: initialData.people?.document_number || "",
          firstName: initialData.people?.first_name || "",
          lastName: initialData.people?.last_name || "",
          jobPosition: initialData.job_position || "",
          cinema: initialData.cinema || "",
          startDate: initialData.start_date
            ? initialData.start_date.split("T")[0]
            : "",
          salaryBase: initialData.salary_base || "",
          email: initialData._User?.email || "",
          password: "", // La contraseña no se precarga por seguridad
          role: initialData._User?._Roles?.code === "ADMINISTRADOR" ? "1" : "2", // Ajusta según tu mapeo de roles
        });
      } else {
        setEmployeeData(emptyEmployeeForm);
      }
      setErrors({});
    }
  }, [open, initialData]);

  // Validaciones
  const validateField = (name, value) => {
    // Si estamos editando, la contraseña puede ir vacía
    if (isEdit && name === "password" && !value) return "";

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

    if (!isEdit && name === "password" && value.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
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

  const handleSubmit = async () => {
    if (!validateAll()) return;

    setIsSubmitting(true);
    showLoader();

    try {
      if (isEdit) {
        // Payload específico para cambiar de posición (PATCH /employees/:id/position)
        const patchPayload = {
          jobPosition: Number(employeeData.jobPosition),
          cinema: Number(employeeData.cinema),
          salaryBase: Number(employeeData.salaryBase),
          startDate: employeeData.startDate,
        };

        await changeEmployeePosition(initialData.id, patchPayload);
      } else {
        // Payload de creación
        const postPayload = {
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

        await createEmployee(postPayload);
      }

      onClose(true); // Cierra informando al padre para detonar el SuccessModal
    } catch (error) {
      console.error("Error procesando empleado:", error);
      const status = error.response?.status;
      if (status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: "Este correo o documento ya existe.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Error al guardar los datos. Intente de nuevo.",
        }));
      }
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Cargo de Empleado" : "Registrar Empleado"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifique la asignación de sucursal, cargo o salario del empleado."
              : "Ingrese los datos de identidad y credenciales para el nuevo miembro."}
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
            disabled={isEdit}
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
                disabled={isEdit}
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
                disabled={isEdit}
              />
              <ErrorMsg message={errors.lastName} />
            </div>
          </div>

          {/* CARGO Y SUCURSAL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SelectCustom
                label="Cargo"
                placeholder="Seleccione..."
                value={employeeData.jobPosition}
                onValueChange={(val) => {
                  setEmployeeData((prev) => ({ ...prev, jobPosition: val }));
                  setErrors((prev) => ({
                    ...prev,
                    jobPosition: null,
                    general: null,
                  }));
                }}
                options={[
                  { value: "1", label: "Administrador" },
                  { value: "2", label: "Gerente" },
                  { value: "3", label: "Cajero" },
                  { value: "4", label: "Operador" },
                ]}
                error={errors.jobPosition}
              />
            </div>

            <div>
              <SelectCustom
                label="Sucursal"
                placeholder="Seleccione..."
                value={employeeData.cinema}
                onValueChange={(val) => {
                  setEmployeeData((prev) => ({ ...prev, cinema: val }));
                  setErrors((prev) => ({
                    ...prev,
                    cinema: null,
                    general: null,
                  }));
                }}
                options={cinemas.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                error={errors.cinema}
              />
            </div>
          </div>

          {/* FECHA DE INICIO */}
          <div>
            <DatePickerCustom
              label="Fecha de Inicio"
              value={employeeData.startDate}
              clearable={false}
              onChange={(iso) => {
                setEmployeeData((prev) => ({ ...prev, startDate: iso }));
                setErrors((prev) => ({
                  ...prev,
                  startDate: null,
                  general: null,
                }));
              }}
            />
            <ErrorMsg message={errors.startDate} />
          </div>

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

          {/* OCULTAR / DESHABILITAR SECCIONES DE AUTENTICACIÓN SI ES EDICIÓN */}
          {!isEdit && (
            <>
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
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </SelectForm>
                <ErrorMsg message={errors.role} />
              </div>
            </>
          )}

          {errors.general && (
            <p className="text-red-500 text-xs text-center font-bold mt-2">
              {errors.general}
            </p>
          )}
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <DisableIfNoPermission
            permission={
              isEdit ? "CRUD:UPDATE:EMPLOYEES" : "CRUD:CREATE:EMPLOYEES"
            }
            title="No tienes permiso para guardar empleados"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
            >
              {isSubmitting
                ? "Guardando..."
                : isEdit
                  ? "Actualizar"
                  : "Registrar Empleado"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
