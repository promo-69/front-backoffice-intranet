import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, errorMessage = null }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-8 text-center border-none shadow-2xl bg-white">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-50 h-20 w-20 rounded-full flex items-center justify-center text-red-500">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl font-montserrat font-extrabold text-slate-900 uppercase text-center">
            ¿Confirmar Eliminación?
          </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium pt-2 text-center w-full">
              Estás a punto de eliminar <span className="font-bold text-slate-900">"{itemName}"</span>. 
              Esta acción no se puede deshacer.
            </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-left">
            <strong className="block font-semibold mb-1">No se pudo eliminar</strong>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <Button type="button" variant="ghost" onClick={(e) => { e.stopPropagation(); onClose(); }} className="flex-1 rounded-xl font-bold text-slate-400">
            CANCELAR
          </Button>
          <Button type="button" onClick={(e) => { e.stopPropagation(); onConfirm(); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200">
            ELIMINAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}