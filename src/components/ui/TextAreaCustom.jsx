import { useId } from 'react'
export const TextAreaCustom = ({ label, ...props }) => {
 const id = useId()
  return (
    <div className='group relative w-full'>
      <label htmlFor={id} className='absolute top-0 left-3 z-10 block -translate-y-1/2 bg-white px-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-brand-primary transition-colors'>
        {label}
      </label>
      <textarea
        id={id}
        className='flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50'
        {...props}
      />
    </div>
  )
}