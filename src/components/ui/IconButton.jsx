
export default function IconButton({ 
  icon: Icon, 
  onClick, 
  label, 
  colorClass = "text-black", 
  className = "" 
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label} 
      className={`
        ${colorClass} 
        hover:opacity-60 
        active:scale-90 
        transition-all 
        duration-200 
        p-1 
        rounded-full 
        flex 
        items-center 
        justify-center
        ${className}
      `}
    >
      <Icon size={18} strokeWidth={2.5} />
    </button>
  );
}