import { useId, forwardRef } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from "@/lib/utils"

/**
 * SelectCustom - Componente reutilizable basado en Shadcn UI
 * @param {string} label - Texto del label superior
 * @param {string} placeholder - Texto cuando no hay selección
 * @param {Array} options - [{ value: "1", label: "Opción 1" }]
 * @param {string} error - Mensaje de error para validaciones
 * @param {function} onValueChange - Callback para capturar el valor
 */
export const SelectCustom = forwardRef(({ 
  label, 
  placeholder, 
  options = [], 
  defaultValue, 
  onValueChange, 
  value,
  error,
  className,
  ...props 
}, ref) => {
  const id = useId()

  return (
    <div className={cn('group relative w-full space-y-1', className)}>
      {/* Label con el estilo minimalista de tu proyecto */}
      {label && (
        <label
          htmlFor={id}
          className='block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1 ml-1 font-montserrat'
        >
          {label}
        </label>
      )}

      <Select 
        defaultValue={defaultValue?.toString()} 
        onValueChange={onValueChange}
        value={value?.toString()}
        {...props}
      >
        <SelectTrigger 
          id={id}
          ref={ref}
          className={cn(
            'w-full h-11 rounded-xl bg-gray-50/50 border-gray-100 font-montserrat text-sm transition-all focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40',
            error && "border-red-500 bg-red-50/30 focus:ring-red-500/10",
            !value && "text-muted-foreground"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent className="bg-white z-[110] rounded-xl shadow-xl border-gray-100">
          {options.length > 0 ? (
            options.map((opt) => (
              <SelectItem  
                key={opt.value}
                value={opt.value.toString()} 
                className="font-montserrat text-sm py-2.5 focus:bg-brand-primary/10 focus:text-brand-primary cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-4 text-center text-[10px] text-gray-400 uppercase font-bold">
              Sin opciones
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Mensaje de Error dinámico */}
      {error && (
        <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
})

SelectCustom.displayName = "SelectCustom"