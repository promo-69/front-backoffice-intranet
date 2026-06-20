import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function datasetsToRows(datasets = []) {
  if (!datasets?.length) return [];
  const labels = datasets[0].data.map((d) => d.label);
  return labels.map((name, i) => {
    const row = { name };
    datasets.forEach((ds) => {
      row[ds.key] = ds.data[i]?.value ?? 0;
    });
    return row;
  });
}

export function DataTableView({ data, reportType, filters = {}, cinemaId }) {
  const rows = useMemo(() => datasetsToRows(data?.datasets), [data]);
  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  // ── Paginación ──────────────────────────────────────────────
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, rows.length);
  const currentRows = rows.slice(startIndex, endIndex);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Sin datos para mostrar
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead className="bg-secondary/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-border hover:bg-secondary/20 transition-colors"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-foreground">
                  {row[col] !== undefined ? row[col] : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Controles de paginación ─────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>
            Mostrando {startIndex + 1}–{endIndex} de {rows.length} filas
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-medium">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
