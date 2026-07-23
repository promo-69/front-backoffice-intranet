import React from "react";
import { Search, Plus } from "lucide-react";

const CatalogSearchBar = ({ searchTerm, setSearchTerm, onAddClick, disabled }) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          disabled={disabled}
          placeholder="Buscar maestro..."
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm w-64 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={onAddClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-montserrat font-bold text-sm transition-colors shadow-sm ${
          disabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-brand-gold hover:bg-brand-gold/90 text-white"
        }`}
      >
        <Plus className="h-4 w-4" />
        <span>Añadir Maestro</span>
      </button>
    </div>
  );
};

export default CatalogSearchBar;
