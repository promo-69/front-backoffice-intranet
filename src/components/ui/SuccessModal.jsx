import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "¡Registro Exitoso!", 
  message = "La operación se ha realizado correctamente.",
  buttonText = "Entendido"
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-10 flex flex-col items-center text-center border-none shadow-2xl bg-white">
        
        <div className="mb-6 relative">
          {/* Efecto de pulso en el fondo */}
          <div className="absolute inset-0 bg-brand-primary/10 rounded-full scale-150 animate-pulse" />
          
          {/* Círculo del Icono */}
          <div className="relative bg-brand-primary h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Check className="text-white h-10 w-10 stroke-[3px]" />
          </div>
        </div>

        {/* Añadimos 'items-center' y 'text-center' para forzar el centrado total */}
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <DialogTitle className="text-2xl font-montserrat font-extrabold text-slate-900 uppercase tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500 font-medium leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <Button 
          onClick={onClose}
          className="mt-8 w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold py-6 rounded-cineflix text-lg transition-transform active:scale-95 shadow-md"
        >
          {buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  )
}