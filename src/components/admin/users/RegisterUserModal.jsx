import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Label, Input } from "@/components/ui/input";

export function RegisterUserModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Registrar Usuario
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground">
            Ingrese los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        {/* FORMULARIO */}
        <div className="space-y-4 mt-4">
          <Label label="Nombre completo">
            <Input placeholder="Ej: María González" />
          </Label>

          <Label label="Correo electrónico">
            <Input placeholder="correo@cineflix.com" />
          </Label>

          <Label label="Rol">
            <Input placeholder="Administrador / Operador / Cajero" />
          </Label>

          <Label label="Sucursal asignada">
            <Input placeholder="Sucursal principal" />
          </Label>

          <p className="text-[11px] text-gray-500 mt-2">
            Se enviarán las credenciales automáticamente al correo registrado.
            El usuario deberá cambiar su contraseña en el primer inicio de
            sesión.
          </p>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            className="font-montserrat border-gray-300"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix">
            Registrar Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
