import { Plus } from 'lucide-react';

const RateSearchBar = ({ searchTerm, setSearchTerm, onAddClick, placeholder = "Buscar tasa...", buttonText = "NUEVA TASA" }) => (
  <div className="flex items-center gap-4">
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="
        w-64 px-3 py-2 
        rounded-cineflix border border-gray-300 
        text-sm font-montserrat 
        focus:outline-none focus:ring-2 focus:ring-brand-primary/40
        transition-all duration-200
      "
    />

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
        font-montserrat
      "
    >
      <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} /> 
      {buttonText}
    </button>
  </div>
);

export default RateSearchBar;
