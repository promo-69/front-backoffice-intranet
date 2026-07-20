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
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  createEmployee,
  changeEmployeePosition,
} from "@/services/employees.service";
import { getCinemas } from "@/services/cinema.service";
import { getRoles } from "@/services/roles.service";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function ErrorMsg({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase italic">
      * {message}
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

const jobPositions = [
  { id: "1", name: "Administrador" },
  { id: "2", name: "Gerente" },
  { id: "3", name: "Cajero" },
  { id: "4", name: "Operador" },
];

export default function RegisterEmployeeModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;

  // Listas de datos remotos
  const [cinemas, setCinemas] = useState([]);
  const [roles, setRoles] = useState([]);

  // Estados del formulario y UI
  const [employeeData, setEmployeeData] = useState(emptyEmployeeForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de control de Popovers
  const [openJobPosition, setOpenJobPosition] = useState(false);
  const [openCinema, setOpenCinema] = useState(false);
  const [openRole, setOpenRole] = useState(false);

  // Estados de búsqueda
  const [searchJobPosition, setSearchJobPosition] = useState("");
  const [searchCinema, setSearchCinema] = useState("");
  const [searchRole, setSearchRole] = useState("");

  // Estados de carga individual para las búsquedas remotas
  const [loadingCinema, setLoadingCinema] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  // --- BÚSQUEDA DINÁMICA CON LA API (DEBOUNCE) ---

  const fetchCinemas = async (query = "") => {
    setLoadingCinema(true);
    try {
      const data = await getCinemas({ search: query, limit: 50 });
      setCinemas(data.data || []);
    } catch (error) {
      console.error("Error al buscar sucursales:", error);
    } finally {
      setLoadingCinema(false);
    }
  };

  const fetchRoles = async (query = "") => {
    setLoadingRole(true);
    try {
      const data = await getRoles({ search: query, limit: 50 });
      setRoles(data || []);
    } catch (error) {
      console.error("Error al buscar roles:", error);
      setRoles([]);
    } finally {
      setLoadingRole(false);
    }
  };

  // Debounce para Sucursales
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchCinemas(searchCinema);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCinema, open]);

  // Debounce para Roles
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchRoles(searchRole);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchRole, open]);

  // Reset del formulario e inicialización
  useEffect(() => {
    if (open) {
      if (initialData) {
        setEmployeeData({
          documentNumber: initialData.people?.document_number || "",
          firstName: initialData.people?.first_name || "",
          lastName: initialData.people?.last_name || "",
          jobPosition: String(initialData.job_position || ""),
          cinema: String(initialData.cinema || ""),
          startDate: initialData.start_date
            ? initialData.start_date.split("T")[0]
            : "",
          salaryBase: initialData.salary_base || "",
          email: initialData._User?.email || "",
          password: "",
          role:
            initialData._User?._Roles?.code === "ADMINISTRADOR"
              ? "1"
              : String(initialData._User?._Roles?.id || "2"),
        });
      } else {
        setEmployeeData(emptyEmployeeForm);
      }
      setErrors({});
      setSearchJobPosition("");
      setSearchCinema("");
      setSearchRole("");
    }
  }, [open, initialData]);

  const validateField = (name, value) => {
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

  const handleSelectChange = (name, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      if (isEdit) {
        const patchPayload = {
          jobPosition: Number(employeeData.jobPosition),
          cinema: Number(employeeData.cinema),
          salaryBase: Number(employeeData.salaryBase),
          startDate: employeeData.startDate,
        };

        await changeEmployeePosition(initialData.id, patchPayload);
      } else {
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

      onClose(true);
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
      setIsSubmitting(false);
    }
  };

  // --- FILTROS DE CLIENTE SOBRE LOS RESULTADOS DE LA LISTA ---
  const filteredPositions = jobPositions.filter((pos) =>
    pos.name.toLowerCase().includes(searchJobPosition.toLowerCase())
  );

  const filteredCinemas = cinemas.filter((item) => {
    const text = (item.name || item.description || "").toLowerCase();
    return text.includes(searchCinema.toLowerCase());
  });

  const filteredRoles = roles.filter((r) => {
    const text = (r.name || r.code || "").toLowerCase();
    return text.includes(searchRole.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? null : () => onClose(false)}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-cineflix p-8 shadow-2xl font-montserrat">
        <button
          type="button"
          onClick={() => onClose(false)}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Cargo de Empleado" : "Registrar Empleado"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifique la asignación de sucursal, cargo o salario del empleado."
              : "Ingrese los datos de identidad y credenciales para el nuevo miembro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-left">
          {/* DOCUMENTO */}
          <div>
            <InputForm
              label="Cédula"
              name="documentNumber"
              value={employeeData.documentNumber}
              onChange={handleChange}
              placeholder="Ej: 123456789"
              disabled={isEdit || isSubmitting}
              error={errors.documentNumber}
            />
          </div>

          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm
                label="Nombre"
                name="firstName"
                value={employeeData.firstName}
                onChange={handleChange}
                placeholder="Ej: María"
                disabled={isEdit || isSubmitting}
                error={errors.firstName}
              />
            </div>

            <div>
              <InputForm
                label="Apellido"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                disabled={isEdit || isSubmitting}
                error={errors.lastName}
              />
            </div>
          </div>

          {/* CARGO Y SUCURSAL */}
          <div className="grid grid-cols-2 gap-4">
            {/* CARGO */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-primary uppercase">
                Cargo
              </label>
              <Popover open={openJobPosition} onOpenChange={setOpenJobPosition}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={isSubmitting}
                    aria-expanded={openJobPosition}
                    className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                  >
                    <span className="truncate">
                      {employeeData.jobPosition
                        ? jobPositions.find(
                            (pos) => String(pos.id) === String(employeeData.jobPosition)
                          )?.name
                        : "Seleccionar..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[190px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2"
                  align="start"
                >
                  <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar cargo..."
                      className="w-full bg-transparent text-sm focus:outline-none py-1 text-slate-700"
                      value={searchJobPosition}
                      onChange={(e) => setSearchJobPosition(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[180px] overflow-y-auto flex flex-col">
                    {filteredPositions.length === 0 ? (
                      <span className="p-2 text-xs text-slate-400 text-center">
                        Sin resultados.
                      </span>
                    ) : (
                      filteredPositions.map((pos) => (
                        <button
                          type="button"
                          key={pos.id}
                          onClick={() => {
                            handleSelectChange("jobPosition", String(pos.id));
                            setOpenJobPosition(false);
                          }}
                          className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                        >
                          <span className="truncate text-slate-700">{pos.name}</span>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 text-brand-primary",
                              String(employeeData.jobPosition) === String(pos.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <ErrorMsg message={errors.jobPosition} />
            </div>

            {/* SUCURSAL */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-primary uppercase">
                Sucursal
              </label>
              <Popover open={openCinema} onOpenChange={setOpenCinema}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={isSubmitting}
                    aria-expanded={openCinema}
                    className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                  >
                    <span className="truncate">
                      {employeeData.cinema
                        ? cinemas.find(
                            (c) => String(c.id) === String(employeeData.cinema)
                          )?.name ||
                          cinemas.find(
                            (c) => String(c.id) === String(employeeData.cinema)
                          )?.description
                        : "Seleccionar..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[190px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2"
                  align="start"
                >
                  <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar sucursal..."
                      className="w-full bg-transparent text-sm focus:outline-none py-1 text-slate-700"
                      value={searchCinema}
                      onChange={(e) => setSearchCinema(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[180px] overflow-y-auto flex flex-col">
                    {loadingCinema ? (
                      <div className="p-4 text-center flex justify-center items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                      </div>
                    ) : filteredCinemas.length === 0 ? (
                      <span className="p-2 text-xs text-slate-400 text-center">
                        Sin resultados.
                      </span>
                    ) : (
                      filteredCinemas.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            handleSelectChange("cinema", String(item.id));
                            setOpenCinema(false);
                          }}
                          className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                        >
                          <span className="truncate text-slate-700">
                            {item.name || item.description}
                          </span>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 text-brand-primary",
                              String(employeeData.cinema) === String(item.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <ErrorMsg message={errors.cinema} />
            </div>
          </div>

          {/* FECHA INICIO Y SALARIO BASE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePickerCustom
                label="Fecha de Inicio"
                value={employeeData.startDate}
                onChange={(iso) => {
                  setEmployeeData((prev) => ({ ...prev, startDate: iso }));
                  setErrors((prev) => ({ ...prev, startDate: null }));
                }}
                disabled={isSubmitting}
              />
              <ErrorMsg message={errors.startDate} />
            </div>

            <div>
              <InputForm
                label="Salario Base ($)"
                name="salaryBase"
                type="number"
                value={employeeData.salaryBase}
                onChange={handleChange}
                placeholder="0.00"
                disabled={isSubmitting}
                error={errors.salaryBase}
              />
            </div>
          </div>

          {/* CORREO Y ROL */}
          {!isEdit && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputForm
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={employeeData.email}
                    onChange={handleChange}
                    placeholder="usuario@cineflix.com"
                    disabled={isSubmitting}
                    error={errors.email}
                  />
                </div>

                {/* ROL DE USUARIO */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-primary uppercase">
                    Rol de Usuario
                  </label>
                  <Popover open={openRole} onOpenChange={setOpenRole}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={isSubmitting}
                        aria-expanded={openRole}
                        className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                      >
                        <span className="truncate">
                          {employeeData.role
                            ? roles.find(
                                (r) => String(r.id) === String(employeeData.role)
                              )?.name ||
                              roles.find(
                                (r) => String(r.id) === String(employeeData.role)
                              )?.code
                            : "Seleccionar..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[190px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2"
                      align="start"
                    >
                      <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar rol..."
                          className="w-full bg-transparent text-sm focus:outline-none py-1 text-slate-700"
                          value={searchRole}
                          onChange={(e) => setSearchRole(e.target.value)}
                        />
                      </div>

                      <div className="max-h-[180px] overflow-y-auto flex flex-col">
                        {loadingRole ? (
                          <div className="p-4 text-center flex justify-center items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                          </div>
                        ) : filteredRoles.length === 0 ? (
                          <span className="p-2 text-xs text-slate-400 text-center">
                            Sin resultados.
                          </span>
                        ) : (
                          filteredRoles.map((r) => (
                            <button
                              type="button"
                              key={r.id}
                              onClick={() => {
                                handleSelectChange("role", String(r.id));
                                setOpenRole(false);
                              }}
                              className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                            >
                              <span className="truncate text-slate-700">
                                {r.name || r.code}
                              </span>
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4 text-brand-primary",
                                  String(employeeData.role) === String(r.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <ErrorMsg message={errors.role} />
                </div>
              </div>

              {/* CONTRASEÑA */}
              <div className="relative">
                <InputForm
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={employeeData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-brand-primary"
                >
                  {showPassword ? (
                    <AiFillEyeInvisible size={20} />
                  ) : (
                    <AiFillEye size={20} />
                  )}
                </button>
              </div>
            </>
          )}

          {errors.general && (
            <p className="text-[11px] text-red-500 font-bold uppercase text-center mt-2 italic">
              * {errors.general}
            </p>
          )}

          {/* FOOTER */}
          <DialogFooter className="pt-6 border-t flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
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
                type="submit"
                className="bg-brand-primary text-white font-bold px-6 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : isEdit ? (
                  "Guardar Cambios"
                ) : (
                  "Registrar Empleado"
                )}
              </Button>
            </DisableIfNoPermission>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}