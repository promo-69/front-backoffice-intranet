// @/components/ui/CustomPagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CustomPagination({ metadata, currentPage, onPageChange }) {
  if (!metadata || metadata.total === 0) return null;

  // En lugar de depender de punteros del backend, usamos aritmética simple - Mary
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < metadata.total_pages;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 sm:px-6 rounded-xl shadow-sm animate-in fade-in">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        
        <p className="text-sm text-gray-700 font-montserrat">
          Mostrando <span className="font-semibold">{(currentPage - 1) * metadata.per_page + 1}</span> a{" "}
          <span className="font-semibold">
            {Math.min(currentPage * metadata.per_page, metadata.total)}
          </span> de <span className="font-semibold">{metadata.total}</span> resultados
        </p>
        
        <nav className="inline-flex -space-x-px rounded-md shadow-sm font-montserrat">
          {/* Botón Anterior */}
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={!hasPrevPage} 
            className="relative inline-flex items-center px-3 py-2 text-gray-400 border border-gray-200 bg-white disabled:opacity-40 transition-all cursor-pointer hover:bg-slate-50 rounded-l-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="px-5 py-2 text-xs font-black text-brand-primary border-t border-b border-gray-200 bg-slate-50/50">
            PÁG {currentPage} DE {metadata.total_pages}
          </div>
          
          {/* Botón Siguiente */}
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={!hasNextPage} 
            className="relative inline-flex items-center px-3 py-2 text-gray-400 border border-gray-200 bg-white disabled:opacity-40 transition-all cursor-pointer hover:bg-slate-50 rounded-r-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}