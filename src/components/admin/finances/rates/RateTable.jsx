import { TrendingUp, Clock } from "lucide-react";

const RateTable = ({ data, currencies = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  const getCurrencyLabel = (currencyId) => {
    const curr = currencies.find((c) => c.id == currencyId);
    return curr ? `${curr.code} - ${curr.description}` : currencyId || "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4">Moneda</th>
            <th className="py-4 px-4 text-center">Tasa de Cambio</th>
            <th className="py-4 px-4 text-center">Fecha de Registro</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-10 text-gray-400 font-montserrat">
                No hay tasas de cambio registradas
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr
                key={item.id}
                className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
              >
                <td className="py-4 px-4 font-bold text-slate-700">
                  {getCurrencyLabel(item.currency_id || item.currency)}
                </td>

                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center items-center gap-1.5 font-bold text-brand-primary text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
                    {item.rate || item.value || "—"}
                  </div>
                </td>

                <td className="py-4 px-4 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    {formatDate(item.created_at || item.createdAt || new Date().toISOString())}
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

export default RateTable;
