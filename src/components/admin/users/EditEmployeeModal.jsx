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
import { updateEmployeePosition } from "@/services/employees.service";

export default function EditEmployeeModal({ open, onClose, employee }) {
  const [form, setForm] = useState({
    jobPosition: "",
    cinema: "",
    salaryBase: "",
    startDate: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        jobPosition: employee.jobPosition || "",
        cinema: employee.cinema || "",
        salaryBase: employee.salaryBase || "",
        startDate: employee.startDate || "",
      });
    }
  }, [employee]);


  const handleSubmit = async () => {
    try {
      await updateEmployeePosition(employee.id, form);
      onClose(true);
    } catch (error) {
      console.error("Error actualizando empleado:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <SelectForm
            label="Cargo"
            name="jobPosition"
            value={form.jobPosition}
            onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
          >
            <option value="1">Administrador</option>
            <option value="2">Gerente</option>
            <option value="3">Cajero</option>
            <option value="4">Acomodador</option>
          </SelectForm>

          <SelectForm
            label="Sucursal"
            name="cinema"
            value={form.cinema}
            onChange={(e) => setForm({ ...form, cinema: e.target.value })}
          >
            <option value="1">Sucursal 1</option>
            <option value="2">Sucursal 2</option>
          </SelectForm>

          <InputForm
            label="Salario"
            name="salaryBase"
            value={form.salaryBase}
            onChange={(e) => setForm({ ...form, salaryBase: e.target.value })}
          />

          <InputForm
            label="Fecha de Inicio"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
