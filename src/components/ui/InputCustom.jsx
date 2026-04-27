import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils"

export const InputCustom = ({ label, className, ...props }) => {
  const id = useId()

  return (
    <div className='group relative w-full'>
      <label
        htmlFor={id}
        className={cn(
          "absolute top-1/2 left-3 block -translate-y-1/2 cursor-text px-1 text-sm transition-all duration-200 pointer-events-none font-montserrat font-medium text-slate-400",
          // Cuando hay foco o hay contenido: sube al borde, cambia color y tamaño
          "group-focus-within:top-0 group-focus-within:text-xs group-focus-within:text-brand-primary",
          "has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:text-brand-primary"
        )}
      >
        <span className='bg-white inline-flex px-1 uppercase tracking-wider'>
          {label}
        </span>
      </label>
      <Input 
        id={id} 
        placeholder=' ' 
        className={cn(
          "h-14 rounded-2xl border-slate-200 bg-white text-slate-700 font-semibold focus:border-brand-primary focus:ring-0 transition-all shadow-sm",
          className
        )} 
        {...props} 
      />
    </div>
  )
}