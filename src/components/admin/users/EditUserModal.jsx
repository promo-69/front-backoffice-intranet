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
import { updateUserStatus, updateUserEmail, updateUserRole } from "@/services/users.service";
import { getRoles } from "@/services/roles.service";

// Gestión de la cuenta de acceso del empleado: correo + estado + rol.
export default function EditUserModal({ open, onClose, user }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(1);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setStatus(user.status ?? 1);
      setRole(String(user.role ?? ""));
    }
  }, [user]);

  useEffect(() => {
    if (!open) return;

    const loadRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data || []);
      } catch (err) {
        console.error("Error cargando los roles:", err);
        setRoles([]);
      }
    };

    loadRoles();
  }, [open]);

  if (!user) return null;

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
      // Solo llamamos a cada endpoint si el valor realmente cambió.
      const emailChanged = email.trim() && email.trim() !== (user.email || "");
      const statusChanged = Number(status) !== Number(user.status ?? 1);
      const roleChanged = String(role) !== String(user.role ?? "");

      if (emailChanged) await updateUserEmail(user.id, email.trim());
      if (statusChanged) await updateUserStatus(user.id, status);
      if (roleChanged) await updateUserRole(user.id, Number(role));

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

          <SelectForm
            label="Rol del Sistema"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Seleccione un rol</option>
            {roles.map((roleOption) => (
              <option key={roleOption.id} value={String(roleOption.id)}>
                {roleOption.name || roleOption.code || roleOption.description}
              </option>
            ))}
          </SelectForm>

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
