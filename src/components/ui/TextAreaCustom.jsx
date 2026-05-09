import { useId, forwardRef } from 'react'
import { cn } from "@/lib/utils"

export const TextAreaCustom = forwardRef(({ label, error, ...props }, ref) => {
 const id = useId()
  return (
    <div className='group relative w-full'>
      <label htmlFor={id} className={cn("absolute top-0 left-3 z-10 block -translate-y-1/2 bg-white px-1 text-[10px] font-black uppercase tracking-widest text-brand-primary transition-colors",
        error && "text-red-500"
      )}>
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        className={cn("flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold placeholder:text-muted-foreground",!error && "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50",
        error && "border-red-500 focus:border-red-500"
        )}
        {...props}
      />
    </div>
  )
})
TextAreaCustom.displayName = 'TextAreaCustom'