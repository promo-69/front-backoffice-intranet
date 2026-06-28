import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

export function DatePickerCustom({
  label,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  clearable = true,
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setVY] = useState(() => {
    const d = parseDate(value);
    return d ? d.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setVM] = useState(() => {
    const d = parseDate(value);
    return d ? d.getMonth() : new Date().getMonth();
  });
  const wrapRef = useRef(null);

  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setVY(d.getFullYear());
      setVM(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const prevMonth = () =>
    viewMonth === 0 ? (setVM(11), setVY((y) => y - 1)) : setVM((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setVM(0), setVY((y) => y + 1)) : setVM((m) => m + 1);

  const selected = parseDate(value);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMo }, (_, i) => i + 1),
  ];
  const todayObj = new Date();
  const isToday = (d) =>
    d === todayObj.getDate() &&
    viewMonth === todayObj.getMonth() &&
    viewYear === todayObj.getFullYear();
  const isSel = (d) =>
    selected &&
    d === selected.getDate() &&
    viewMonth === selected.getMonth() &&
    viewYear === selected.getFullYear();

  const pick = (d) => {
    onChange(toISODate(new Date(viewYear, viewMonth, d)));
    setOpen(false);
  };
  const clear = (e) => {
    e.stopPropagation();
    onChange("");
  };
  const goToday = () => {
    const t = new Date();
    setVY(t.getFullYear());
    setVM(t.getMonth());
    onChange(toISODate(t));
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1" ref={wrapRef}>
      {label && (
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 min-w-[148px] flex items-center gap-2 px-3 rounded-md border text-sm transition-colors
          ${open ? "border-[#231640] ring-2 ring-[#231640]/20" : "border-input hover:border-[#231640]/40"}
          bg-background text-left`}
      >
        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
        <span
          className={`flex-1 ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && clearable && (
          <span
            onClick={clear}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[240px]">
          {/* Navegación mes/año */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#231640]" />
            </button>
            <span className="text-xs font-bold text-[#231640] uppercase tracking-wide">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#231640]" />
            </button>
          </div>

          {/* Nombres días */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-muted-foreground py-0.5"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => (
              <div key={i} className="flex items-center justify-center">
                {d ? (
                  <button
                    type="button"
                    onClick={() => pick(d)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-colors
                      ${
                        isSel(d)
                          ? "bg-[#231640] text-white font-bold"
                          : isToday(d)
                            ? "border-2 border-[#d9982f] text-[#231640] font-bold hover:bg-[#231640]/10"
                            : "text-foreground hover:bg-[#231640]/10"
                      }`}
                  >
                    {d}
                  </button>
                ) : (
                  <div className="w-7 h-7" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className={`flex mt-2 pt-2 border-t border-gray-100 ${clearable ? "justify-between" : "justify-end"}`}
          >
            {clearable && (
              <button
                type="button"
                onClick={clear}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Borrar
              </button>
            )}
            <button
              type="button"
              onClick={goToday}
              className="text-[11px] font-semibold text-[#231640] hover:text-[#d9982f] transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
