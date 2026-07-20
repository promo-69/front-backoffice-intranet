import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const wrapRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setVY(d.getFullYear());
      setVM(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        setPopupPosition({
          top: rect.bottom,
          left: rect.left,
        });
      }
    };

    const handler = (e) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target) &&
        !(popupRef.current && popupRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  const currentYear = new Date().getFullYear();
  const prevMonth = () =>
    viewMonth === 0 ? (setVM(11), setVY((y) => y - 1)) : setVM((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setVM(0), setVY((y) => y + 1)) : setVM((m) => m + 1);

  const handleYearChange = (year) => {
    const numericYear = Number(year);
    if (!Number.isNaN(numericYear)) setVY(numericYear);
  };

  const handleMonthChange = (month) => {
    const numericMonth = Number(month);
    if (!Number.isNaN(numericMonth)) setVM(numericMonth);
  };

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

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute" style={{ top: popupPosition.top, left: popupPosition.left }}>
              <div ref={popupRef} className="pointer-events-auto bg-[#E7E3F4] border border-[#B6A9DF]/60 rounded-xl shadow-lg p-3 w-[280px]">
                {/* Navegación mes/año */}
                <div className="flex items-center justify-between mb-2 gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded hover:bg-white/60 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#231640]" />
                  </button>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <select
                      value={viewMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="w-full rounded-lg border border-[#B6A9DF]/70 bg-white px-2 py-1 text-[11px] font-semibold text-[#231640]"
                    >
                      {MONTHS.map((m, index) => (
                        <option key={m} value={index}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={viewYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full rounded-lg border border-[#B6A9DF]/70 bg-white px-2 py-1 text-[11px] font-semibold text-[#231640]"
                    >
                      {Array.from({ length: 121 }, (_, idx) => currentYear - idx).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded hover:bg-white/60 transition-colors"
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
                                  ? "bg-[#d9982f] text-white font-bold hover:brightness-95"
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
                  className={`flex mt-2 pt-2 border-t border-[#B6A9DF]/40 ${clearable ? "justify-between" : "justify-end"}`}
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
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
