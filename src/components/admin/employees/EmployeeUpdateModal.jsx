import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { TabsCustom } from "@/components/ui/TabsCustom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Check, ChevronsUpDown, Search } from "lucide-react";

import { cn as combineClassNames } from "@/lib/utils";

import {
  changeEmployeePosition,
  updateEmployee,
} from "@/services/employees.service";
import { getCinemas } from "@/services/cinema.service";

const GENDERS = [
  { value: "1", label: "Hombre" },
  { value: "2", label: "Mujer" },
  { value: "3", label: "Prefiero no decirlo" },
];

const JOB_POSITIONS = [
  { value: "1", label: "Gerente General" },
  { value: "2", label: "Supervisor de Turno" },
  { value: "3", label: "Cajero Junior" },
  { value: "4", label: "Operador de Dulcería" },
  { value: "5", label: "Personal de Mantenimiento" },
  { value: "6", label: "Jubilado" },
];

const emptyPersonalForm = {
  documentNumber: "",
  employeeCode: "",
  firstName: "",
  lastName: "",
  personalEmail: "",
  phoneNumber: "",
  birthDate: "",
  gender: "",
};

const DOCUMENT_NUMBER_REGEX = /^(?:[a-z]{0,2}-?)[0-9]{6,12}$/i;

const emptyPositionForm = {
  jobPosition: "",
  cinema: "",
  salaryBase: "",
  startDate: "",
};

function ErrorMsg({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

export default function EmployeeUpdateModal({ open, onClose, employee }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [cinemas, setCinemas] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(false);

  const [personalForm, setPersonalForm] = useState(emptyPersonalForm);
  const [positionForm, setPositionForm] = useState(emptyPositionForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Popovers y Buscadores
  const [openGender, setOpenGender] = useState(false);
  const [searchGender, setSearchGender] = useState("");

  const [openPosition, setOpenPosition] = useState(false);
  const [searchPosition, setSearchPosition] = useState("");

  const [openCinema, setOpenCinema] = useState(false);
  const [searchCinema, setSearchCinema] = useState("");

  // Búsqueda en API global sin límite de paginación
  const fetchCinemasFromAPI = useCallback(async (query = "") => {
    setLoadingCinemas(true);
    try {
      const response = await getCinemas({ 
        search: query.trim(),
        limit: 1000,
        page: 1,
        all: true 
      });

      const list = Array.isArray(response) 
        ? response 
        : response?.data || response?.cinemas || response?.results || [];

      const formattedCinemas = list.map((c) => ({
        id: String(c.id),
        name: c.name || c.nombre || `Sucursal ${c.id}`,
      }));

      setCinemas(formattedCinemas);
    } catch (error) {
      console.error("Error consultando sucursales:", error);
      setCinemas([]);
    } finally {
      setLoadingCinemas(false);
    }
  }, []);

  // Carga inicial de sucursales al abrir el modal o escribir en el buscador
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchCinemasFromAPI(searchCinema);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCinema, open, fetchCinemasFromAPI]);

  // Carga inicial y reset al abrir el modal
  useEffect(() => {
    if (!open) return;

    if (employee) {
      setPersonalForm({
        documentNumber:
          employee.people?.document_number || employee.person?.document_number || "",
        employeeCode:
          employee.employee?.employee_code || employee.employeeCode || "",
        firstName: employee.people?.first_name || employee.person?.first_name || "",
        lastName: employee.people?.last_name || employee.person?.last_name || "",
        personalEmail:
          employee.people?.personal_email || employee.person?.personal_email || employee._User?.email || employee.user?.email || "",
        phoneNumber:
          employee.people?.phone_number || employee.person?.phone_number || "",
        birthDate:
          employee.people?.birth_date || employee.person?.birth_date || "",
        gender: String(employee.people?.gender ?? employee.person?.gender ?? ""),
      });

      const rawCinemaId = typeof employee.cinema === "object" ? employee.cinema?.id : employee.cinema;

      setPositionForm({
        jobPosition: String(employee.job_position || employee.jobPosition || ""),
        cinema: rawCinemaId ? String(rawCinemaId) : "",
        salaryBase: String(employee.salary_base || employee.salaryBase || ""),
        startDate:
          (employee.start_date || employee.startDate || "").split("T")[0],
      });
    } else {
      setPersonalForm(emptyPersonalForm);
      setPositionForm(emptyPositionForm);
    }

    setErrors({});
    setActiveTab("personal");
    setSearchGender("");
    setSearchPosition("");
    setSearchCinema("");
  }, [open, employee]);

  const handlePersonalChange = (name, value) => {
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
  };

  const handlePositionChange = (name, value) => {
    setPositionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
  };

  // --- FILTROS LOCALES ---
  const filteredGenders = useMemo(() => {
    return GENDERS.filter((g) =>
      g.label.toLowerCase().includes(searchGender.toLowerCase())
    );
  }, [searchGender]);

  const filteredPositions = useMemo(() => {
    return JOB_POSITIONS.filter((p) =>
      p.label.toLowerCase().includes(searchPosition.toLowerCase())
    );
  }, [searchPosition]);

  // Se añade filtro local para sucursales para respuesta inmediata en la UI
  const filteredCinemas = useMemo(() => {
    return cinemas.filter((c) =>
      c.name.toLowerCase().includes(searchCinema.toLowerCase())
    );
  }, [cinemas, searchCinema]);

  // Helper Labels
  const getSelectedGenderLabel = () => {
    const found = GENDERS.find((g) => String(g.value) === String(personalForm.gender));
    return found ? found.label : "Seleccione género...";
  };

  const getSelectedPositionLabel = () => {
    const found = JOB_POSITIONS.find((p) => String(p.value) === String(positionForm.jobPosition));
    return found ? found.label : "Seleccione cargo...";
  };

  const getSelectedCinemaLabel = () => {
    const found = cinemas.find((c) => String(c.id) === String(positionForm.cinema));
    if (found) return found.name;
    if (positionForm.cinema) return `Sucursal (${positionForm.cinema})`;
    return "Seleccione sucursal...";
  };

  const validateField = (section, name, value) => {
    if (section === "personal") {
      if (!value || value.toString().trim() === "") {
        if (name !== "phoneNumber" && name !== "gender") {
          return "Este campo es obligatorio.";
        }
      }

      if (name === "documentNumber" && value) {
        if (!DOCUMENT_NUMBER_REGEX.test(value.trim())) {
          return "Documento inválido.";
        }
      }

      if (name === "employeeCode" && value) {
        if (value.toString().trim().length === 0) {
          return "El código del empleado es obligatorio.";
        }
      }

      if (name === "gender" && value) {
        if (!["1", "2", "3"].includes(String(value))) {
          return "Género inválido.";
        }
      }

      if (["firstName", "lastName"].includes(name)) {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (value && !regex.test(value)) return "Solo se permiten letras.";
      }

      if (name === "personalEmail" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Correo inválido.";
      }
    }

    if (section === "position") {
      if (name === "jobPosition" || name === "cinema") {
        if (!value || value.toString().trim() === "") return "Este campo es obligatorio.";
      }

      if (name === "salaryBase") {
        if (!value || Number(value) <= 0) return "El salario debe ser mayor a 0.";
      }

      if (name === "startDate") {
        if (!value) return "Este campo es obligatorio.";
      }
    }

    return "";
  };

  const validateAll = () => {
    const newErrors = {};

    ["documentNumber", "employeeCode", "firstName", "lastName", "personalEmail"].forEach((field) => {
      const error = validateField("personal", field, personalForm[field]);
      if (error) newErrors[field] = error;
    });

    ["jobPosition", "cinema", "salaryBase", "startDate"].forEach((field) => {
      const error = validateField("position", field, positionForm[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasPersonalChanges = () => {
    if (!employee) return false;
    return (
      personalForm.documentNumber.trim() !==
        (employee.people?.document_number || employee.person?.document_number || "").trim() ||
      personalForm.employeeCode.trim() !==
        (employee.employee?.code || employee.employeeCode || "").trim() ||
      personalForm.firstName.trim() !==
        (employee.people?.first_name || employee.person?.first_name || "").trim() ||
      personalForm.lastName.trim() !==
        (employee.people?.last_name || employee.person?.last_name || "").trim() ||
      personalForm.personalEmail.trim() !==
        (employee.people?.personal_email || employee.person?.personal_email || employee._User?.email || employee.user?.email || "").trim() ||
      personalForm.phoneNumber.trim() !==
        (employee.people?.phone_number || employee.person?.phone_number || "").trim() ||
      personalForm.birthDate !== (employee.people?.birth_date || employee.person?.birth_date || "") ||
      personalForm.gender !== String(employee.people?.gender ?? employee.person?.gender ?? "")
    );
  };

  const hasPositionChanges = () => {
    if (!employee) return false;
    const rawCinemaId = typeof employee.cinema === "object" ? employee.cinema?.id : employee.cinema;

    return (
      positionForm.jobPosition !== String(employee.job_position || employee.jobPosition || "") ||
      String(positionForm.cinema) !== String(rawCinemaId || "") ||
      String(positionForm.salaryBase) !== String(employee.salary_base || employee.salaryBase || "") ||
      positionForm.startDate !== (employee.start_date || employee.startDate || "").split("T")[0]
    );
  };

  const handleSubmit = async () => {
    if (!employee) return;

    const changesPersonal = hasPersonalChanges();
    const changesPosition = hasPositionChanges();

    if (!changesPersonal && !changesPosition) {
      setErrors({ general: "No se detectaron cambios." });
      return;
    }

    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      if (changesPersonal) {
        const payload = {
          documentNumber: personalForm.documentNumber.trim(),
          employeeCode: personalForm.employeeCode.trim(),
          firstName: personalForm.firstName.trim(),
          lastName: personalForm.lastName.trim(),
          email: personalForm.personalEmail.trim() || null,
          phoneNumber: personalForm.phoneNumber.trim() || null,
          birthDate: personalForm.birthDate || null,
          gender: personalForm.gender ? Number(personalForm.gender) : null,
        };

        await updateEmployee(employee.id, payload);
      }

      if (changesPosition) {
        const payload = {
          jobPosition: Number(positionForm.jobPosition),
          cinema: Number(positionForm.cinema),
          salaryBase: Number(positionForm.salaryBase),
          startDate: positionForm.startDate,
        };

        await changeEmployeePosition(employee.id, payload);
      }

      onClose(true);
    } catch (error) {
      console.error("Error actualizando empleado:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error?.response?.data?.message ||
          "Error al actualizar el empleado. Intente de nuevo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            Editar Empleado
          </DialogTitle>
        </DialogHeader>

        <TabsCustom
          tabs={[
            { id: "personal", label: "Datos personales" },
            { id: "cargo", label: "Datos del cargo" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="space-y-4 mt-4">
          {activeTab === "personal" ? (
            <>
              <InputForm
                label="Cédula"
                name="documentNumber"
                value={personalForm.documentNumber}
                onChange={(e) => handlePersonalChange("documentNumber", e.target.value)}
                placeholder="Ej: V-12345678"
                disabled={isSubmitting}
              />
              <ErrorMsg message={errors.documentNumber} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputForm
                    label="Código de Empleado"
                    name="employeeCode"
                    value={personalForm.employeeCode}
                    onChange={(e) => handlePersonalChange("employeeCode", e.target.value)}
                    placeholder="Ej: EMP-1234"
                    disabled={isSubmitting}
                  />
                  <ErrorMsg message={errors.employeeCode} />
                </div>

                <div>
                  <InputForm
                    label="Correo Personal"
                    name="personalEmail"
                    value={personalForm.personalEmail}
                    onChange={(e) => handlePersonalChange("personalEmail", e.target.value)}
                    placeholder="Ej: usuario@personal.com"
                    disabled={isSubmitting}
                  />
                  <ErrorMsg message={errors.personalEmail} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputForm
                    label="Nombre"
                    name="firstName"
                    value={personalForm.firstName}
                    onChange={(e) => handlePersonalChange("firstName", e.target.value)}
                    placeholder="Ej: Maria"
                    disabled={isSubmitting}
                  />
                  <ErrorMsg message={errors.firstName} />
                </div>

                <div>
                  <InputForm
                    label="Apellido"
                    name="lastName"
                    value={personalForm.lastName}
                    onChange={(e) => handlePersonalChange("lastName", e.target.value)}
                    placeholder="Ej: Pérez"
                    disabled={isSubmitting}
                  />
                  <ErrorMsg message={errors.lastName} />
                </div>
              </div>

              <InputForm
                label="Teléfono"
                name="phoneNumber"
                value={personalForm.phoneNumber}
                onChange={(e) => handlePersonalChange("phoneNumber", e.target.value)}
                placeholder="Ej: 04XX-XXXXXXX"
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* COMBOBOX GÉNERO */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-primary uppercase">
                    Género
                  </label>
                  <Popover open={openGender} onOpenChange={setOpenGender}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={isSubmitting}
                        aria-expanded={openGender}
                        className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                      >
                        <span className="truncate">
                          {getSelectedGenderLabel()}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[220px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2 z-[9999]"
                      align="start"
                    >
                      <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          className="w-full bg-transparent text-sm focus:outline-none py-1 text-slate-700"
                          value={searchGender}
                          onChange={(e) => setSearchGender(e.target.value)}
                        />
                      </div>

                      <div className="max-h-[180px] overflow-y-auto flex flex-col">
                        {filteredGenders.length === 0 ? (
                          <span className="p-2 text-xs text-slate-400 text-center">
                            Sin resultados.
                          </span>
                        ) : (
                          filteredGenders.map((g) => (
                            <button
                              type="button"
                              key={g.value}
                              onClick={() => {
                                handlePersonalChange("gender", g.value);
                                setOpenGender(false);
                              }}
                              className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                            >
                              <span className="truncate text-slate-700">
                                {g.label}
                              </span>
                              <Check
                                className={combineClassNames(
                                  "ml-2 h-4 w-4 text-brand-primary",
                                  String(personalForm.gender) === String(g.value)
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
                  <ErrorMsg message={errors.gender} />
                </div>

                <DatePickerCustom
                  label="Fecha de Nacimiento"
                  value={personalForm.birthDate}
                  clearable={false}
                  onChange={(iso) => handlePersonalChange("birthDate", iso)}
                  disabled={isSubmitting}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* COMBOBOX CARGO */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-primary uppercase">
                    Cargo
                  </label>
                  <Popover open={openPosition} onOpenChange={setOpenPosition}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={isSubmitting}
                        aria-expanded={openPosition}
                        className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                      >
                        <span className="truncate">
                          {getSelectedPositionLabel()}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[220px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2 z-[9999]"
                      align="start"
                    >
                      <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          className="w-full bg-transparent text-sm focus:outline-none py-1 text-slate-700"
                          value={searchPosition}
                          onChange={(e) => setSearchPosition(e.target.value)}
                        />
                      </div>

                      <div className="max-h-[180px] overflow-y-auto flex flex-col">
                        {filteredPositions.length === 0 ? (
                          <span className="p-2 text-xs text-slate-400 text-center">
                            Sin resultados.
                          </span>
                        ) : (
                          filteredPositions.map((p) => (
                            <button
                              type="button"
                              key={p.value}
                              onClick={() => {
                                handlePositionChange("jobPosition", p.value);
                                setOpenPosition(false);
                              }}
                              className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                            >
                              <span className="truncate text-slate-700">
                                {p.label}
                              </span>
                              <Check
                                className={combineClassNames(
                                  "ml-2 h-4 w-4 text-brand-primary",
                                  String(positionForm.jobPosition) === String(p.value)
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

                {/* COMBOBOX SUCURSAL */}
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
                        <span className="truncate flex items-center gap-2">
                          {getSelectedCinemaLabel()}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[220px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2 z-[9999]"
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
                        {loadingCinemas ? (
                          <div className="p-4 text-center flex justify-center items-center gap-2 text-xs text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                            Cargando...
                          </div>
                        ) : filteredCinemas.length === 0 ? (
                          <span className="p-2 text-xs text-slate-400 text-center">
                            Sin resultados.
                          </span>
                        ) : (
                          filteredCinemas.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => {
                                handlePositionChange("cinema", String(c.id));
                                setOpenCinema(false);
                              }}
                              className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                            >
                              <span className="truncate text-slate-700">
                                {c.name}
                              </span>
                              <Check
                                className={combineClassNames(
                                  "ml-2 h-4 w-4 text-brand-primary",
                                  String(positionForm.cinema) === String(c.id)
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

              <InputForm
                label="Salario Base"
                name="salaryBase"
                type="number"
                value={positionForm.salaryBase}
                onChange={(e) => handlePositionChange("salaryBase", e.target.value)}
                placeholder="Ej: 1200"
                disabled={isSubmitting}
              />
              <ErrorMsg message={errors.salaryBase} />

              <DatePickerCustom
                label="Fecha de Inicio"
                value={positionForm.startDate}
                clearable={false}
                onChange={(iso) => handlePositionChange("startDate", iso)}
                disabled={isSubmitting}
              />
              <ErrorMsg message={errors.startDate} />
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
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <DisableIfNoPermission
            permission="CRUD:UPDATE:EMPLOYEES"
            title="No tienes permiso para actualizar empleados"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}