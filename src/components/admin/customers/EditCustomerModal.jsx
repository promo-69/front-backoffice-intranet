import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { Loader2 } from "lucide-react";

import { updateCustomer } from "@/services/customers.service";

const GENDERS = [
  { value: "none", label: "Sin especificar" },
  { value: "1", label: "Masculino" },
  { value: "2", label: "Femenino" },
  { value: "3", label: "Prefiero no decirlo" },
];

export default function EditCustomerModal({ open, customer, onClose }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    document_number: "",
    phone_number: "",
    personal_email: "",
    gender: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    const p = customer.person || {};
    setForm({
      first_name: p.first_name ?? "",
      last_name: p.last_name ?? "",
      document_number: p.document_number ?? "",
      phone_number: p.phone_number ?? "",
      personal_email: p.personal_email ?? "",
      gender: p.gender != null ? String(p.gender) : "none",
      birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
    });
    setError("");
  }, [customer, open]);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("El nombre y apellido son obligatorios.");
      return;
    }
    try {
      setLoading(true);
      setError("");

      await updateCustomer(customer.customer.id, {
        firstName: form.first_name.trim(),
        lastName: form.last_name.trim(),
        phoneNumber: form.phone_number.trim() || null,
        email: form.personal_email.trim() || null,
        gender: form.gender && form.gender !== "none" ? Number(form.gender) : null,
        birthDate: form.birth_date || null,
      });

      onClose(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Ocurrió un error al actualizar el cliente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-lg bg-white rounded-cineflix p-6 shadow-2xl font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary uppercase">
            Editar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            {/* NOMBRE */}
            <InputForm
              label="Nombre"
              value={form.first_name}
              onChange={handle("first_name")}
              disabled={loading}
              placeholder="Nombre"
            />

            {/* APELLIDO */}
            <InputForm
              label="Apellido"
              value={form.last_name}
              onChange={handle("last_name")}
              disabled={loading}
              placeholder="Apellido"
            />

            {/* DOCUMENTO (Deshabilitado) */}
            <InputForm
              label="Nro. Documento"
              value={form.document_number}
              disabled
            />

            {/* GÉNERO */}
            <SelectForm
              label="Género"
              value={form.gender}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gender: e.target.value }))
              }
              disabled={loading}
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </SelectForm>

            {/* TELÉFONO */}
            <InputForm
              label="Teléfono"
              value={form.phone_number}
              onChange={handle("phone_number")}
              disabled={loading}
              placeholder="Ej: 04XX-XXXXXXX"
            />

            {/* FECHA DE NACIMIENTO */}
            <DatePickerCustom
              label="Fecha de Nacimiento"
              value={form.birth_date}
              onChange={(iso) =>
                setForm((prev) => ({ ...prev, birth_date: iso }))
              }
              disabled={loading}
            />
          </div>

          {/* CORREO PERSONAL */}
          <InputForm
            label="Correo Personal"
            type="email"
            value={form.personal_email}
            onChange={handle("personal_email")}
            disabled={loading}
            placeholder="correo@ejemplo.com"
          />

          {error && (
            <p className="text-red-500 text-xs text-center font-bold uppercase italic mt-2">
              * {error}
            </p>
          )}
        </div>

        <DialogFooter className="pt-4 border-t flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-brand-primary text-white font-bold px-6 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}