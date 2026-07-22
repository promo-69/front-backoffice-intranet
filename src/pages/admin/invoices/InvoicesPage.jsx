import { useState, useEffect } from "react";
import { Eye, Download, Search, FileText } from "lucide-react";
import { useInvoices, useVoidInvoice } from "@/hooks/useInvoices";
import { InvoiceDetailSheet } from "@/components/admin/invoices/InvoiceDetailSheet";
import { VoidInvoiceModal } from "@/components/admin/invoices/VoidInvoiceModal";
import { BillingModal } from "@/components/admin/invoices/BillingModal";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Button } from "@/components/ui/button";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { downloadInvoicePdf } from "@/services/invoices.service";
import { ordersService } from "@/services/orders.service";
import { getCinemas } from "@/services/cinema.service";
import { toast } from "react-hot-toast";
import { CustomToast } from "@/components/ui/CustomToast";
import CinemaSelector from "@/components/admin/inventory/CinemaSelector";

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "voided", label: "Anuladas" },
  { value: "pending_billing", label: "Por facturar" },
];

function StatusBadge({ isVoided }) {
  return isVoided ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      Anulada
    </span>
  ) : (
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

  const [cinemaId, setCinemaId] = useState(undefined);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [cinemas, setCinemas] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [billingTarget, setBillingTarget] = useState(null);

  useEffect(() => {
    if (!canViewAll) return;
    getCinemas({ page: 1, limit: 100 })
      .then((res) => setCinemas(res?.data?.cinemas ?? res?.data ?? []))
      .catch(() => {});
  }, [canViewAll]);

  // Fetch orders filtered by status
  useEffect(() => {
    setPendingLoading(true)
    const params = { page, limit: 20 }
    if (search) params.search = search
    if (cinemaId) params.cinemaId = cinemaId
    ordersService.getPendingBilling(status === "all" ? "pending_billing" : status, params)
      .then(res => {
        const data = res?.data ?? res ?? []
        const orders = Array.isArray(data) ? data : (data?.rows || data?.orders || [])
        setPendingOrders(orders)
      })
      .catch(() => setPendingOrders([]))
      .finally(() => setPendingLoading(false))
  }, [status, search, cinemaId, page])

  const { invoices, pagination, loading, refetch } = useInvoices({
    cinemaId,
    from: from || undefined,
    to: to || undefined,
    search: search || undefined,
    status: status === "pending_billing" ? "all" : status,
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
    <div className="max-w-7xl mx-auto font-montserrat space-y-6">
      {/* ── HEADER — patrón Billboard ── */}
      <header className="flex flex-wrap justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#231640] leading-tight">
            Gestión de Facturas
          </h3>
          <p className="text-xs text-muted-foreground">
            Listado general de facturas activas y anuladas.
          </p>
        </div>

        {/* Buscador arriba a la derecha — igual que Billboard */}
        <div className="relative flex-1 max-w-sm min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Nombre, cédula, nro de factura..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#231640]/20 focus:border-[#231640] outline-none transition-all"
          />
        </div>
      </header>

      {/* ── BARRA DE FILTROS ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        {/* Selector de sucursal — solo superadmin */}
        {canViewAll && (
          <CinemaSelector
            cinemas={cinemas}
            value={cinemaId ?? ""}
            onChange={(id) => {
              setCinemaId(id ? Number(id) : undefined);
              setPage(1);
            }}
            showAll={true}
          />
        )}

        {/* Fechas con calendario propio */}
        <DatePickerCustom
          label="Desde"
          value={from}
          onChange={(v) => {
            setFrom(v);
            setPage(1);
          }}
        />
        <DatePickerCustom
          label="Hasta"
          value={to}
          onChange={(v) => {
            setTo(v);
            setPage(1);
          }}
        />

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Estado
          </label>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setStatus(s.value);
                  setPage(1);
                }}
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
      </div>

      {/* ── ÓRDENES POR FACTURAR (en su pestaña y en "Todas") ── */}
      {(status === "pending_billing" || status === "all") && (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-200">
          <h4 className="text-sm font-bold text-amber-800">
            Órdenes Pendientes por Facturar
          </h4>
        </div>
        {pendingLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : pendingOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No hay órdenes para este filtro.</div>
        ) : (
            <table className="w-full text-sm">
              <thead className="bg-amber-50/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Orden #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Documento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-800">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-t border-amber-100 hover:bg-amber-50/30">
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="px-4 py-3">{order.customer_name || order._Customers?._People?.first_name + " " + order._Customers?._People?.last_name || "—"}</td>
                    <td className="px-4 py-3">{order.customer_document || order._Customers?._People?.document_number || "—"}</td>
                    <td className="px-4 py-3 font-bold text-[#3E2186]">${order.total_amount_base_currency || order.total || "—"}</td>
                    <td className="px-4 py-3">
                      {/* La acción depende del estado de LA FILA, no del filtro
                          de la página: con "Todas" también deben poder
                          facturarse las órdenes pendientes. */}
                      {(status === "pending_billing" ||
                        order.order_status === 2 ||
                        order.status === 2 ||
                        order._Statuses?.id === 2) ? (
                        <Button
                          size="sm"
                          onClick={() => setBillingTarget({
                            id: order.id,
                            customer_name: order.customer_name || (order._Customers?._People?.first_name + " " + order._Customers?._People?.last_name),
                            customer_document: order.customer_document || order._Customers?._People?.document_number,
                            total_amount_base_currency: order.total_amount_base_currency || order.total,
                          })}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8"
                        >
                          <FileText className="w-3 h-3 mr-1" /> Facturar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TABLA DE FACTURAS ── */}
      {status !== "pending_billing" && (
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
                    {inv.order?.employee?.name ?? "En línea (Web/App)"}
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
      )}

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

      {billingTarget && (
        <BillingModal
          order={billingTarget}
          onClose={() => setBillingTarget(null)}
          onBilled={() => {
            setBillingTarget(null)
            // Refetch pending orders
            setPendingOrders(prev => prev.filter(o => o.id !== billingTarget.id))
            if (status !== "pending_billing") refetch?.()
          }}
        />
      )}
    </div>
  );
}
