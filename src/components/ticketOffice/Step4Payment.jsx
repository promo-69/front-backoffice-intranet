import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Ticket,
  ShoppingBag,
  DollarSign,
  Lock,
} from "lucide-react";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";

export default function Step4Payment({
  movie,
  showtime,
  selectedSeats = [],
  ticketsNeeded = 1,
  totalTickets = 0,
  totalTicketsVes = 0,
  concessionItems = [],
  concessionTotal = 0,
  concessionTotalVes = 0,
  onConfirm,
  onBack,
  onNewSale,
  paymentMethods = [],
  bankAccountsByMethod = {},
  vesCurrencyId = 2,
  customerInfo = null,
  exchangeRate = 600,
  paymentProcessing = false,
  paymentResult = null,
}) {
  const initAmount = (totalTickets || 0) + (concessionTotal || 0);
  const defaultMethod = paymentMethods[0]?.id || 1;
  const initAmountVes = initAmount * exchangeRate;
  const initAmountUsd = initAmount;
  const [payments, setPayments] = useState([
    {
      method: defaultMethod,
      amountVes: initAmountVes,
      amountUsd: initAmountUsd,
      fields: {},
      confirmed: false,
      processing: false,
      error: null,
    },
  ]);
  const [confirmed, setConfirmed] = useState(false);
  const [billingCompleted, setBillingCompleted] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingDocument, setBillingDocument] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);

  // Auto-completar datos del cliente en factura
  useEffect(() => {
    if (paymentResult?.billing && customerInfo) {
      setBillingName(customerInfo.firstName && customerInfo.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : (billingName || ""))
      setBillingDocument(customerInfo.documentNumber || "")
    }
  }, [paymentResult?.billing]);

  const grandTotal = totalTickets + concessionTotal;
  const grandTotalVes = totalTicketsVes + concessionTotalVes;
  const paidByUser = payments.reduce(
    (s, p) => s + (Number(p.amountUsd) || 0),
    0,
  );
  const isBalanced = Math.abs(paidByUser - grandTotal) < 1.0;
  const isOverpaying = paidByUser - grandTotal > 1.0;

  // RF-20: cálculo de vuelto para pagos en efectivo.
  // Efectivo = método que no es fidelidad (5) ni con referencia (2,3,4).
  const [cashReceived, setCashReceived] = useState("");
  const isCashMethod = (m) => m !== 5 && ![2, 3, 4].includes(m);
  const cashAppliedUsd = payments
    .filter((p) => isCashMethod(p.method))
    .reduce((s, p) => s + (Number(p.amountUsd) || 0), 0);
  const hasCash = cashAppliedUsd > 0.001;
  const receivedUsd =
    cashReceived === "" ? cashAppliedUsd : parseFloat(cashReceived) || 0;
  const insufficientCash =
    cashReceived !== "" && receivedUsd < cashAppliedUsd - 0.01;
  const vueltoUsd = Math.max(0, receivedUsd - cashAppliedUsd);
  const vueltoVes = vueltoUsd * exchangeRate;

  // ── Per-payment processing ──
  const processPayment = async (index) => {
    if (!payments[index] || payments[index].confirmed || payments[index].processing) return
    if (!payments[index].amountVes || payments[index].amountVes <= 0) return

    // Validar que no exceda el total o el remanente
    const otherConfirmed = payments.filter((_, i) => i !== index && _.confirmed).reduce((s, _) => s + (Number(_.amountUsd) || 0), 0)
    const thisAmount = Number(payments[index].amountUsd) || 0
    if (thisAmount + otherConfirmed > grandTotal + 0.10) {
      updatePayment(index, { error: "El monto excede el total de la orden" })
      return
    }

    updatePayment(index, { processing: true, error: null })

    try {
      const api = (await import("@/api/axios")).default
      // Leer el valor más reciente del estado para evitar race conditions
      const currentPayments = payments
      const p = currentPayments[index]
      let amountVes = p.amountVes
      let amountUsd = Number(p.amountUsd) || 0

      // Ajustar al último pago para cubrir exactamente el saldo restante
      const otherConfirmed = currentPayments.filter((_, i) => i !== index && _.confirmed).reduce((s, _) => s + (Number(_.amountUsd) || 0), 0)
      const remaining = parseFloat((grandTotal - otherConfirmed).toFixed(2))
      if (remaining > 0 && remaining <= amountUsd) {
        amountUsd = remaining
        amountVes = Math.round(remaining * exchangeRate * 100) / 100
        updatePayment(index, { amountUsd, amountVes })
      }

      const payload = {
        payment_method: p.method,
        amount: amountVes,
        currency: vesCurrencyId,
        reference_number: p.fields?.Referencia || undefined,
        bank: p.fields?.Banco || undefined,
      }
      await api.post('/orders/payments', [payload])
      updatePayment(index, { confirmed: true, processing: false })
    } catch (e) {
      updatePayment(index, { processing: false, error: e?.response?.data?.message || 'Error al procesar' })
    }
  }

  const allConfirmed = payments.every(p => p.confirmed || !p.amountVes || p.amountVes <= 0)
  const confirmedTotal = parseFloat(payments.filter(p => p.confirmed).reduce((s, p) => s + (Number(p.amountUsd) || 0), 0).toFixed(2))
  const roundedGrand = parseFloat(grandTotal.toFixed(2))
  const isFullyConfirmed = allConfirmed && Math.abs(confirmedTotal - roundedGrand) < 0.10

  // ── Billing ──
  const handleBillingSubmit = async (e) => {
    e?.preventDefault()
    if (!billingName.trim() || !billingDocument.trim()) {
      setBillingError("Nombre y cédula son obligatorios")
      return
    }
    setBillingLoading(true)
    setBillingError(null)
    try {
      const api = (await import("@/api/axios")).default
      const res = await api.post("/orders/billing", {
        orderId: paymentResult?.orderId,
        billing_name: billingName.trim(),
        billing_document: billingDocument.trim(),
        billing_address: billingAddress.trim() || undefined,
      })
      setBillingCompleted(true)
      // Mostramos en pantalla la factura recién emitida (misma técnica
      // autenticada por blob que "Ver e imprimir" en Gestión de Facturas).
      const invoiceId =
        res?.data?.data?.invoice?.id ?? res?.data?.data?.id ?? res?.data?.data?.invoiceId;
      if (invoiceId) {
        try {
          const { viewInvoicePdf } = await import("@/services/invoices.service");
          await viewInvoicePdf(invoiceId);
        } catch {
          // Si el visor falla, la factura igual queda emitida y accesible
          // desde Gestión de Facturas.
        }
      }
    } catch (e) {
      setBillingError(e?.response?.data?.message || "Error al generar la factura")
    } finally {
      setBillingLoading(false)
    }
  }

  const handleConfirm = () => {
    onConfirm({ payments });
  };

  const addPayment = () => {
    const usedMethods = payments.map((p) => p.method);
    const nextMethod =
      paymentMethods.find((m) => !usedMethods.includes(m.id)) ||
      paymentMethods[0];
    setPayments([
      ...payments,
      { method: nextMethod?.id || 1, amountVes: 0, amountUsd: 0, fields: {}, confirmed: false, processing: false, error: null },
    ]);
  };

  const updatePayment = (index, patch) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  };

  const onAmountUsdChange = (index, usdAmount) => {
    const usd = parseFloat((parseFloat(usdAmount) || 0).toFixed(2));
    updatePayment(index, {
      amountUsd: usd,
      amountVes: Math.round(usd * exchangeRate * 100) / 100,
    });
  };

  const onAmountVesChange = (index, vesAmount) => {
    const ves = parseFloat((parseFloat(vesAmount) || 0).toFixed(2));
    updatePayment(index, {
      amountVes: ves,
      amountUsd: parseFloat((Math.round((ves / exchangeRate) * 100) / 100).toFixed(2)),
    });
  };

  const removePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  if (paymentProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#3E2186]/20 rounded-full scale-150 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-[#3E2186] flex items-center justify-center shadow-2xl shadow-[#3E2186]/40">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#3E2186] mb-2">Procesando Pago</h2>
        <p className="text-slate-600 text-center max-w-sm">
          Esperando confirmación del sistema de pago...
        </p>
      </div>
    );
  }

  if (paymentResult) {
    if (paymentResult.success) {
      if (paymentResult.partial) {
        return (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
            <div className="relative mb-6">
              <div className="relative w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                <DollarSign className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-amber-600 mb-2">Pago Parcial</h2>
            <p className="text-slate-600 text-center max-w-sm mb-2">
              {paymentResult.message || "Pago parcial registrado exitosamente"}
            </p>
            {paymentResult.remainingBalance != null && (
              <p className="text-lg font-bold text-red-500 mb-4">
                Saldo pendiente: ${Number(paymentResult.remainingBalance).toFixed(2)}
              </p>
            )}
            <div className="flex gap-3">
              {onNewSale && (
                <button onClick={onNewSale} className="px-6 py-3 bg-[#3E2186] text-white rounded-xl text-sm font-bold hover:brightness-110">Nueva Venta</button>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[#3E2186]/20 rounded-full scale-150 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-[#3E2186] flex items-center justify-center shadow-2xl shadow-[#3E2186]/40">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#3E2186] mb-1 uppercase tracking-widest">¡Venta Exitosa!</h2>

          {paymentResult.billing && !billingCompleted && (
            <div className="mt-4 bg-white border border-amber-300 rounded-2xl p-6 w-full max-w-sm space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-amber-700">Datos de Facturación</h3>
              {billingError && <p className="text-xs text-red-500">{billingError}</p>}
              <input type="text" placeholder="Nombre o Razón Social *" value={billingName} onChange={e => setBillingName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <input type="text" placeholder="Cédula o RIF *" value={billingDocument} onChange={e => setBillingDocument(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <input type="text" placeholder="Dirección (opcional)" value={billingAddress} onChange={e => setBillingAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <button onClick={handleBillingSubmit} disabled={billingLoading}
                className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm hover:brightness-110 disabled:opacity-50">
                {billingLoading ? "Emitiendo..." : "Emitir Factura"}
              </button>
            </div>
          )}

          <div className="mt-4 bg-gray-50 border border-[#3E2186]/30 rounded-2xl p-5 w-full max-w-sm space-y-3 text-left">
            {movie && (
              <div className="pb-3 border-b border-gray-200">
                <p className="font-bold text-[#3E2186] text-sm">{movie.title}</p>
                <p className="text-xs text-slate-600">{showtime?.time} · {showtime?.room} · {showtime?.date}</p>
                {selectedSeats.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedSeats.map((s) => (
                      <span key={s.id} className="bg-[#3E2186]/20 text-[#3E2186] px-1.5 py-0.5 rounded text-[10px] font-bold">{s.id}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {concessionItems.length > 0 && (
              <div className="pb-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">Confitería</p>
                {concessionItems.map((entry, idx) => (
                  <div key={entry.id || entry._key || idx} className="flex justify-between text-xs text-slate-600">
                    <span>{entry.item?.name || entry.name} ×{entry.qty ?? entry.quantity}</span>
                    <span className="font-medium">${(((entry.item?.price ?? entry.price) || 0) * (entry.qty ?? entry.quantity)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">Métodos de Pago</p>
              {payments.filter(p => p.amountUsd > 0 || p.amountVes > 0).map((p, i) => {
                const m = paymentMethods.find((pm) => pm.id === p.method)
                return (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{m?.description || `Método ${p.method}`}</span>
                    <span className="font-medium">Bs. {(Number(p.amountVes) || 0).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">Total</span>
              <div className="text-right">
                <span className="text-[#3E2186] font-bold text-lg">${grandTotal.toFixed(2)}</span>
                {grandTotalVes > 0 && <span className="text-slate-600 text-xs block">Bs. {grandTotalVes.toFixed(2)}</span>}
              </div>
            </div>
          </div>

          {billingCompleted && (
            <p className="text-green-600 text-sm mt-2 font-semibold">✅ Factura emitida correctamente</p>
          )}

          {onNewSale && (
            <button onClick={onNewSale} className="mt-6 px-8 py-3 border border-[#3E2186]/40 text-[#3E2186] rounded-xl text-sm font-bold hover:bg-[#3E2186]/10 transition-all">+ Nueva Venta</button>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
          <div className="relative mb-6">
            <div className="relative w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/40">
              <XCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error en el Pago</h2>
          <p className="text-slate-600 text-center max-w-sm mb-4">
            {paymentResult.message || "El pago no pudo ser procesado."}
          </p>
          <div className="flex gap-3">
            {onNewSale && (
              <button onClick={onNewSale} className="px-6 py-3 bg-[#3E2186] text-white rounded-xl text-sm font-bold hover:brightness-110">Nueva Venta</button>
            )}
          </div>
        </div>
      );
    }
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#3E2186]/20 rounded-full scale-150 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-[#3E2186] flex items-center justify-center shadow-2xl shadow-[#3E2186]/40">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#3E2186] mb-2 uppercase tracking-widest">
          ¡Venta Exitosa!
        </h2>
        <p className="text-slate-700 text-center max-w-sm">
          {movie
            ? "Los boletos han sido registrados correctamente. Entrega los tiquetes al cliente."
            : "Los productos han sido registrados correctamente. Entrega el pedido al cliente."}
        </p>
        <div className="mt-6 bg-gray-50 border border-[#3E2186]/30 rounded-2xl p-6 text-center w-full max-w-sm">
          {movie && (
            <>
              <p className="text-sm text-slate-700 mb-1">{movie.title}</p>
              <p className="text-slate-800 font-bold">
                {showtime.time} · {showtime.room}
              </p>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="bg-[#3E2186] text-white px-2.5 py-1 rounded-lg font-bold text-xs"
                  >
                    {s.id}
                  </span>
                ))}
              </div>
            </>
          )}
          {concessionItems.length > 0 && (
            <div className="mt-2 space-y-1">
              {concessionItems.map((entry, idx) => (
                <p
                  key={entry.id || entry._key || idx}
                  className="text-sm text-slate-700"
                >
                  {entry.item?.name || entry.name} ×
                  {entry.qty ?? entry.quantity}
                </p>
              ))}
            </div>
          )}
          <p className="text-2xl font-bold text-[#3E2186] mt-4">
            ${grandTotal.toFixed(2)}
          </p>
          {grandTotalVes > 0 && (
            <p className="text-sm text-slate-600">
              Bs. {grandTotalVes.toFixed(2)}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {payments.map((p, i) => {
              const m = paymentMethods.find((pm) => pm.id === p.method);
              return (
                <p key={i} className="text-xs text-slate-700">
                  {m?.description}: ${(Number(p.amountUsd) || 0).toFixed(2)}
                  {p.amountVes > 0 && (
                    <span className="text-slate-600">
                      {" "}
                      · Bs. {(Number(p.amountVes) || 0).toFixed(2)}
                    </span>
                  )}
                </p>
              );
            })}
          </div>
          {vueltoUsd > 0 && (
            <p className="text-sm font-bold text-emerald-600 mt-3">
              Vuelto entregado: ${vueltoUsd.toFixed(2)}
              {vueltoVes > 0 && ` · Bs. ${vueltoVes.toFixed(2)}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-[#3E2186]">Resumen y Pago</h2>
        <p className="text-slate-600 text-sm mt-1">
          Confirma los detalles y selecciona los métodos de pago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Resumen de compra ── */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
          {movie && (
            <>
              <h3 className="font-bold text-[#3E2186] flex items-center gap-2 text-sm uppercase tracking-wider">
                <Ticket className="w-4 h-4" /> Boletos
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>{movie.title}</span>
                  <span className="text-slate-800 font-bold">
                    {ticketsNeeded}x
                  </span>
                </div>
                <div className="text-xs text-slate-600 pl-2">
                  <p>
                    {showtime.time} · {showtime.room} · {showtime.date}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.id}
                        className="bg-[#3E2186]/20 text-[#3E2186] px-1.5 py-0.5 rounded text-[10px] font-bold"
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                  <span className="text-slate-700">Subtotal boletos</span>
                  <div className="text-right">
                    <span className="text-[#3E2186]">
                      ${totalTickets.toFixed(2)}
                    </span>
                    {totalTicketsVes > 0 && (
                      <span className="text-slate-600 text-xs font-normal block">
                        Bs. {totalTicketsVes.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {concessionItems.length > 0 && (
            <>
              <h3 className="font-bold text-[#3E2186] flex items-center gap-2 text-sm uppercase tracking-wider pt-2 border-t border-gray-200">
                <ShoppingBag className="w-4 h-4" /> Confitería
              </h3>
              <div className="space-y-1">
                {concessionItems.map((entry, idx) => (
                  <div
                    key={entry._key || entry.id || idx}
                    className="flex justify-between text-sm text-slate-700"
                  >
                    <span>
                      {entry.item?.emoji || ""} {entry.item?.name || entry.name}{" "}
                      ×{entry.qty ?? entry.quantity}
                    </span>
                    <span>
                      $
                      {(
                        (entry.item?.price ?? entry.price) *
                        (entry.qty ?? entry.quantity)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                  <span className="text-slate-700">Subtotal confitería</span>
                  <div className="text-right">
                    <span className="text-[#3E2186]">
                      ${concessionTotal.toFixed(2)}
                    </span>
                    {concessionTotalVes > 0 && (
                      <span className="text-slate-600 text-xs font-normal block">
                        Bs. {concessionTotalVes.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-[#3E2186]/30">
            <span className="text-slate-800 flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-slate-800" /> Total a Pagar
            </span>
            <div className="text-right">
              <span className="text-[#3E2186] block">
                ${grandTotal.toFixed(2)}
              </span>
              {grandTotalVes > 0 && (
                <span className="text-slate-600 text-sm font-normal">
                  Bs. {grandTotalVes.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* RF-20 · Efectivo recibido y vuelto */}
          {hasCash && (
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="relative">
                <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                  Efectivo Recibido ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={cashAppliedUsd.toFixed(2)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors"
                />
              </div>
              {insufficientCash ? (
                <p className="text-xs text-red-500 font-semibold text-center">
                  El efectivo recibido es menor al monto en efectivo ($
                  {cashAppliedUsd.toFixed(2)}).
                </p>
              ) : (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                    Vuelto
                  </span>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold block">
                      ${vueltoUsd.toFixed(2)}
                    </span>
                    {vueltoVes > 0 && (
                      <span className="text-emerald-600 text-xs">
                        Bs. {vueltoVes.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Métodos de pago ── */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#3E2186] text-sm uppercase tracking-wider">
            Métodos de Pago
          </h3>

          {paymentMethods.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">
              Cargando métodos de pago...
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((p, index) => {
                const methodDef = paymentMethods.find((m) => m.id === p.method);
                const isLoyalty = p.method === 5;
                const hasReference = [3, 4].includes(p.method);
                const bankAccounts = bankAccountsByMethod[p.method] || [];
                return (
                  <div
                    key={index}
                    className={`rounded-xl p-4 space-y-3 border ${
                      p.confirmed
                        ? "bg-green-50 border-green-300"
                        : p.error
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {p.confirmed && <Lock className="w-4 h-4 text-green-600 shrink-0" />}
                      <select
                        value={p.method}
                        disabled={p.confirmed}
                        onChange={(e) => {
                          const newMethod = Number(e.target.value);
                          updatePayment(index, {
                            method: newMethod,
                            amountVes: 0,
                            amountUsd: 0,
                            fields: {},
                          });
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#3E2186] focus:outline-none focus:border-[#3E2186]"
                      >
                        {paymentMethods.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            disabled={
                              m.id !== p.method &&
                              payments.some((pp) => pp.method === m.id)
                            }
                          >
                            {m.description}
                          </option>
                        ))}
                      </select>
                      {p.confirmed ? (
                        <Lock className="w-5 h-5 text-green-600" />
                      ) : payments.length > 1 ? (
                        <button
                          onClick={() => removePayment(index)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <AiOutlineDelete size={18} />
                        </button>
                      ) : null}
                    </div>

                    {isLoyalty &&
                      (!customerInfo ? (
                        <p className="text-xs text-red-500 font-semibold">
                          Debe identificar un cliente para usar puntos de
                          fidelidad
                        </p>
                      ) : (customerInfo.pointsBalance ?? 0) <= 0 ? (
                        <p className="text-xs text-red-500 font-semibold">
                          El cliente no tiene puntos de fidelidad disponibles
                        </p>
                      ) : (
                        <p className="text-xs text-[#3E2186] font-semibold">
                          Saldo disponible: {customerInfo.pointsBalance} puntos
                        </p>
                      ))}

                    {bankAccounts.length > 0 && (
                      <div className="relative">
                        <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                          Banco
                        </label>
                        <select
                          value={p.fields?._baId || ""}
                          onChange={(e) => {
                            const baId = e.target.value;
                            const ba = bankAccounts.find(
                              (b) => b.id === Number(baId),
                            );
                            updatePayment(index, {
                              fields: {
                                ...p.fields,
                                _baId: baId,
                                Banco: ba ? ba.bankId : "",
                                _baPaymentDetails: ba ? ba.paymentDetails : [],
                              },
                            });
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors appearance-none"
                        >
                          <option value="" className="text-slate-500">
                            Seleccionar banco
                          </option>
                          {bankAccounts.map((ba) => (
                            <option key={ba.id} value={ba.id}>
                              {ba.bankName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {p.fields?._baPaymentDetails?.length > 0 &&
                      p.fields._baPaymentDetails.map((detail, i) => (
                        <div key={i} className="relative">
                          <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                            {detail.label}
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={detail.value}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 cursor-not-allowed focus:outline-none focus:border-[#3E2186]/60 transition-colors"
                          />
                        </div>
                      ))}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                          $
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.amountUsd || ""}
                          onChange={(e) =>
                            onAmountUsdChange(index, e.target.value)
                          }
                          disabled={p.confirmed}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="relative flex-1">
                        <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                          Bs.
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.amountVes || ""}
                          onChange={(e) =>
                            onAmountVesChange(index, e.target.value)
                          }
                          disabled={p.confirmed}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {hasReference && (
                      <div className="relative">
                        <label className="absolute top-1 left-3 text-[10px] font-bold text-[#3E2186] uppercase tracking-wider">
                          Referencia
                        </label>
                        <input
                          type="text"
                          placeholder="Ingresar referencia"
                          value={p.fields?.Referencia || ""}
                          onChange={(e) =>
                            updatePayment(index, {
                              fields: {
                                ...p.fields,
                                Referencia: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors"
                        />
                      </div>
                    )}
                    {!p.confirmed && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => processPayment(index)}
                          disabled={p.processing || !p.amountVes || p.amountVes <= 0}
                          className="flex-1 bg-[#3E2186] text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {p.processing ? "Procesando..." : "Procesar Pago"}
                        </button>
                        {p.error && (
                          <p className="text-xs text-red-500">{p.error}</p>
                        )}
                      </div>
                    )}
                    {p.confirmed && (
                      <div className="flex items-center gap-2 text-green-600 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Pago confirmado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {paymentMethods.length > 0 &&
            payments.length < paymentMethods.length && (
              <button
                onClick={addPayment}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-slate-600 hover:border-[#3E2186]/50 hover:text-[#3E2186] transition-all font-bold text-sm"
              >
                <AiOutlinePlus /> Agregar otro método de pago
              </button>
            )}

          {!isBalanced && !isOverpaying && (
            <p className="text-sm text-red-500 font-medium text-center">
              Los montos no cubren el total. Restan $
              {(grandTotal - paidByUser).toFixed(2)}
            </p>
          )}
          {isOverpaying && (
            <p className="text-sm text-red-500 font-medium text-center">
              Los montos exceden el total por $
              {(paidByUser - grandTotal).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-slate-700 hover:border-gray-400 hover:text-slate-900 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />{" "}
          {movie ? "Volver" : "Volver a Productos"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={
            !isFullyConfirmed ||
            payments.some((p) => {
              if (p.confirmed) return false;
              if (!p.amountVes || p.amountVes <= 0) return true;
              const methodDef = paymentMethods.find((m) => m.id === p.method);
              const needsReference =
                methodDef?.requires_reference ?? [2, 3, 4].includes(p.method);
              if (needsReference && !p.fields?.Referencia) return true;
              const ba = bankAccountsByMethod[p.method] || [];
              if (ba.length > 0 && !p.fields?.Banco) return true;
              if (
                p.method === 5 &&
                (!customerInfo ||
                  !customerInfo.pointsBalance ||
                  customerInfo.pointsBalance <= 0)
              )
                return true;
              return false;
            })
          }
          className="
            px-10 py-4 bg-[#3E2186] text-white font-black rounded-xl text-base uppercase tracking-widest
            hover:brightness-110 active:scale-95 transition-all
            shadow-xl shadow-[#3E2186]/40
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          Confirmar Venta · ${grandTotal.toFixed(2)}
        </button>
        {!isFullyConfirmed && (
          <p className="text-xs text-center text-amber-600 font-medium mt-2">
            {!allConfirmed
              ? `Falta procesar ${payments.filter(p => !p.confirmed && p.amountVes > 0).length} método(s) de pago.`
              : `Los montos confirmados ($${confirmedTotal.toFixed(2)}) no coinciden con el total ($${grandTotal.toFixed(2)}).`}
          </p>
        )}
      </div>
    </div>
  );
}
