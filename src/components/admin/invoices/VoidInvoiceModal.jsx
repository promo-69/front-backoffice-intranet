import { useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextAreaCustom } from "@/components/ui/TextAreaCustom";

export function VoidInvoiceModal({
  isOpen,
  onClose,
  onConfirm,
  invoiceNumber,
  loading,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Debes indicar el motivo de la anulación");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-8 border-none shadow-2xl bg-white">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-50 h-20 w-20 rounded-full flex items-center justify-center text-red-500">
            <Ban className="h-10 w-10" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl font-montserrat font-extrabold text-slate-900 uppercase text-center">
            ¿Anular factura?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium pt-2 text-center w-full">
            Estás a punto de anular la factura{" "}
            <span className="font-bold text-slate-900">{invoiceNumber}</span>.
            Esta acción revierte los puntos de lealtad generados y cancela la
            orden asociada. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <TextAreaCustom
            label="Motivo de anulación"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            error={error}
            placeholder="Ej: Cliente desistió de la compra, error de cajero, reembolso solicitado..."
          />
          {error && (
            <p className="text-xs text-red-500 font-semibold mt-1.5">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1 rounded-xl font-bold text-slate-400"
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200"
          >
            {loading ? "ANULANDO..." : "ANULAR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
