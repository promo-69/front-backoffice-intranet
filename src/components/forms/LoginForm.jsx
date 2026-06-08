import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { validateEmail, validatePassword } from "../../validators/authValidators";
import { Button } from "@/components/ui/button"; 
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/*const ROLE_MAP = {
  1: "SUPER_ADMIN",
  2: "GENERAL_MANAGER",
  3: "CINEMA_MANAGER",
  4: "CASHIER",
  5: "USHER",
};*/

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, setUser } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });

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

        // Navegación según rol

        if (
          role === "SUPER_ADMIN" ||
          role === "GENERAL_MANAGER" ||
          role === "CINEMA_MANAGER" ||
          role === "USHER"
        ) {
          navigate("/admin/dashboard");
        } else if (role === "CASHIER") {
          navigate("/ticketOffice/dashboard");
        } else {
          setError("Rol de usuario no reconocido");
        }
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center gap-6">
      
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
            {...register("email", { validate: (v) => validateEmail(v) === true || validateEmail(v) })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="relative w-80">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            id="password"
            {...register("password", { validate: (v) => validatePassword(v) === true || validatePassword(v) })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10 py-1"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[-8px] top-[-4px] p-2 text-white text-xl opacity-80 hover:opacity-100 focus:outline-none"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
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