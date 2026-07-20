import { useEffect, useState } from "react";
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
import { SelectForm } from "@/components/ui/SelectForm";
import { SelectCustom } from "@/components/ui/SelectCustom";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { TabsCustom } from "@/components/ui/TabsCustom";

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

  const [personalForm, setPersonalForm] = useState(emptyPersonalForm);
  const [positionForm, setPositionForm] = useState(emptyPositionForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
    console.log(employee);
  const loadCinemas = async () => {
    try {
      const data = await getCinemas();
      setCinemas(data.data || []);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
      setCinemas([]);
    }
  };

  useEffect(() => {
    if (open) loadCinemas();
  }, [open]);

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

      setPositionForm({
        jobPosition: employee.job_position || employee.jobPosition || "",
        cinema: employee.cinema || "",
        salaryBase: employee.salary_base || employee.salaryBase || "",
        startDate:
          (employee.start_date || employee.startDate || "").split("T")[0],
      });
    } else {
      setPersonalForm(emptyPersonalForm);
      setPositionForm(emptyPositionForm);
    }

    setErrors({});
    setActiveTab("personal");
  }, [open, employee]);

  const handlePersonalChange = (name, value) => {
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
  };

  const handlePositionChange = (name, value) => {
    setPositionForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
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
    return (
      positionForm.jobPosition !== (employee.job_position || employee.jobPosition || "") ||
      String(positionForm.cinema) !== String(employee.cinema || "") ||
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
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectCustom
                  label="Género"
                  placeholder="Seleccione..."
                  value={personalForm.gender}
                  onValueChange={(val) => handlePersonalChange("gender", val)}
                  options={GENDERS}
                />

                <DatePickerCustom
                  label="Fecha de Nacimiento"
                  value={personalForm.birthDate}
                  clearable={false}
                  onChange={(iso) => handlePersonalChange("birthDate", iso)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SelectCustom
                    label="Cargo"
                    placeholder="Seleccione..."
                    value={positionForm.jobPosition}
                    onValueChange={(val) => handlePositionChange("jobPosition", val)}
                    options={JOB_POSITIONS}
                  />
                  <ErrorMsg message={errors.jobPosition} />
                </div>

                <div>
                  <SelectForm
                    label="Sucursal"
                    name="cinema"
                    value={positionForm.cinema}
                    onChange={(e) => handlePositionChange("cinema", e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    {cinemas.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </SelectForm>
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
              />
              <ErrorMsg message={errors.salaryBase} />

              <DatePickerCustom
                label="Fecha de Inicio"
                value={positionForm.startDate}
                clearable={false}
                onChange={(iso) => handlePositionChange("startDate", iso)}
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
          <Button variant="outline" onClick={() => onClose(false)} className="flex-1">
            Cancelar
          </Button>
          <DisableIfNoPermission
            permission="CRUD:UPDATE:EMPLOYEES"
            title="No tienes permiso para actualizar empleados"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
