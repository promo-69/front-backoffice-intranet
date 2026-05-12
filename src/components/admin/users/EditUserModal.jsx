import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";

import { updateUser, getRoles } from "@/services/users.service";

export function EditUserModal({ open, onClose, user }) {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    email: "",
    role: "",
    status: 1,
  });

  // Cargar roles desde backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error cargando roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        role: user.role ? String(user.role) : "",
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        email: form.email,
        role: Number(form.role),
        status: Number(form.status),
      };

      await updateUser(user.id, payload);
      onClose(true);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-brand-primary">
            Editar Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <InputForm
            label="Nombre"
            value={user?._People?.first_name || ""}
            disabled
          />

          <InputForm
            label="Apellido"
            value={user?._People?.last_name || ""}
            disabled
          />

          <InputForm
            label="Correo"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <SelectForm
            label="Rol"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.code}
              </option>
            ))}
          </SelectForm>

          <SelectForm
            label="Estado"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </SelectForm>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>

          <Button
            className="bg-brand-primary text-white"
            onClick={handleSubmit}
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
