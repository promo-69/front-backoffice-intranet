import { forwardRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const CustomCombobox = forwardRef(({
  label,
  className,
  buttonClassName,
  options = [], 
  value,
  onSelect,
  placeholder = "Seleccionar opción...",
  error,
  disabled = false,
  ...props
}, ref) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Encontrar el texto de la opción seleccionada actualmente
  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Filtrar las opciones localmente según lo que escriba el usuario
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative w-full group text-left", className)}>
      <label
        className={cn(
          "absolute top-0 left-3 z-10 block px-1 text-[10px] -translate-y-1/2 bg-white font-black uppercase tracking-widest transition-none",
          error ? "text-red-500" : "text-brand-primary"
        )}
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={(isOpen) => {
        if (!disabled) {
          setOpen(isOpen);
          if (!isOpen) setSearchQuery(""); // Limpiar buscador al cerrar
        }
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            ref={ref}
            {...props}
            className={cn(
              "w-full h-14 bg-white border rounded-2xl px-5 py-4 text-slate-700 font-montserrat text-left flex items-center justify-between transition-all outline-none",
              error 
                ? "border-red-500" 
                : "border-slate-200 focus:border-brand-primary",
              disabled && "bg-slate-50 opacity-60 cursor-not-allowed",
              buttonClassName
            )}
          >
            {/* Texto seleccionado o Placeholder */}
            <span className={cn("truncate", !selectedLabel && "text-slate-400 font-light")}>
              {selectedLabel || placeholder}
            </span>

            {/* ICONO FLOTANTE */}
            <div className={cn("text-slate-400 shrink-0 ml-2", error && "text-red-500")}>
              <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", open && "transform rotate-180")} />
            </div>
          </button>
        </PopoverTrigger>

        {/* CONTENIDO DEL DESPLEGABLE */}
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 font-montserrat"
          align="start"
        >
          {/* BUSCADOR INTERNO NATIVO */}
          <div className="flex items-center border-b border-slate-100 px-4 bg-slate-50/50">
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 font-normal"
            />
          </div>

          {/* LISTA DE OPCIONES */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-5 py-3 text-sm text-slate-400 font-light text-center">
                No se encontraron resultados
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    onClick={() => {
                      onSelect(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "px-5 py-3 text-sm text-slate-600 cursor-pointer flex items-center justify-between transition-colors font-normal hover:bg-slate-50",
                      isSelected && "bg-brand-primary/5 text-brand-primary font-semibold"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-brand-primary shrink-0 ml-2" />}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {/* MENSAJE DE ERROR */}
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase">
          {error}
        </p>
      )}
    </div>
  );
});

CustomCombobox.displayName = "CustomCombobox";