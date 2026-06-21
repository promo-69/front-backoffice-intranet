import { useState } from "react";
import { Eye, Download } from "lucide-react";
import { useInvoices, useVoidInvoice } from "@/hooks/useInvoices";
import { InvoiceDetailSheet } from "@/components/admin/invoices/InvoiceDetailSheet";
import { VoidInvoiceModal } from "@/components/admin/invoices/VoidInvoiceModal";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { InputCustom } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { downloadInvoicePdf } from "@/services/invoices.service";
import { toast } from "react-hot-toast";
import { CustomToast } from "@/components/ui/CustomToast";

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "voided", label: "Anuladas" },
];

function StatusBadge({ isVoided }) {
  if (isVoided) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        Anulada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
      Activa
    </span>
  );
}

export default function InvoicesPage() {
  const { _user } = useAuth();
  const { can, isSuperAdmin } = usePermission();

  const canVoid = can("CRUD:DELETE:INVOICES-VOID");
  const canViewAll = isSuperAdmin || can("CRUD:READ:INVOICES-ALL");

  const [cinemaId, _setCinemaId] = useState(undefined);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { invoices, pagination, loading, refetch } = useInvoices({
    cinemaId,
    from: from || undefined,
    to: to || undefined,
    search: search || undefined,
    status,
    page,
    limit: 20,
  });

  const { voidInvoice, loading: voiding } = useVoidInvoice();

  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);

  const openDetail = (id) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const handleVoidConfirm = async (reason) => {
    try {
      await voidInvoice(voidTarget.id, reason, cinemaId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Factura anulada"
          message={`Factura ${voidTarget.invoice_number} anulada exitosamente.`}
        />
      ));
      setVoidTarget(null);
      setSheetOpen(false);
      refetch();
    } catch (e) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="No se pudo anular"
          message={
            e?.response?.data?.message ||
            "Ocurrió un error al anular la factura."
          }
        />
      ));
    }
  };

  const handleQuickDownload = async (inv, e) => {
    e.stopPropagation();
    try {
      await downloadInvoicePdf(inv.id, inv.invoice_number, cinemaId);
    } catch {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error"
          message="No se pudo descargar la factura."
        />
      ));
    }
  };

  const paginationMeta = pagination.total
    ? {
        total: pagination.total,
        per_page: pagination.limit,
        current_page: pagination.page,
        total_pages: Math.ceil(pagination.total / pagination.limit),
        prev_page: pagination.page > 1 ? pagination.page - 1 : null,
        next_page:
          pagination.page * pagination.limit < pagination.total
            ? pagination.page + 1
            : null,
      }
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#231640] font-montserrat">
          Facturas
        </h1>
        <p className="text-sm text-muted-foreground">
          Listado general de facturas activas y anuladas.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        {/* Fechas */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estado</label>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatus(s.value); setPage(1); }}
                className={`h-9 px-3 rounded-md text-sm font-medium border transition-colors ${
                  status === s.value
                    ? "bg-[#231640] border-[#231640] text-white"
                    : "border-input bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buscar - ocupa el espacio restante sin desbordarse */}
        <div className="flex-1 min-w-[180px] max-w-full">
          <InputCustom
            label="Buscar"
            placeholder=" "
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Cargando facturas...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No hay facturas para los filtros seleccionados.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  N° Factura
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fecha
                </th>
                {canViewAll && (
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sucursal
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Empleado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cliente
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => openDetail(inv.id)}
                  className={`border-t border-border hover:bg-secondary/20 transition-colors cursor-pointer ${inv.is_voided ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.issued_at).toLocaleDateString("es-VE")}
                  </td>
                  {canViewAll && (
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.order?.cinema?.name ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-foreground">
                    {inv.order?.employee?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {inv.billing_name}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {inv.order?.currency?.symbol ?? "$"}{" "}
                    {Number(inv.order?.total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge isVoided={inv.is_voided} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(inv.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleQuickDownload(inv, e)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {paginationMeta && (
        <CustomPagination
          metadata={paginationMeta}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

      <InvoiceDetailSheet
        invoiceId={selectedId}
        cinemaId={cinemaId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        canVoid={canVoid}
        onVoidClick={(inv) => setVoidTarget(inv)}
      />

      <VoidInvoiceModal
        isOpen={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        onConfirm={handleVoidConfirm}
        invoiceNumber={voidTarget?.invoice_number}
        loading={voiding}
      />
    </div>
  );
}
