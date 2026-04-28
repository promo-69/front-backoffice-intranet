import { useEffect, useState } from "react";
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

// IMPORTANTE: Se añade "default" para que el import en CinemaPage funcione
export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    opening_time: "",
    closing_time: "",
    status: "Activo",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        opening_time: "",
        closing_time: "",
        status: "Activo",
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Aquí iría tu lógica de fetch/axios para guardar
    console.log("Datos a enviar:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit 
              ? "Modifique los detalles de la sucursal seleccionada." 
              : "Complete los datos para registrar una nueva sede en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <InputForm 
            label="Nombre de Sucursal" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Sambil Barquisimeto" 
          />

          <InputForm 
            label="Dirección" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ej: Av. Venezuela..." 
          />

          <InputForm 
            label="Teléfono" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0251-XXXXXXX" 
          />

          <div className="grid grid-cols-2 gap-4">
            <InputForm 
              label="Hora Apertura" 
              name="opening_time"
              value={formData.opening_time}
              onChange={handleChange}
              placeholder="10:00 AM" 
            />
            <InputForm 
              label="Hora Cierre" 
              name="closing_time"
              value={formData.closing_time}
              onChange={handleChange}
              placeholder="11:00 PM" 
            />
          </div>

          {isEdit && (
            <SelectForm 
              label="Estado de la Sucursal"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </SelectForm>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="font-montserrat">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-montserrat font-bold px-6 rounded-cineflix"
          >
            {isEdit ? "Guardar Cambios" : "Registrar Sucursal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}