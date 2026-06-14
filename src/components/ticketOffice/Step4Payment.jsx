import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Ticket, ShoppingBag, DollarSign } from "lucide-react";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { paymentsService } from "../../services/payments.service";

export default function Step4Payment({ movie, showtime, selectedSeats, ticketsNeeded, totalTickets, concessionItems, concessionTotal, onConfirm, onBack, paymentMethods = [], vesCurrencyId = 2, loyaltyInfo = null }) {
  const [payments, setPayments] = useState([{ method: paymentMethods[0]?.id || 1, amount: totalTickets + concessionTotal, fields: {} }]);
  const [confirmed, setConfirmed] = useState(false);

  const grandTotal = totalTickets + concessionTotal;
  const paidByUser = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const isBalanced = Math.abs(paidByUser - grandTotal) < 0.01;

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm({ payments });
  };

  const addPayment = () => {
    const usedMethods = payments.map((p) => p.method);
    const nextMethod = paymentMethods.find((m) => !usedMethods.includes(m.id)) || paymentMethods[0];
    setPayments([...payments, { method: nextMethod?.id || 1, amount: 0, fields: {} }]);
  };

  const updatePayment = (index, patch) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const removePayment = (index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#F6AD38]/20 rounded-full scale-150 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-[#F6AD38] flex items-center justify-center shadow-2xl shadow-[#F6AD38]/40">
            <CheckCircle className="w-12 h-12 text-[#1d1430]" strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#F6AD38] mb-2 uppercase tracking-widest">¡Venta Exitosa!</h2>
        <p className="text-gray-400 text-center max-w-sm">
          Los boletos han sido registrados correctamente. Entrega los tiquetes al cliente.
        </p>
        <div className="mt-6 bg-white/5 border border-[#F6AD38]/30 rounded-2xl p-6 text-center w-full max-w-sm">
          <p className="text-sm text-gray-400 mb-1">{movie.title}</p>
          <p className="text-white font-bold">{showtime.time} · {showtime.room}</p>
          <div className="flex gap-2 flex-wrap justify-center mt-2">
            {selectedSeats.map((s) => (
              <span key={s.id} className="bg-[#F6AD38] text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs">{s.id}</span>
            ))}
          </div>
          <p className="text-2xl font-bold text-[#F6AD38] mt-4">${grandTotal.toFixed(2)}</p>
          <div className="mt-2 space-y-1">
            {payments.map((p, i) => {
              const m = paymentMethods.find((pm) => pm.id === p.method);
              return <p key={i} className="text-xs text-gray-500">{m?.description}: ${(Number(p.amount) || 0).toFixed(2)}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-[#F6AD38]">Resumen y Pago</h2>
        <p className="text-gray-400 text-sm mt-1">Confirma los detalles y selecciona los métodos de pago</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Resumen de compra ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-[#F6AD38] flex items-center gap-2 text-sm uppercase tracking-wider">
            <Ticket className="w-4 h-4" /> Boletos
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>{movie.title}</span>
              <span className="text-white font-bold">{ticketsNeeded}x</span>
            </div>
            <div className="text-xs text-gray-500 pl-2">
              <p>{showtime.time} · {showtime.room} · {showtime.date}</p>
              <div className="flex gap-1 flex-wrap mt-1">
                {selectedSeats.map((s) => (
                  <span key={s.id} className="bg-[#F6AD38]/20 text-[#F6AD38] px-1.5 py-0.5 rounded text-[10px] font-bold">{s.id}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-white/10">
              <span className="text-gray-300">Subtotal boletos</span>
              <span className="text-[#F6AD38]">${totalTickets.toFixed(2)}</span>
            </div>
          </div>

          {concessionItems.length > 0 && (
            <>
              <h3 className="font-bold text-[#F6AD38] flex items-center gap-2 text-sm uppercase tracking-wider pt-2 border-t border-white/10">
                <ShoppingBag className="w-4 h-4" /> Confitería
              </h3>
              <div className="space-y-1">
                {concessionItems.map((entry) => (
                  <div key={entry.key} className="flex justify-between text-sm text-gray-300">
                    <span>{entry.item.emoji} {entry.item.name} ×{entry.qty}</span>
                    <span>${(entry.item.price * entry.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1 border-t border-white/10">
                  <span className="text-gray-300">Subtotal confitería</span>
                  <span className="text-[#F6AD38]">${concessionTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-[#F6AD38]/30">
            <span className="text-white flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-[#F6AD38]" /> Total a Pagar
            </span>
            <span className="text-[#F6AD38]">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Métodos de pago ── */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#F6AD38] text-sm uppercase tracking-wider">Métodos de Pago</h3>

          {paymentMethods.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Cargando métodos de pago...</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p, index) => {
                const methodDef = paymentMethods.find((m) => m.id === p.method);
                const isLoyalty = p.method === 6;
                const isUsdMethod = [1, 5].includes(p.method);
                const hasReference = [4, 5, 7].includes(p.method);
                const amountLabel = isLoyalty
                  ? "Puntos a usar"
                  : isUsdMethod
                    ? "Monto ($)"
                    : "Monto (Bs.)";
                return (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={p.method}
                        onChange={(e) => updatePayment(index, { method: Number(e.target.value), fields: {} })}
                        className="flex-1 bg-[#1d1430] border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-[#F6AD38] focus:outline-none focus:border-[#F6AD38]"
                      >
                        {paymentMethods.map((m) => (
                          <option key={m.id} value={m.id} disabled={m.id !== p.method && payments.some((pp) => pp.method === m.id)}>
                            {m.description}
                          </option>
                        ))}
                      </select>
                      {payments.length > 1 && (
                        <button onClick={() => removePayment(index)} className="text-red-400 hover:text-red-500 p-1">
                          <AiOutlineDelete size={18} />
                        </button>
                      )}
                    </div>

                    {isLoyalty && loyaltyInfo && (
                      <p className="text-xs text-[#F6AD38] font-semibold">
                        Saldo disponible: {loyaltyInfo.points_balance} puntos
                      </p>
                    )}

                    <div className="relative">
                      <label className="absolute top-1 left-3 text-[10px] font-bold text-[#F6AD38] uppercase tracking-wider">{amountLabel}</label>
                      <input
                        type="number"
                        step={isLoyalty ? "1" : "0.01"}
                        min="0"
                        max={isLoyalty ? (loyaltyInfo?.points_balance || Infinity) : undefined}
                        value={p.amount}
                        onChange={(e) => updatePayment(index, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 pt-6 pb-2 text-sm text-black placeholder:text-gray-600 focus:outline-none focus:border-[#F6AD38]/60 transition-colors"
                      />
                    </div>

                    {hasReference && (
                      <div className="relative">
                        <label className="absolute top-1 left-3 text-[10px] font-bold text-[#F6AD38] uppercase tracking-wider">Referencia</label>
                        <input
                          type="text"
                          placeholder="Ingresar referencia"
                          value={p.fields?.Referencia || ""}
                          onChange={(e) => updatePayment(index, { fields: { ...p.fields, Referencia: e.target.value } })}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 pt-6 pb-2 text-sm text-black placeholder:text-gray-600 focus:outline-none focus:border-[#F6AD38]/60 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {paymentMethods.length > 0 && payments.length < paymentMethods.length && (
            <button
              onClick={addPayment}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:border-[#F6AD38]/50 hover:text-[#F6AD38] transition-all font-bold text-sm"
            >
              <AiOutlinePlus /> Agregar otro método de pago
            </button>
          )}

          {!isBalanced && (
            <p className="text-sm text-red-400 font-medium text-center">
              Los montos no cubren el total. Restan ${(grandTotal - paidByUser).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 hover:text-black transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <button
          onClick={handleConfirm}
          disabled={!isBalanced || payments.some((p) => !p.amount || p.amount <= 0)}
          className="
            px-10 py-4 bg-[#F6AD38] text-[#1d1430] font-black rounded-xl text-base uppercase tracking-widest
            hover:brightness-110 active:scale-95 transition-all
            shadow-xl shadow-[#F6AD38]/40
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          Confirmar Venta · ${grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
