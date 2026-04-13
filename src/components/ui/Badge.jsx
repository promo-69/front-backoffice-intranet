
export default function Badge({ children, className=''}) {
  return (
    <span className={`
      inline-flex items-center px-3 py-0.5 rounded-full
      border border-black bg-slate-200 text-black 
      text-xs font-montserrat font-medium
      ${className}
    `}>
        { children }
    </span>
  );
}
