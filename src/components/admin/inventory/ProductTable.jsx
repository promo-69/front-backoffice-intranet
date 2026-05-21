import { Pencil, Trash2, DollarSign, Tag, Award } from "lucide-react";

const ProductTable = ({ data, onEdit, onDelete, categories = [], currencies = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  // Helper para formatear precio
  const formatPrice = (value) => {
    if (value == null) return "—";
    return Number(value).toFixed(2);
  };

  // Helper para obtener nombre de categoría desde el FK
  const getCategoryLabel = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.description || "—";
  };

  // Helper para obtener símbolo de moneda desde el FK
  const getCurrencySymbol = (currencyId) => {
    const curr = currencies.find((c) => c.id === currencyId);
    return curr?.symbol || "$";
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4">Nombre</th>
            <th className="py-4 px-4">Código</th>
            <th className="py-4 px-4 text-center">Categoría</th>
            <th className="py-4 px-4 text-center">Precio</th>
            <th className="py-4 px-4 text-center">Puntos Lealtad</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400 font-montserrat">
                No hay productos disponibles
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr
                key={item.id}
                className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
              >
                <td className="py-4 px-4 font-bold text-slate-700">
                  {item.name}
                </td>

                <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                  {item.code || item.sku || "—"}
                </td>

                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/15 text-brand-primary">
                    <Tag className="w-3 h-3" />
                    {getCategoryLabel(item.product_category)}
                  </span>
                </td>

                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 font-semibold">
                    <DollarSign className="w-3 h-3 text-brand-gold" />
                    <span>{getCurrencySymbol(item.currency)}{formatPrice(item.price)}</span>
                  </div>
                </td>

                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-yellow-500" />
                    <span className="font-bold text-slate-600">
                      {item.earned_loyalty_points ?? 0}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="text-brand-primary hover:scale-110 transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="text-red-500 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
