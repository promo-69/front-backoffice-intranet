import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Ticket,
  ShoppingBag,
  DollarSign,
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
    },
  ]);
  const [confirmed, setConfirmed] = useState(false);

  const grandTotal = totalTickets + concessionTotal;
  const grandTotalVes = totalTicketsVes + concessionTotalVes;
  const paidByUser = payments.reduce(
    (s, p) => s + (Number(p.amountUsd) || 0),
    0,
  );
  const isBalanced = Math.abs(paidByUser - grandTotal) < 0.01;
  const isOverpaying = paidByUser > grandTotal;

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

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm({ payments });
  };

  const addPayment = () => {
    const usedMethods = payments.map((p) => p.method);
    const nextMethod =
      paymentMethods.find((m) => !usedMethods.includes(m.id)) ||
      paymentMethods[0];
    setPayments([
      ...payments,
      { method: nextMethod?.id || 1, amountVes: 0, amountUsd: 0, fields: {} },
    ]);
  };

  const updatePayment = (index, patch) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  };

  const onAmountUsdChange = (index, usdAmount) => {
    const usd = parseFloat(usdAmount) || 0;
    updatePayment(index, {
      amountUsd: usd,
      amountVes: Math.round(usd * exchangeRate * 100) / 100,
    });
  };

  const onAmountVesChange = (index, vesAmount) => {
    const ves = parseFloat(vesAmount) || 0;
    updatePayment(index, {
      amountVes: ves,
      amountUsd: Math.round((ves / exchangeRate) * 100) / 100,
    });
  };

  const removePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

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

        {onNewSale && (
          <button
            onClick={onNewSale}
            className="mt-8 px-8 py-3 border border-[#3E2186]/40 text-[#3E2186] rounded-xl text-sm font-bold hover:bg-[#3E2186]/10 transition-all"
          >
            + Nueva Venta
          </button>
        )}
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
                const hasReference = [2, 3, 4].includes(p.method);
                const bankAccounts = bankAccountsByMethod[p.method] || [];
                return (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={p.method}
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
                      {payments.length > 1 && (
                        <button
                          onClick={() => removePayment(index)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <AiOutlineDelete size={18} />
                        </button>
                      )}
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
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors"
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
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 pt-6 pb-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3E2186]/60 transition-colors"
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
            !isBalanced ||
            payments.some((p) => {
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
      </div>
    </div>
  );
}
