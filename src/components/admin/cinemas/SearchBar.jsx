import { Search, Plus } from 'lucide-react';

const SearchBar = ({ onSearch, onAddClick, placeholder = "BUSCAR..." }) => (
  <div className="flex gap-3">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input 
        type="text" 
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder} 
        className="pl-10 pr-4 py-2 bg-gray-100 rounded-md text-xs focus:outline-none w-64 border border-transparent focus:border-brand-primary transition-all"
      />
    </div>
    <button 
      onClick={onAddClick}
      className="bg-brand-primary text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm"
    >
      <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> 
      NUEVA SUCURSAL
    </button>
  </div>
);

export default SearchBar;