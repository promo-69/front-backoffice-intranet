import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function BankAccountSearchBar({ searchTerm, setSearchTerm, onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          placeholder="Buscar cuenta bancaria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-primary/90 shadow-sm transition-colors w-full sm:w-auto gap-2"
      >
        <Plus className="h-5 w-5" />
        Agregar Cuenta
      </button>
    </div>
  );
}
