import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import {
  validateEmail,
  validatePassword,
} from "../../validators/authValidators";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = (data) => {
    const payload = {
      email: data.email.trim(),
      password: data.password,
    };

    console.log("Simulando login con:", payload);

    // Simulación de login según correo
    if (payload.email === "admin@cine.com") {
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "admin", name: "Jennifer" }),
      );
      navigate("/admin/dashboard");
    } else {
      localStorage.setItem(
        "user",
        JSON.stringify({ role: "cashier", name: "Maria" }),
      );
      navigate("/ticketOffice/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="flex flex-col gap-8 items-center">
        {/* Email */}
        <div className="w-80">
          <input
            type="email"
            placeholder="Correo"
            {...register("email", {
              validate: (value) =>
                validateEmail(value) === true || validateEmail(value),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative w-80">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password", {
              validate: (value) =>
                validatePassword(value) === true || validatePassword(value),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/4 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <a
          href="/forgot-password"
          className="text-[#D9982F] text-sm opacity-80 hover:opacity-100"
        >
          ¿Olvidaste tu contraseña?
        </a>

        {/* Buttons */}
        <div className="w-full flex items-center justify-center gap-3 pt-4">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text="Iniciar sesión"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
    </form>
  );
}
