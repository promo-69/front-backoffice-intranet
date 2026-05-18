import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { validateEmail, validatePassword } from "../../validators/authValidators";
import { Button } from "@/components/ui/button"; // Importación corregida
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      const payload = { email: data.email.trim(), password: data.password };
      const result = await login(payload);

      if (result.success) {
        const role = result.user.roleCode;

        if (
          role === "ADMIN" ||
          role === "SUPER_ADMIN" ||
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
            {...register("password", { validate: (v) => validatePassword(v) === true || validatePassword(v) })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <a href="/forgot-password" size="sm" className="text-brand-gold text-sm opacity-80 hover:opacity-100">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Contenedor de Botones */}
      <div className="w-full flex items-center justify-center gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white font-bold px-8 rounded-cineflix"
          disabled={isSubmitting}
        >
          Iniciar sesión
        </Button>
      </div>
    </form>
  );
}