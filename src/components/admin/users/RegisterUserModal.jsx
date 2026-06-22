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
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

import { createUser, getRoles } from "@/services/users.service";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function RegisterUserModal({ open, onClose }) {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    roleId: "",
  });

  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ⭐ Reset al abrir/cerrar
  useEffect(() => {
    if (!open) {
      setUserData({
        email: "",
        password: "",
        roleId: "",
      });
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    // ⭐ Cargar roles
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error cargando roles:", error);
      }
    };

    fetchRoles();
  }, [open]);

  // ⭐ Validaciones
  const validateField = (name, value) => {
    if (!value || value.toString().trim() === "")
      return "Este campo es obligatorio.";

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Correo inválido.";
    }

    if (name === "password") {
      if (value.length < 8)
        return "La contraseña debe tener al menos 8 caracteres.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(userData).forEach((key) => {
      const err = validateField(key, userData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⭐ SUBMIT
  const handleSubmit = async () => {
    if (!validateAll()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        email: userData.email,
        password: userData.password,
        roleId: Number(userData.roleId),
      };

      await createUser(payload);

      onClose(true);
    } catch (error) {
      console.error("Error registrando usuario:", error);
      setIsSubmitting(false);
    }
  };

  const ErrorMsg = ({ message }) =>
    message ? (
      <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">
        {message}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition"
        >
          ✕
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Crear Usuario de Acceso
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure el usuario del sistema (correo, contraseña y rol).
          </DialogDescription>
        </DialogHeader>

        {/* FORMULARIO */}
        <div className="space-y-4 mt-4">
          {/* EMAIL */}
          <div>
            <InputForm
              label="Correo electrónico"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Ej: usuario@cineflix.com"
            />
            <ErrorMsg message={errors.email} />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <InputForm
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={userData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 -translate-y-1/2 text-gray-600 text-xl opacity-80 hover:opacity-100"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>

            <ErrorMsg message={errors.password} />
          </div>

          {/* ROLE */}
          <div>
            <SelectForm
              label="Rol"
              name="roleId"
              value={userData.roleId}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>

              {roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}
                  </option>
                ))
              ) : (
                <option disabled>Cargando roles...</option>
              )}
            </SelectForm>

            <ErrorMsg message={errors.roleId} />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>

          <DisableIfNoPermission permission={"CRUD:CREATE:USERS"} title="No tienes permiso para registrar usuarios">
            <Button
              onClick={handleSubmit}
              className="bg-brand-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Registrar Usuario"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
