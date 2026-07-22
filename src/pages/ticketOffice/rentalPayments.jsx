import { useState, useEffect, useCallback } from "react";
import { AiOutlineSearch, AiOutlineReload } from "react-icons/ai";
import { HiOutlineHome, HiOutlineCash } from "react-icons/hi";
import HeaderCashier from "../../components/ticketOffice/HeaderCashier";
import {
  getPayableRentals,
  payRentalFromPOS,
} from "../../services/rentals.service";
import { paymentsService } from "../../services/payments.service";

// Métodos que exigen número de referencia (mismo criterio que Step4Payment)
const REQUIRES_REFERENCE = [2, 3, 4];

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export default function RentalPayments() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Métodos de pago (catálogo real del backend)
  const [methods, setMethods] = useState([]);

  // Solicitud seleccionada para cobrar + formulario de pago
  const [selected, setSelected] = useState(null);
  const [methodId, setMethodId] = useState("");
  const [reference, setReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, msg }

  const fetchPayables = useCallback(async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayableRentals(q);
      setRows(data?.data?.rows ?? data?.rows ?? []);
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudieron cargar las solicitudes."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayables("");
    getPaymentMethods_();
  }, [fetchPayables]);

  const getPaymentMethods_ = () =>
    paymentsService
      .getMethods()
      .then((data) => setMethods(Array.isArray(data) ? data : data?.rows ?? []))
      .catch(() => setMethods([]));

  const onSearch = (e) => {
    e.preventDefault();
    fetchPayables(query.trim());
  };

  const openPayment = (row) => {
    setSelected(row);
    setMethodId("");
    setReference("");
    setFeedback(null);
  };

  const closePayment = () => {
    setSelected(null);
    setPaying(false);
  };

  const referenceRequired = REQUIRES_REFERENCE.includes(Number(methodId));

  const submitPayment = async () => {
    if (!methodId) {
      setFeedback({ type: "error", msg: "Selecciona un método de pago." });
      return;
    }
    if (referenceRequired && !reference.trim()) {
      setFeedback({
        type: "error",
        msg: "Este método requiere número de referencia.",
      });
      return;
    }
    setPaying(true);
    setFeedback(null);
    try {
      await payRentalFromPOS(selected.id, {
        payment_method: Number(methodId),
        reference: reference.trim() || undefined,
        amount: selected.price ? Number(selected.price) : undefined,
      });
      // La solicitud cambia de estado → desaparece del listado
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      closePayment();
      setFeedback({
        type: "success",
        msg: `Pago registrado. La reserva de "${selected.event_name}" quedó confirmada.`,
      });
    } catch (e) {
      setFeedback({
        type: "error",
        msg: e?.response?.data?.message || "No se pudo registrar el pago.",
      });
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat">
      <HeaderCashier title="Cobro de Alquileres" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#F6AD38] rounded-full flex items-center justify-center text-2xl text-[#1d1430]">
            <HiOutlineCash />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#F6AD38]">
              Cobro de Alquileres
            </h2>
            <p className="text-gray-400 text-sm">
              Solicitudes aprobadas pendientes de pago. Busca por cédula,
              nombre, correo o número de referencia.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <form onSubmit={onSearch} className="flex gap-3 my-6">
          <div className="flex-1 flex items-center bg-[rgba(45,23,72,0.87)] border border-white/15 rounded-xl px-4">
            <AiOutlineSearch className="text-gray-400 text-xl" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cédula, nombre, correo o referencia…"
              className="flex-1 bg-transparent py-3 px-3 text-white placeholder-gray-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#F6AD38] text-[#1d1430] font-bold rounded-xl hover:brightness-110 transition"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              fetchPayables("");
            }}
            className="px-4 py-3 bg-[rgba(45,23,72,0.87)] border border-white/15 rounded-xl hover:border-[#F6AD38] transition"
            title="Recargar"
          >
            <AiOutlineReload className="text-xl" />
          </button>
        </form>

        {/* Feedback global */}
        {feedback && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl border ${
              feedback.type === "success"
                ? "bg-green-500/10 border-green-500/40 text-green-300"
                : "bg-red-500/10 border-red-500/40 text-red-300"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-[rgba(45,23,72,0.87)] rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Cargando solicitudes…
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-300">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No hay solicitudes por cobrar
              {query ? " para esa búsqueda." : "."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#F6AD38] border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Documento</th>
                  <th className="px-4 py-3 font-semibold">Evento</th>
                  <th className="px-4 py-3 font-semibold">Sala / Sucursal</th>
                  <th className="px-4 py-3 font-semibold">Inicio</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3 text-gray-300">#{r.id}</td>
                    <td className="px-4 py-3 font-medium">
                      {r.customer_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.customer_document || "—"}
                    </td>
                    <td className="px-4 py-3">{r.event_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.room_name || "—"}
                      {r.cinema_name ? ` · ${r.cinema_name}` : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {fmtDateTime(r.requested_start_time)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#F6AD38]">
                      {r.price != null ? `$${Number(r.price).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openPayment(r)}
                        className="px-4 py-2 bg-[#F6AD38] text-[#1d1430] font-bold rounded-lg hover:brightness-110 transition"
                      >
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal de cobro */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#2A154B] rounded-2xl border border-white/15 p-6">
            <h3 className="text-xl font-bold text-[#F6AD38] mb-1">
              Cobrar alquiler
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {selected.event_name} · {selected.customer_name}
            </p>

            <div className="bg-[rgba(45,23,72,0.6)] rounded-xl p-4 mb-4 flex justify-between items-center">
              <span className="text-gray-300">Monto a cobrar</span>
              <span className="text-2xl font-bold text-[#F6AD38]">
                {selected.price != null
                  ? `$${Number(selected.price).toFixed(2)}`
                  : "—"}
              </span>
            </div>

            <label className="block text-sm text-gray-300 mb-1">
              Método de pago *
            </label>
            <select
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
              className="w-full bg-[rgba(45,23,72,0.87)] border border-white/15 rounded-xl px-4 py-3 mb-4 text-white outline-none focus:border-[#F6AD38]"
            >
              <option value="">Selecciona…</option>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.description || m.name}
                </option>
              ))}
            </select>

            {referenceRequired && (
              <>
                <label className="block text-sm text-gray-300 mb-1">
                  Número de referencia *
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej: 10592085446738917330"
                  className="w-full bg-[rgba(45,23,72,0.87)] border border-white/15 rounded-xl px-4 py-3 mb-4 text-white placeholder-gray-500 outline-none focus:border-[#F6AD38]"
                />
              </>
            )}

            {feedback && feedback.type === "error" && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-sm">
                {feedback.msg}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={closePayment}
                disabled={paying}
                className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitPayment}
                disabled={paying}
                className="flex-1 py-3 rounded-xl bg-[#F6AD38] text-[#1d1430] font-bold hover:brightness-110 transition disabled:opacity-50"
              >
                {paying ? "Procesando…" : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
