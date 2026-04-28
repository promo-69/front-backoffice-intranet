import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from "@/lib/utils"

export const SelectCustom = ({ label, placeholder, options = [], defaultValue, onValueChange, className }) => {
  const id = useId()

  return (
    <div className='group relative w-full'>
      <label
        htmlFor={id}
        className='absolute top-0 left-3 z-10 block -translate-y-1/2 bg-white px-1 text-[10px] font-normal uppercase tracking-widest text-slate-400 group-focus-within:text-brand-primary transition-colors'
      >
        {label}
      </label>
      <Select defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger 
          id={id} 
          className={cn(
            "h-14 w-full rounded-2xl border-slate-200 bg-white text-slate-700 font-semibold shadow-sm focus:ring-0 focus:border-brand-primary transition-all",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="rounded-2xl border-slate-100 bg-white shadow-2xl z-[100]">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value} 
              className="py-3 font-montserrat font-medium focus:bg-brand-gold/10 focus:text-brand-primary cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}