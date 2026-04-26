import { cn } from "@/lib/utils";

export function Label({ label, children, className }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-[11px] font-montserrat font-bold text-brand-primary tracking-wide uppercase">
        {label}
      </label>

      {children}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full bg-white border border-border rounded-cineflix px-3 py-2 text-sm font-montserrat",
        "focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary",
        className,
      )}
      {...props}
    />
  );
}

