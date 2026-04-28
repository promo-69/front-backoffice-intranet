import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";

export function EditCinemaModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6">
        <button
          onClick={onClose}
          className="
            absolute 
            top-3 
            right-3 
            text-gray-400 
            hover:text-brand-primary 
            transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            Registrar Empleado
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground">
            Ingrese los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        {/* FORMULARIO */}
        <div className="space-y-4 mt-4">
          <InputForm label="Nombre completo" placeholder="Ej: María González" />

          <InputForm
            label="Correo electrónico"
            placeholder="Ej: maria.gonzalez@example.com"
          />

          <SelectForm label="Rol">
            <option value="">Seleccione un rol</option>
            <option value="CAJERO">Cajero</option>
            <option value="OPERADOR">Operador</option>
            <option value="ADMIN">Administrador</option>
          </SelectForm>

          <SelectForm label="Sucursal">
            <option value="">Seleccione una sucursal</option>
            <option value="CAJERO">Sucursal 1</option>
            <option value="OPERADOR">Sucursal 2</option>
            <option value="ADMIN">Sucursal 3</option>
          </SelectForm>

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
            Registrar Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
