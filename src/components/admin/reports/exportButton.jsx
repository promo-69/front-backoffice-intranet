import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportReport, exportReportByCinema } from "@/services/reports.service";
import { toast } from "sonner";

const FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "pdf", label: "PDF (.pdf)" },
];

export function ExportButton({
  reportType,
  cinemaId,
  filters = {},
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 4, left: r.right - 160 });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();

    // Escucha scroll en cualquier ancestro que haga scroll
    const scrollables = [];
    let el = btnRef.current?.parentElement;
    while (el) {
      const { overflow, overflowY } = getComputedStyle(el);
      if (/(auto|scroll)/.test(overflow + overflowY)) {
        el.addEventListener("scroll", updatePos, { passive: true });
        scrollables.push(el);
      }
      el = el.parentElement;
    }
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos);

    return () => {
      scrollables.forEach((s) => s.removeEventListener("scroll", updatePos));
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  const handleExport = async (format) => {
    setOpen(false);
    setLoading(true);
    try {
      if (cinemaId) {
        await exportReportByCinema(cinemaId, reportType, format, filters);
      } else {
        await exportReport(reportType, format, filters);
      }
      toast.success(`Reporte exportado como ${format.toUpperCase()}`);
    } catch {
      toast.error("Error al exportar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        ref={btnRef}
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {loading ? "Exportando..." : "Exportar"}
        <ChevronDown className="w-3 h-3" />
      </Button>

      {open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: "fixed",
                top: dropPos.top,
                left: dropPos.left,
                width: 160,
                zIndex: 9999,
              }}
              className="bg-white border border-border rounded-lg shadow-lg py-1"
            >
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleExport(f.value)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
