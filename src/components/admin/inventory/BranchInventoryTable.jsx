import React from "react";
import { Package, ArrowUpRight, Tag, AlertTriangle, CheckCircle, XCircle, Building2, PackageSearch } from "lucide-react";

const BranchInventoryTable = ({ data = [], onAdjustStock, categories = [], currencies = [], selectedCinemaId }) => {
  const safeData = Array.isArray(data) ? data : [];

  const formatPrice = (value) => {
    if (value == null) return "—";
    return Number(value).toFixed(2);
  };

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find((c) => c.id == categoryId);
    return cat?.name || cat?.description || "—";
  };

  const getCurrencySymbol = (currencyId) => {
    const curr = currencies.find((c) => c.id == currencyId);
    return curr?.symbol || "$";
  };

  // Helper para determinar el badge y estado del stock
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return {
        label: "Agotado",
        colorClass: "bg-red-500/10 text-red-600 border border-red-500/20",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      };
    }
    if (stock <= minStock) {
      return {
        label: "Stock Bajo",
        colorClass: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        icon: <AlertTriangle className="w-3 h-3 mr-1" />,
      };
    }
    return {
      label: "Disponible",
      colorClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    };
  };

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4 text-center">Imagen</th>
            <th className="py-4 px-4">Producto</th>
            <th className="py-4 px-4">Código (SKU)</th>
            <th className="py-4 px-4 text-center">Categoría</th>
            <th className="py-4 px-4 text-center">Precio</th>
            <th className="py-4 px-4 text-center">Stock Actual</th>
            <th className="py-4 px-4 text-center">Stock Mínimo</th>
            <th className="py-4 px-4 text-center">Estado</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="9">
                <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
                  {!selectedCinemaId ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-500 font-montserrat">Selecciona una Sucursal</p>
                        <p className="text-xs text-slate-400 mt-1">Elige una sucursal en el selector de arriba para ver su inventario</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <PackageSearch className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600 font-montserrat">Sin Inventario Registrado</p>
                        <p className="text-xs text-slate-400 mt-1">Esta sucursal aún no tiene productos en su inventario.<br/>Los productos aparecen aquí al registrar movimientos de stock.</p>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            safeData.map((item) => {
              const product = item._Products || item.product || {};
              const stock = item.stock ?? 0;
              const minStock = item.minimum_stock ?? 0;
              const status = getStockStatus(stock, minStock);

              return (
                <tr
                  key={item.id}
                  className="transition-colors group font-montserrat hover:bg-brand-primary/10 bg-transparent"
                >
                  {/* Imagen */}
                  <td className="py-3 px-4 text-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-full mx-auto border border-border bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-border">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Nombre */}
                  <td className="py-4 px-4 font-bold text-slate-700">
                    {product.name || "—"}
                  </td>

                  {/* SKU */}
                  <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                    {product.sku || product.code || "—"}
                  </td>

                  {/* Categoría */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/15 text-brand-primary">
                      <Tag className="w-3 h-3" />
                      {getCategoryLabel(product.product_category)}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-semibold">
                      <span>
                        {getCurrencySymbol(product.pricing?.currency ?? product.currency)}{" "}
                        {formatPrice(product.pricing?.final_price ?? product.pricing?.base_price ?? product.price)}
                      </span>
                    </div>
                  </td>

                  {/* Stock Actual */}
                  <td className="py-4 px-4 text-center">
                    <span className={`text-sm font-black ${stock === 0 ? 'text-red-500' : stock <= minStock ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {stock} u.
                    </span>
                  </td>

                  {/* Stock Mínimo */}
                  <td className="py-4 px-4 text-center font-bold text-slate-400">
                    {minStock} u.
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.colorClass}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onAdjustStock(item)}
                        className="text-xs bg-brand-primary text-white font-bold px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Ajustar
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

export default BranchInventoryTable;
