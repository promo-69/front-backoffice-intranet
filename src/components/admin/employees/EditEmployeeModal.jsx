import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { SelectForm } from "@/components/ui/SelectForm";
import { InputForm } from "@/components/ui/inputForm";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

import { changeEmployeePosition } from "@/services/employees.service";
import { getCinemas } from "@/services/cinema.service";

export default function EditEmployeeModal({ open, onClose, employee }) {
  const [cinemas, setCinemas] = useState([]);

  const [form, setForm] = useState({
    jobPosition: "",
    cinema: "",
    salaryBase: "",
    startDate: "",
  });

  // Cargar sucursales
  const loadCinemas = async () => {
    try {
      const data = await getCinemas();
      setCinemas(data.data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  // Cargar datos del empleado
  useEffect(() => {
    if (employee) {
      setForm({
        jobPosition: employee.job_position || employee.jobPosition || "",
        cinema: employee.cinema || "",
        salaryBase: employee.salary_base || employee.salaryBase || "",
        startDate: (employee.start_date || employee.startDate || "").split(
          "T",
        )[0],
      });
    }
  }, [employee]);

  // Cargar sucursales al abrir
  useEffect(() => {
    if (open) loadCinemas();
  }, [open]);

  const handleSubmit = async () => {
    try {
      const payload = {
        jobPosition: Number(form.jobPosition),
        cinema: Number(form.cinema),
        startDate: form.startDate,
        salaryBase: Number(form.salaryBase),
      };

      await changeEmployeePosition(employee.id, payload);

      onClose(true);
    } catch (error) {
      console.error("Error actualizando empleado:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            Editar Empleado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <SelectForm
            label="Cargo"
            name="jobPosition"
            value={form.jobPosition}
            onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
          >
            <option value="">Seleccione...</option>
            <option value="1">Administrador</option>
            <option value="2">Gerente</option>
            <option value="3">Cajero</option>
            <option value="4">Operador</option>
          </SelectForm>

          <SelectForm
            label="Sucursal"
            name="cinema"
            value={form.cinema}
            onChange={(e) => setForm({ ...form, cinema: e.target.value })}
          >
            <option value="">Seleccione...</option>
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectForm>

          <InputForm
            label="Salario Base"
            name="salaryBase"
            type="number"
            value={form.salaryBase}
            onChange={(e) => setForm({ ...form, salaryBase: e.target.value })}
          />

          <DatePickerCustom
            label="Fecha de Inicio"
            value={form.startDate}
            clearable={false}
            onChange={(iso) => setForm({ ...form, startDate: iso })}
          />
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>

          <DisableIfNoPermission
            permission={"CRUD:UPDATE:EMPLOYEES"}
            title="No tienes permiso para actualizar empleados"
          >
            <Button
              onClick={handleSubmit}
              className="bg-brand-primary text-white"
            >
              Guardar Cambios
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
