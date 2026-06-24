import { ExternalLink, Download, Ban, User, CreditCard, Receipt } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useInvoiceDetail } from "@/hooks/useInvoices";
import { getInvoicePdfUrl, downloadInvoicePdf } from "@/services/invoices.service";
import { toast } from "react-hot-toast";
import { CustomToast } from "@/components/ui/CustomToast";

function Money(value, symbol = "$") {
  return `${symbol} ${Number(value ?? 0).toFixed(2)}`;
}

export function InvoiceDetailSheet({ invoiceId, cinemaId, open, onOpenChange, onVoidClick, canVoid }) {
  const { invoice, loading } = useInvoiceDetail(open ? invoiceId : null, cinemaId);

  const handleDownload = async () => {
    try {
      await downloadInvoicePdf(invoice.id, invoice.invoice_number, cinemaId);
    } catch {
      toast.custom((t) => (
        <CustomToast t={t} type="error" title="Error" message="No se pudo descargar la factura." />
      ));
    }
  };

  const symbol = invoice?.order?.currency?.symbol ?? "$";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-md overflow-y-auto bg-white"
        overlayClassName="bg-black/60"
      >
        <SheetHeader>
          <SheetTitle className="font-montserrat">
            {loading ? "Cargando..." : `Factura ${invoice?.invoice_number ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Cargando detalle...
          </div>
        )}

        {!loading && invoice && (
          <div className="px-4 pb-6 space-y-5">
            {invoice.is_voided && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p className="font-bold text-red-600 flex items-center gap-1.5">
                  <Ban className="w-4 h-4" /> Factura anulada
                </p>
                <p className="text-red-500 text-xs mt-1">{invoice.voided_reason}</p>
                {invoice.voided_by && (
                  <p className="text-red-400 text-xs mt-0.5">Por: {invoice.voided_by.name}</p>
                )}
              </div>
            )}

            {/* Total destacado */}
            <div className="text-center py-3">
              <p className="text-3xl font-bold text-[#231640] font-montserrat">
                {Money(invoice.order?.total, symbol)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(invoice.issued_at).toLocaleString("es-VE")}
              </p>
            </div>

            {/* Empleado / Cliente */}
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-medium">Atendido por</span>
              </div>
              <p className="font-medium text-foreground">{invoice.employee?.name ?? "—"}</p>

              <div className="flex items-center gap-2 text-muted-foreground pt-2">
                <User className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-medium">Cliente</span>
              </div>
              <p className="font-medium text-foreground">{invoice.customer?.name ?? invoice.billing_name}</p>
              <p className="text-xs text-muted-foreground">Doc: {invoice.customer?.document ?? invoice.billing_document}</p>
            </div>

            {/* Líneas */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Receipt className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-medium">Artículos</span>
              </div>
              <div className="space-y-2">
                {(invoice.lines ?? []).map((l) => (
                  <div key={l.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {l.item?.name ?? l.type?.description} <span className="text-muted-foreground">x{l.quantity}</span>
                    </span>
                    <span className="font-medium text-foreground">{Money(l.line_total, symbol)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t border-border pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{Money(invoice.order?.subtotal, symbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Impuestos</span>
                <span>{Money(invoice.order?.tax_amount, symbol)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-1">
                <span>Total</span>
                <span>{Money(invoice.order?.total, symbol)}</span>
              </div>
            </div>

            {/* Pagos */}
            {(invoice.payments ?? []).length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase tracking-wider font-medium">Método de pago</span>
                </div>
                {invoice.payments.map((pay) => {
                  // Si el pago fue en otra moneda (p. ej. CinePuntos), mostramos
                  // la cantidad en esa moneda (puntos) y su equivalente en Bs.
                  const paidInOther = pay.paid_in_other_currency && pay.original_amount != null;
                  const otherSymbol = pay.original_currency?.symbol ?? "Pts";
                  return (
                    <div key={pay.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{pay.method?.description}</span>
                      {paidInOther ? (
                        <span className="text-right">
                          <span className="font-medium text-foreground block">
                            {Math.round(Number(pay.original_amount)).toLocaleString("es-VE")} {otherSymbol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Money(pay.amount_base_currency, symbol)}
                          </span>
                        </span>
                      ) : (
                        <span className="font-medium text-foreground">
                          {Money(pay.amount_base_currency, symbol)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Acciones */}
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={() => window.open(getInvoicePdfUrl(invoice.id, cinemaId), "_blank")}
              >
                <ExternalLink className="w-4 h-4" /> Ver e imprimir
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" /> Descargar PDF
              </Button>
              {canVoid && !invoice.is_voided && (
                <Button
                  variant="destructive"
                  className="w-full justify-center gap-2"
                  onClick={() => onVoidClick(invoice)}
                >
                  <Ban className="w-4 h-4" /> Anular factura
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
