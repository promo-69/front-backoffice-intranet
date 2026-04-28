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

export function EditUserModal({ open, onClose, user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    branch: "",
    status: "true",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && user) {
      setFormData({
        fullName: user.nombre || "",
        email: user.correo || "",
        role: user.cargo || "",
        branch: user.sucursal || "",
        status: user.activo ? "true" : "false",
      });
      setErrors({});
    }
  }, [open, user]);

  const validateField = (name, value) => {
    if (!value || value.toString().trim() === "") return "Este campo es obligatorio.";
    
    if (name === "fullName") {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nameRegex.test(value)) return "Solo se permiten letras.";
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Correo inválido.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Empleado actualizado:", { ...formData, id: user.id });
    onClose();
  };

  const ErrorMsg = ({ message }) => (
    message ? <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{message}</p> : null
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Editar Empleado
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Modifique los datos del colaborador en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <InputForm label="Nombre completo" name="fullName" value={formData.fullName} onChange={handleChange} />
            <ErrorMsg message={errors.fullName} />
          </div>

          <div>
            <InputForm label="Correo electrónico" name="email" value={formData.email} onChange={handleChange} />
            <ErrorMsg message={errors.email} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SelectForm label="Rol" name="role" value={formData.role} onChange={handleChange}>
                <option value="CAJERO">Cajero</option>
                <option value="OPERADOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </SelectForm>
            </div>
            <div>
              <SelectForm label="Estado" name="status" value={formData.status} onChange={handleChange}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </SelectForm>
            </div>
          </div>

          <div>
            <SelectForm label="Sucursal" name="branch" value={formData.branch} onChange={handleChange}>
              <option value="Sucursal Centro">Sucursal Centro</option>
              <option value="Sucursal Norte">Sucursal Norte</option>
            </SelectForm>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-brand-primary text-white font-bold px-6">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}