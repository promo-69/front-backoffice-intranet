import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { CustomToast } from "@/components/ui/CustomToast";

export function BillingModal({ order, onClose, onBilled }) {
  const hasCustomerData = !!(order?.customer_name && order?.customer_document);

  const [useCustomer, setUseCustomer] = useState(hasCustomerData);
  const [name, setName] = useState(order?.customer_name || "");
  const [document, setDocument] = useState(order?.customer_document || "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !document.trim()) {
      toast.custom((t) => <CustomToast t={t} type="error" title="Nombre y cédula son obligatorios" />);
      return;
    }
    setLoading(true);
    try {
      const api = (await import("@/api/axios")).default;
      const resp = await api.post("/orders/billing", {
        orderId: order.id,
        use_customer_data: useCustomer,
        billing_name: name.trim(),
        billing_document: document.trim(),
        billing_address: address.trim() || undefined,
      });
      const msg = resp?.data?.message || resp?.data?.data?.message || "Factura generada exitosamente";
      toast.custom((t) => <CustomToast t={t} type="success" title={msg} />);
      onBilled?.(order.id);
      onClose();
    } catch (err) {
      toast.custom((t) => <CustomToast t={t} type="error" title={err?.response?.data?.message || "Error al facturar"} />);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomer = () => {
    const next = !useCustomer;
    setUseCustomer(next);
    if (next) {
      setName(order?.customer_name || "");
      setDocument(order?.customer_document || "");
    } else {
      setName("");
      setDocument("");
    }
  };

  const inputsLocked = useCustomer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-[#3E2186]">Facturar Orden #{order?.id}</h3>

        <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
          <p><span className="text-slate-600">Cliente:</span> {order?.customer_name || "—"}</p>
          <p><span className="text-slate-600">Documento:</span> {order?.customer_document || "—"}</p>
          <p><span className="text-slate-600">Total:</span> <span className="font-bold">${order?.total_amount_base_currency || "—"}</span></p>
        </div>

        <label className={`flex items-center gap-2 text-sm ${hasCustomerData ? "cursor-pointer" : "cursor-pointer"}`}>
          <input type="checkbox" checked={useCustomer} onChange={toggleCustomer} className="rounded" />
          Usar datos del cliente
        </label>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase">Nombre o Razón Social *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              disabled={inputsLocked}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase">Cédula o RIF *</label>
            <input type="text" value={document} onChange={e => setDocument(e.target.value)}
              disabled={inputsLocked}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase">Dirección (opcional)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#3E2186] text-white hover:brightness-110">
              {loading ? "Facturando..." : "Generar Factura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
