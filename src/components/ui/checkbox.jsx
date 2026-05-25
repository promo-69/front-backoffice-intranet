import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        onClick={() => onChange && onChange(!checked)}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 shadow-sm transition-all",
          checked ? "bg-brand-primary border-brand-primary" : "bg-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50",
          className,
        )}
        {...props}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
