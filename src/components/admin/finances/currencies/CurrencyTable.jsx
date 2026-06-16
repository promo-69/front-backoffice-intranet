import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const CurrencyTable = ({ data, onEdit, onDelete, onToggleBase }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4">Código</th>
            <th className="py-4 px-4">Descripción</th>
            <th className="py-4 px-4 text-center">Símbolo</th>
            <th className="py-4 px-4 text-center">Moneda Base</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-10 text-gray-400 font-montserrat">
                No hay monedas disponibles
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr
                key={item.id}
                className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
              >
                <td className="py-4 px-4 font-bold text-slate-700">
                  {item.code || "—"}
                </td>

                <td className="py-4 px-4 text-gray-500 text-[11px]">
                  {item.description || item.name || "—"}
                </td>

                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-gold/20 text-brand-primary font-bold text-sm">
                    {item.symbol || "$"}
                  </span>
                </td>

                <td className="py-4 px-4 text-center">
                  <Switch
                    checked={!!item.is_base_currency}
                    onCheckedChange={(checked) => onToggleBase && onToggleBase(item, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
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

export default CurrencyTable;
