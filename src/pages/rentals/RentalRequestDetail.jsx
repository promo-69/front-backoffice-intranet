import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRentalRequestById, updateRentalStatus, confirmRentalPayment } from "@/services/rentals.service";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Ban, DollarSign } from "lucide-react";

const STATUS_DEF = {
  1: { label: "Pendiente de Revisión", color: "bg-yellow-100 text-yellow-800" },
  2: { label: "Pendiente de Pago", color: "bg-blue-100 text-blue-800" },
  3: { label: "Confirmada", color: "bg-green-100 text-green-800" },
  4: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  5: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
};

const EVENT_TYPES = {
  4: "Corporativo",
  5: "Cumpleaños",
  6: "Evento Privado",
  7: "Lanzamiento de Producto",
};

export default function RentalRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("1");

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRentalRequestById(id);
      setReq(data.data || data);
    } catch {
      toast.error("Error al cargar la solicitud");
      navigate("/admin/rentals");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function handleApprove() {
    if (!price || Number(price) <= 0) {
      return toast.warning("Ingresa un precio válido");
    }
    setActionLoading(true);
    try {
      await updateRentalStatus(id, { status: 2, currency: Number(currency), price: Number(price) });
      toast.success("Solicitud aprobada. Se ha enviado un correo al cliente.");
      setShowApproveForm(false);
      fetchDetail();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al aprobar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm("¿Rechazar esta solicitud? Se notificará al cliente.")) return;
    setActionLoading(true);
    try {
      await updateRentalStatus(id, { status: 4 });
      toast.success("Solicitud rechazada");
      fetchDetail();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al rechazar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar esta solicitud? Se liberará la reserva de sala.")) return;
    setActionLoading(true);
    try {
      await updateRentalStatus(id, { status: 5 });
      toast.success("Solicitud cancelada");
      fetchDetail();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al cancelar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmPayment() {
    if (!confirm("¿Confirmar que el cliente pagó? La reserva de sala quedará activa.")) return;
    setActionLoading(true);
    try {
      await confirmRentalPayment(id);
      toast.success("Pago confirmado. La reserva de sala está activa.");
      fetchDetail();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al confirmar el pago");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto font-montserrat p-8 text-center text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!req) return null;

  const st = STATUS_DEF[req.status?.id] || STATUS_DEF[1];
  const canApprove = req.status?.id === 1;
  const canReject = req.status?.id === 1;
  const canConfirmPayment = req.status?.id === 2;
  const canCancel = [1, 2].includes(req.status?.id);

  return (
    <div className="max-w-4xl mx-auto font-montserrat space-y-6">
      <button
        onClick={() => navigate("/admin/rentals")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a solicitudes
      </button>

      <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-brand-primary">{req.event_name}</h3>
            <p className="text-xs text-muted-foreground">
              Solicitud #{req.id} &middot; {EVENT_TYPES[req.event_type?.id] || req.event_type?.description || "—"}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${st.color}`}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Sala</span>
            <p className="font-medium">{req.room?.name || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Cliente</span>
            <p className="font-medium">
              {req.customer?.people?.first_name} {req.customer?.people?.last_name}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Contacto</span>
            <p className="font-medium">{req.customer?.people?.email || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Teléfono</span>
            <p className="font-medium">{req.customer?.people?.phone || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Inicio</span>
            <p className="font-medium">
              {new Date(req.requested_start_time).toLocaleString("es-VE")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Fin</span>
            <p className="font-medium">
              {new Date(req.requested_end_time).toLocaleString("es-VE")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Asistentes</span>
            <p className="font-medium">{req.attendees || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Precio</span>
            <p className="font-medium">{req.price ? `$${req.price}` : "—"}</p>
          </div>
        </div>

        {req.event_description && (
          <div>
            <span className="text-muted-foreground text-xs">Descripción</span>
            <p className="text-sm mt-1">{req.event_description}</p>
          </div>
        )}

        {canApprove || canReject || canConfirmPayment || canCancel ? (
          <div className="flex gap-3 pt-4 border-t">
            {canApprove && (
              <button
                onClick={() => setShowApproveForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Aprobar
              </button>
            )}
            {canConfirmPayment && (
              <button
                onClick={handleConfirmPayment}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" /> Pagado
              </button>
            )}
            {canReject && (
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Rechazar
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Ban className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        ) : null}
      </div>

      {showApproveForm && (
        <div className="bg-white p-6 rounded-cineflix border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-brand-primary">Aprobar Solicitud</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Precio</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
              >
                <option value="1">USD</option>
                <option value="2">VES</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-brand-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {actionLoading ? "Procesando..." : "Confirmar Aprobación"}
            </button>
            <button
              onClick={() => setShowApproveForm(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
