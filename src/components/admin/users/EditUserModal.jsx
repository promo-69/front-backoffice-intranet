import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";
import { updateUserStatus, updateUserEmail } from "@/services/users.service";

// Gestión de la cuenta de acceso del empleado: correo + estado (activar/desactivar).
export default function EditUserModal({ open, onClose, user }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setStatus(user.status ?? 1);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
      // Solo llamamos a cada endpoint si el valor realmente cambió.
      const emailChanged = email.trim() && email.trim() !== (user.email || "");
      const statusChanged = Number(status) !== Number(user.status ?? 1);

      if (emailChanged) await updateUserEmail(user.id, email.trim());
      if (statusChanged) await updateUserStatus(user.id, status);

      onClose(true);
    } catch (e) {
      console.error("Error actualizando la cuenta del empleado:", e);
      setError(
        e?.response?.data?.message ||
          "No se pudo actualizar la cuenta. Intente de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <InputForm
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputForm
            label="Rol del Sistema"
            value={user?._Roles?.code || "—"}
            disabled
          />

          <SelectForm
            label="Estado"
            name="status"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </SelectForm>

          {error && (
            <p className="text-red-500 text-xs text-center font-bold">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <DisableIfNoPermission
            permission={"FEAT:DO:MANAGE_USERS"}
            title="No tienes permiso para gestionar cuentas"
          >
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
