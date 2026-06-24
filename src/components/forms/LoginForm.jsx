import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { validateEmail, validatePassword } from "../../validators/authValidators";
import { Button } from "@/components/ui/button"; 
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ROUTE_PERMISSIONS } from "@/lib/route-permissions";
import { toast } from "sonner";


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setUser, logout } = useContext(AuthContext);

  // ==========================================
  // ESCUCHAR INTENTOS DE ACCESO NO AUTORIZADOS
  // ==========================================
  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error("Acceso denegado: No tienes permisos suficientes.", {
        id: "unauthorized-access-toast", 
        duration: 4000, 
        position: "top-center",
      });

      // Limpiamos cualquier rastro de sesión inválida en el cliente
      if (logout) logout();

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, logout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      const payload = { email: data.email.trim(), password: data.password };
      const result = await login(payload);

      if (result.success) {
        const role = result.user.role;

        // Guardamos el usuario en el AuthContext
        setUser({
          ...result.user,
          role,
        });

        // Derivar ruta de aterrizaje según permisos reales del backend
        const perms = new Set(
          (result.user.permissions || []).map((p) =>
            (p || "").toString().trim().toUpperCase(),
          ),
        );

        const getLanding = () => {
          if (role === "SUPER_ADMIN") return "/admin/dashboard";
          if (perms.has(ROUTE_PERMISSIONS.DASHBOARD_ADMIN))
            return "/admin/dashboard";
          if (perms.has(ROUTE_PERMISSIONS.EXHIBITION_READ))
            return "/admin/billboard";
          if (perms.has(ROUTE_PERMISSIONS.CATALOG_READ))
            return "/admin/catalogo";
          if (perms.has(ROUTE_PERMISSIONS.CINEMAS_READ))
            return "/admin/sucursales";
          if (perms.has(ROUTE_PERMISSIONS.PERSONAL_READ))
            return "/admin/personal";
          if (perms.has(ROUTE_PERMISSIONS.INVENTORY_READ))
            return "/admin/inventario";
          if (
            perms.has(ROUTE_PERMISSIONS.CASHIER_DASHBOARD) ||
            perms.has(ROUTE_PERMISSIONS.SELL_TICKETS) ||
            role === "CASHIER"
          )
            return "/ticketOffice/dashboard";
          if (
            perms.has(ROUTE_PERMISSIONS.FINANCES_READ) ||
            perms.has(ROUTE_PERMISSIONS.CURRENCIES_PAGE) ||
            perms.has(ROUTE_PERMISSIONS.RATES_PAGE) ||
            perms.has(ROUTE_PERMISSIONS.BANK_ACCOUNTS_PAGE)
          )
            return "/admin/finanzas";
          if (perms.has(ROUTE_PERMISSIONS.REPORTS_READ))
            return "/admin/reports";
          return null;
        };

        const landing = getLanding();
        console.log(
          "[LoginForm] role=",
          role,
          "perms=",
          Array.from(perms),
          "landing=",
          landing,
        );
        if (landing) navigate(landing);
        else setError(result.message || "Rol de usuario no reconocido");
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-6"
    >
      {/* Contenedor de Inputs */}
      <div className="flex flex-col gap-8 items-center">
        {error && (
          <div className="w-80 text-center bg-red-500/10 border border-red-500 text-red-500 text-sm py-2 px-3 rounded font-montserrat animate-fade-in">
            {error}
          </div>
        )}

        <div className="w-80">
          <input
            type="email"
            placeholder="Correo"
            {...register("email", {
              validate: (v) => validateEmail(v) === true || validateEmail(v),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="relative w-80">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            id="password"
            {...register("password", {
              validate: (v) =>
                validatePassword(v) === true || validatePassword(v),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10 py-1"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[-8px] top-[-4px] p-2 text-white text-xl opacity-80 hover:opacity-100 focus:outline-none"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Contenedor de Botones */}
      <div className=" flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="px-5 py-2.5 rounded-lg text-sm font-bold tracking-wider text-purple-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="px-6 py-2 bg-yellow-600 hover:brightness-110 active:scale-95 text-slate-200 font-bold text-sm  tracking-widest rounded-lg transition-all shadow-lg cursor-pointer disabled:opacity-50"
          disabled={isSubmitting}
        >
          Iniciar sesión
        </Button>
      </div>
    </form>
  );
}