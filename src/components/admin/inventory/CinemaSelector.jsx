import React, { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check, MapPin, Loader2 } from "lucide-react";

/**
 * CinemaSelector — Selector de sucursal premium con dropdown personalizado.
 * Props:
 *   cinemas       : Array<{ id, name, address? }>
 *   value         : string | number  (id de la sucursal seleccionada, "" = todas)
 *   onChange      : (id: string) => void
 *   showAll       : boolean  — si true, incluye opción "Todas las sucursales"
 *   loading       : boolean
 */
const CinemaSelector = ({
  cinemas = [],
  value = "",
  onChange,
  showAll = false,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cierra al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCinema = cinemas.find((c) => String(c.id) === String(value));
  const displayLabel = selectedCinema
    ? selectedCinema.name
    : showAll
    ? "Todas las Sucursales"
    : "Seleccionar Sucursal";

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200
          text-xs font-bold min-w-[200px] max-w-[260px]
          ${open
            ? "border-brand-primary bg-brand-primary/5 shadow-lg ring-2 ring-brand-primary/20"
            : "border-gray-200 bg-white hover:border-brand-primary/40 hover:shadow-md shadow-sm"
          }
        `}
      >
        {/* Ícono de sucursal con fondo */}
        <span className={`
          flex items-center justify-center w-6 h-6 rounded-lg shrink-0
          ${selectedCinema ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"}
        `}>
          <Building2 className="w-3.5 h-3.5" />
        </span>

        {/* Label */}
        <span className={`flex-1 text-left truncate ${selectedCinema ? "text-slate-800" : "text-slate-500"}`}>
          {loading ? (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Cargando...
            </span>
          ) : (
            displayLabel
          )}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && !loading && (
        <div className="
          absolute right-0 mt-2 w-72 z-50
          bg-white border border-gray-100 rounded-2xl shadow-2xl
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {/* Header del dropdown */}
          <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sucursales Disponibles
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {cinemas.length} sucursal{cinemas.length !== 1 ? "es" : ""} registrada{cinemas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Opción "Todas" */}
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  hover:bg-brand-primary/5 group
                  ${value === "" ? "bg-brand-primary/8" : ""}
                `}
              >
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-xl shrink-0
                  ${value === "" ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-brand-primary/20 group-hover:text-brand-primary"}
                  transition-colors
                `}>
                  <Building2 className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${value === "" ? "text-brand-primary" : "text-slate-700"}`}>
                    Todas las Sucursales
                  </p>
                  <p className="text-[10px] text-slate-400">Vista global del inventario</p>
                </div>
                {value === "" && <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
              </button>
            )}

            {/* Separador si hay "Todas" */}
            {showAll && cinemas.length > 0 && (
              <div className="mx-4 border-t border-gray-100" />
            )}

            {/* Lista de sucursales */}
            {cinemas.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Building2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No hay sucursales registradas</p>
              </div>
            ) : (
              cinemas.map((cinema, idx) => {
                const isSelected = String(cinema.id) === String(value);
                return (
                  <button
                    key={cinema.id}
                    type="button"
                    onClick={() => { onChange(String(cinema.id)); setOpen(false); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                      hover:bg-brand-primary/5 group
                      ${isSelected ? "bg-brand-primary/8" : ""}
                    `}
                  >
                    {/* Avatar con inicial */}
                    <span className={`
                      flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black shrink-0
                      ${isSelected
                        ? "bg-brand-primary text-white"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:from-brand-primary/20 group-hover:to-brand-primary/10 group-hover:text-brand-primary"
                      }
                      transition-all
                    `}>
                      {cinema.name?.charAt(0)?.toUpperCase() || "C"}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-brand-primary" : "text-slate-700"}`}>
                        {cinema.name}
                      </p>
                      {cinema.address && (
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {cinema.address}
                        </p>
                      )}
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer informativo */}
          {cinemas.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-50 bg-slate-50/60">
              <p className="text-[10px] text-slate-400 text-center">
                Selecciona una sucursal para ver su inventario
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CinemaSelector;
