import { useId, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils"

export const InputForm = forwardRef(({ label, className, error, ...props }, ref) => {
  const id = useId()

  return (
    <div className='group relative w-full'>
      <label
        htmlFor={id}
        className={cn(
          "absolute top-0 left-3 z-10 block px-1 text-[10px] -translate-y-1/2 bg-white font-black uppercase tracking-widest transition-none",
          error ? "text-red-500" : "text-brand-primary"
        )}
      >
        <span className='bg-white inline-flex px-1 uppercase tracking-wider font-bold'>
          {label}
        </span>
      </label>
      <Input 
        id={id} 
        ref={ref} // ASIGNAR LA REF AQUÍ
        placeholder=' ' 
        className={cn(
          "h-14 rounded-2xl border-slate-200 bg-white text-slate-700 font-semibold focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm",
          error && "border-red-500 focus:border-red-500", // Borde rojo
          className
        )} 
        {...props} 
      />
      {/* Mostrar el mensaje de error */}
      {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-3 uppercase ">{error}</p>}
    </div>
  )
})
InputForm.displayName = "InputForm";