

export default function Card({ 
  actions, 
  media, 
  title, 
  description, 
  tags, 
  footer,
  className = "" 
}) {
  return (
    <div className={`bg-[#D9D9D9] rounded-lg shadow-md overflow-hidden flex flex-col w-full ${className}`}>
      {actions && (
        <div className="bg-[#ABAFAB] flex items-center justify-end gap-2 px-3 py-1.5 flex-shrink-0">
          {actions}
        </div>
      )}

      {media && (
        <div className="flex justify-center px-5 pt-3 pb-4">
          <div className="w-full aspect-square overflow-hidden rounded-sm">
            {media}
          </div>
        </div>
      )}

      {/*Contenido Principal */}
      <div className="px-5 pb-4 flex flex-col flex-1 gap-2">
        {title && (
          <header>
            <h3 className="text-black text-xl leading-tight font-bebas tracking-tighter">
              {title}
            </h3>
          </header>
        )}

        {tags && <div className="flex flex-wrap gap-1.5">{tags}</div>}

        {description && (
          <p className="text-black text-[14px] leading-snug font-montserrat line-clamp-3 mt-1">
            {description}
          </p>
        )}

        {/* Pie de Tarjeta */}
        {footer && (
          <footer className="mt-auto pt-3 border-t border-black/5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}