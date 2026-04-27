import { cn } from "@/lib/utils";

export function SelectForm({
  label,
  className,
  selectClassName,
  children,
  ...props
}) {
  return (
    <div className={cn("relative w-full px-2", className)}>
      {/* LABEL */}
      <label
        className="
          absolute 
          top-1
          left-4
          text-[11px] 
          font-montserrat 
          font-bold 
          text-brand-primary 
          tracking-wide 
          uppercase
        "
      >
        {label}
      </label>

      {/* SELECT */}
      <select
        {...props}
        className={cn(
          `
          w-full 
          bg-white 
          border 
          border-border 
          rounded-cineflix 
          px-3 
          pt-6 
          pb-2 
          text-sm 
          font-montserrat
          appearance-none
          focus:outline-none 
          focus:ring-2 
          focus:ring-brand-primary/40 
          focus:border-brand-primary
        `,
          selectClassName,
        )}
      >
        {children}
      </select>

      {/* ICONO ▼ */}
      <div
        className="
          pointer-events-none 
          absolute 
          right-5 
          top-[40%] 
          translate-y-[-10%]
          text-gray-400
        "
      >
        ▼
      </div>
    </div>
  );
}
