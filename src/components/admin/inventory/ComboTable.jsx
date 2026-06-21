import React from "react";
import { Pencil, Trash2, Tag, Award, Image, Info } from "lucide-react";

const ComboTable = ({ data = [], onEdit, onDelete, cinemas = [], currencies = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  const formatPrice = (value) => {
    if (value == null) return "—";
    return Number(value).toFixed(2);
  };

  const getCinemaLabel = (cinemaId) => {
    const cinema = cinemas.find((c) => c.id == cinemaId);
    return cinema?.name || cinema?.description || "—";
  };

  const getCurrencySymbol = (currencyId) => {
    const curr = currencies.find((c) => c.id == currencyId);
    return curr?.symbol || "$";
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4 text-center">Imagen</th>
            <th className="py-4 px-4">Combo</th>
            <th className="py-4 px-4">Código (SKU)</th>
            <th className="py-4 px-4">Descripción</th>
            <th className="py-4 px-4 text-center">Sucursal</th>
            <th className="py-4 px-4 text-center">Precio</th>
            <th className="py-4 px-4 text-center">Puntos Lealtad</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-10 text-gray-400 font-montserrat">
                No hay combos registrados para esta sucursal
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr
                key={item.id}
                className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
              >
                {/* Imagen */}
                <td className="py-3 px-4 text-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-full mx-auto border border-border bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-border">
                      <Image className="w-4 h-4" />
                    </div>
                  )}
                </td>

                {/* Nombre */}
                <td className="py-4 px-4 font-bold text-slate-700">
                  {item.name}
                </td>

                {/* SKU */}
                <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                  {item.sku || "—"}
                </td>

                {/* Descripción */}
                <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                  {item.description || "—"}
                </td>

                {/* Sucursal */}
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border">
                    {getCinemaLabel(item.cinema)}
                  </span>
                </td>

                {/* Precio */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 font-semibold">
                    <span>
                      {getCurrencySymbol(item.pricing?.currency ?? item.currency)}{" "}
                      {formatPrice(item.pricing?.final_price ?? item.pricing?.base_price ?? item.price)}
                    </span>
                  </div>
                </td>

                {/* Puntos de Lealtad */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-yellow-500" />
                    <span className="font-bold text-slate-600">
                      {item.earned_loyalty_points ?? 0}
                    </span>
                  </div>
                </td>

                {/* Acciones */}
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

export default ComboTable;
