import { Pencil, Trash2 } from "lucide-react";

const PriceModifierTable = ({ data, onEdit, onDelete, loyaltyLevels = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  const getLevelLabel = (levelId) => {
    if (!levelId) return null;
    const level = loyaltyLevels.find((l) => Number(l.id) === Number(levelId));
    return level?.name || `Nivel #${levelId}`;
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4">Descripción</th>
            <th className="py-4 px-4 text-center">Valor</th>
            <th className="py-4 px-4 text-center">Vigencia</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-10 text-gray-400 font-montserrat">
                No hay modificadores de precio disponibles
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr
                key={item.id}
                className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
              >
                <td className="py-4 px-4 font-bold text-slate-700">
                  {item.description || "—"}
                  {getLevelLabel(item.min_loyalty_level) && (
                    <span className="block mt-1 w-fit text-[9px] font-black uppercase tracking-wide text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                      Nivel mín: {getLevelLabel(item.min_loyalty_level)}
                    </span>
                  )}
                </td>

                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-gold/20 text-brand-primary font-bold text-sm">
                    {item.is_percentage ? `${item.value}%` : `${item.value}`}
                  </span>
                </td>

                <td className="py-4 px-4 text-center text-gray-500 text-[11px]">
                  {item.start_date || item.end_date ? (
                    <>
                      {item.start_date && <span>{item.start_date}</span>}
                      {item.start_date && item.end_date && <span> - </span>}
                      {item.end_date && <span>{item.end_date}</span>}
                    </>
                  ) : (
                    "Siempre"
                  )}
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

export default PriceModifierTable;
