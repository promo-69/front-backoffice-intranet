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
import { updateUserEmail, updateUserStatus } from "@/services/users.service";

export default function EditUserModal({ open, onClose, user }) {

  const [form, setForm] = useState({
    email: "",
    status: 1,
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        status: user.status ?? 1,
      });
    }
  }, [user]);

  
  if (!user) return null;

  const handleSubmit = async () => {
    try {
      await updateUserEmail(user.id, form.email);
      await updateUserStatus(user.id, form.status);
      onClose(true);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <InputForm
            label="Correo"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <InputForm
            label="Rol del Sistema"
            value={user?._Roles?.code || "—"}
            disabled
          />

          <SelectForm
            label="Estado"
            name="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </SelectForm>
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
