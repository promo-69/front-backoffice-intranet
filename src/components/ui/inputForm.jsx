import { cn } from "@/lib/utils";

export function InputForm({
  label,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* LABEL */}
      <label
        className="
          absolute 
          top-1 
          left-0 
          pl-2
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

      {/* INPUT */}
      <input
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
          focus:outline-none 
          focus:ring-2 
          focus:ring-brand-primary/40 
          focus:border-brand-primary
        `,
          inputClassName,
        )}
      />
    </div>
  );
}
