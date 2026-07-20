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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Check, ChevronsUpDown, Search } from "lucide-react";

import { cn as combineClassNames } from "@/lib/utils";

import {
  updateUserStatus,
  updateUserEmail,
  updateUserRole,
} from "@/services/users.service";
import { getRoles } from "@/services/roles.service";

// Gestión de la cuenta de acceso del empleado: correo + estado + rol.
export default function EditUserModal({ open, onClose, user }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(1);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Estados para Popover y Buscador de Roles
  const [openRole, setOpenRole] = useState(false);
  const [searchRole, setSearchRole] = useState("");
  const [loadingRole, setLoadingRole] = useState(false);

  // Carga e inicialización al abrir el modal o cambiar el usuario
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setStatus(user.status ?? 1);
      setRole(String(user.role ?? ""));
    }
    setSearchRole("");
    setError("");
  }, [user, open]);

  // --- BÚSQUEDA DINÁMICA DE ROLES CON LA API (DEBOUNCE) ---
  const fetchRoles = async (query = "") => {
    setLoadingRole(true);
    try {
      const data = await getRoles({ search: query, limit: 50 });
      setRoles(data || []);
    } catch (err) {
      console.error("Error cargando los roles:", err);
      setRoles([]);
    } finally {
      setLoadingRole(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchRoles(searchRole);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchRole, open]);

  // --- FILTRO LOCAL DE RESPALDO SOBRE LA LISTA DE ROLES ---
  const filteredRoles = roles.filter((r) => {
    const text = (r.name || r.code || r.description || "").toLowerCase();
    return text.includes(searchRole.toLowerCase());
  });

  if (!user) return null;

  // Función para obtener la etiqueta del rol seleccionado
  const getSelectedRoleLabel = () => {
    const selected = roles.find((r) => String(r.id) === String(role));
    if (selected) {
      return selected.name || selected.code || selected.description;
    }
    // Si ya terminó de cargar y realmente no tiene rol asignado
    return "Seleccione un rol...";
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
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
          "No se pudo actualizar la cuenta. Intente de nuevo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary uppercase">
            Editar Empleado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 text-left">
          {/* CORREO */}
          <InputForm
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving}
          />

          {/* ROL DEL SISTEMA (COMBOBOX CON BUSCADOR E INDICADOR DE CARGA) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-primary uppercase">
              Rol del Sistema
            </label>
            <Popover open={openRole} onOpenChange={setOpenRole}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={isSaving || (loadingRole && roles.length === 0)}
                  aria-expanded={openRole}
                  className="w-full justify-between bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 font-normal text-left"
                >
                  <span className="truncate flex items-center gap-2">
                    {/* Indicador visual mientras carga la lista inicial */}
                    {loadingRole && roles.length === 0 ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                        <span className="text-slate-400 italic">
                          Cargando roles...
                        </span>
                      </>
                    ) : (
                      getSelectedRoleLabel()
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[380px] p-2 bg-white shadow-xl rounded-md border flex flex-col gap-2"
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
                    <div className="p-4 text-center flex justify-center items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                      Cargando opciones...
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
                          setRole(String(r.id));
                          setOpenRole(false);
                        }}
                        className="w-full text-left cursor-pointer hover:bg-slate-100 p-2 text-sm flex items-center justify-between rounded-md transition-colors"
                      >
                        <span className="truncate text-slate-700">
                          {r.name || r.code || r.description}
                        </span>
                        <Check
                          className={combineClassNames(
                            "ml-2 h-4 w-4 text-brand-primary",
                            String(role) === String(r.id)
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
          </div>

          {/* ESTADO */}
          <SelectForm
            label="Estado"
            name="status"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            disabled={isSaving}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </SelectForm>

          {error && (
            <p className="text-red-500 text-xs text-center font-bold uppercase italic mt-2">
              * {error}
            </p>
          )}
        </div>

        <DialogFooter className="pt-4 border-t flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <DisableIfNoPermission
            permission={"FEAT:DO:MANAGE_USERS"}
            title="No tienes permiso para gestionar cuentas"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-brand-primary text-white font-bold px-6 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}