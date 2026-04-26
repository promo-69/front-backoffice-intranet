import { Search, Plus } from 'lucide-react';

const SearchBar = ({ onSearch, onAddClick, placeholder = "BUSCAR..." }) => (
  <div className="flex gap-4 items-center">
    <div className="relative group flex-1 w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-brand-primary transition-colors duration-300" />
      
      <input 
        type="text" 
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder} 
        className="
          w-full pl-10 pr-4 py-2
          bg-slate-50 
          /* Borde en gris fuerte (slate-500) para mayor énfasis */
          border-2 border-slate-500 rounded-xl
          text-xs font-bold text-slate-800
          placeholder:text-slate-500 placeholder:font-normal
          
          /* Interacción: se oscurece más en hover antes de pasar al color de marca */
          hover:border-slate-700
          focus:bg-white focus:border-brand-primary focus:outline-none
          
          transition-all duration-300
        "
      />
    </div>

    <button 
      onClick={onAddClick}
      className="
        bg-brand-primary text-white 
        px-5 py-2.5
        rounded-xl
        flex items-center gap-2 
        text-[11px] font-black uppercase tracking-widest
        hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5
        active:scale-95
        transition-all duration-300
        border-2 border-purple-400/30
      "
    >
      <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> 
      NUEVA SUCURSAL
    </button>
  </div>
);

export default SearchBar;