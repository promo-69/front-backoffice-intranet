import { forwardRef } from "react";
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils";

export const SelectForm = forwardRef(({
  label,
  className,
  selectClassName,
  children,
  error, 
  ...props
}, ref) => {
  return (
    <div className={cn("relative w-full group", className)}>
      {/* LABEL */}
      <label
        className={cn(
          "absolute top-0 left-3 z-10 block px-1 text-[10px] -translate-y-1/2 bg-white font-black uppercase tracking-widest transition-none",
          error ? "text-red-500" : "text-brand-primary"
        )}
      >
        {label}
      </label>

      {/* SELECT */}
      <select
        ref={ref} 
        {...props}
        className={cn(
          "w-full h-14 bg-white border rounded-2xl px-5 py-4  text-slate-700 font-montserrat appearance-none transition-all",
          
          error 
            ? "border-red-500 focus:ring-0 focus:border-red-500" 
            : " focus:ring-0 focus:border-r-purple-700",
          selectClassName
        )}
      >
        {children}
      </select>

      {/* ICONO */}
      <div className={cn("absolute inset-y-0 right-4 flex items-center pointer-events-none", error ? "text-red-500" : "text-slate-400")}>
         <ChevronDown  />
      </div>

      {/* MENSAJE DE ERROR */}
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">
          {error}
        </p>
      )}
    </div>
  );
});
SelectForm.displayName = "SelectForm";
