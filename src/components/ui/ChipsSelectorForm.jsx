import { useId, forwardRef } from 'react'
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const ChipsSelectorForm = forwardRef(({ 
  label, 
  genresList = [], 
  selectedGenres = [], 
  error, 
  registerProps,
  className 
}, ref) => {
  const id = useId()

  return (
    <div className='group relative w-full' id={id}>
      <label
        className={cn(
          "absolute top-0 left-3 z-10 block px-1 text-[10px] -translate-y-1/2 bg-white font-black uppercase tracking-widest transition-none",
          error ? "text-red-500" : "text-brand-primary"
        )}
      >
        <span className='bg-white inline-flex px-1 uppercase tracking-wider font-bold'>
          {label}
        </span>
      </label>

      {/* Contenedor */}
      <div 
        className={cn(
          "min-h-14 py-3 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all shadow-sm flex flex-wrap gap-2 items-center",
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20",
          !error && "focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/50",
          className
        )}
      >
        {genresList.map((genre) => {
          const isChecked = selectedGenres.includes(genre.id.toString());
          
          return (
            <label 
              key={genre.id}
              className={cn(
                "cursor-pointer px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 border transition-all select-none",
                isChecked
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-brand-primary/40"
              )}
            >
              <input 
                type="checkbox" 
                value={genre.id} 
                className="hidden" 
                ref={ref} 
                {...registerProps} 
              />
              {isChecked && <Check className="w-3 h-3" />}
              {genre.description}
            </label>
          )
        })}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 ml-3 uppercase italic">
          * {error}
        </p>
      )}
    </div>
  )
})

ChipsSelectorForm.displayName = "ChipsSelectorForm";