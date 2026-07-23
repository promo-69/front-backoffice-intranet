import { Pencil, Trash2, Gift, Ticket, Coffee, Layers } from "lucide-react";

const REWARD_TYPE_LABELS = {
  PRODUCT: "Producto",
  COMBO: "Combo",
  BLANK_TICKET: "Boleto en Blanco",
  TWO_FOR_ONE: "2x1 Entradas",
};

const REWARD_TYPE_ICONS = {
  PRODUCT: Coffee,
  COMBO: Layers,
  BLANK_TICKET: Ticket,
  TWO_FOR_ONE: Gift,
};

const RewardTable = ({ data, cinemas = [], levels = [], onEdit, onDelete }) => {
  const safeData = Array.isArray(data) ? data : [];

  const getCinemaLabel = (cinemaId) => {
    const cinema = cinemas.find((c) => Number(c.id) === Number(cinemaId));
    return cinema?.name || cinema?.description || (cinemaId ? `#${cinemaId}` : "—");
  };

  const getLevelLabel = (levelId) => {
    const level = levels.find((l) => Number(l.id) === Number(levelId));
    return level?.name || (levelId ? `Nivel #${levelId}` : "—");
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4">Premio</th>
            <th className="py-4 px-4 text-center">Tipo</th>
            <th className="py-4 px-4 text-center">Costo</th>
            <th className="py-4 px-4 text-center">Nivel Requerido</th>
            <th className="py-4 px-4 text-center">Sucursal</th>
            <th className="py-4 px-4 text-center">Vigencia</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-10 text-gray-400 font-montserrat">
                No hay premios de fidelidad configurados
              </td>
            </tr>
          ) : (
            safeData.map((item) => {
              const Icon = REWARD_TYPE_ICONS[item.reward_type] || Gift;
              return (
                <tr
                  key={item.id}
                  className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-brand-gold/15 text-brand-primary flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-700">{item.name}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-400">Cantidad: {item.quantity}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[10px] uppercase tracking-wide">
                      {REWARD_TYPE_LABELS[item.reward_type] || item.reward_type}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-gold/20 text-brand-primary font-bold text-sm">
                      {Number(item.points_cost).toLocaleString()} pts
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center text-slate-600 font-semibold">
                    {getLevelLabel(item.required_loyalty_level)}
                  </td>

                  <td className="py-4 px-4 text-center text-slate-600">
                    {getCinemaLabel(item.cinema)}
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

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                        item.is_active
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {item.is_active ? "Activo" : "Inactivo"}
                    </span>
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RewardTable;
