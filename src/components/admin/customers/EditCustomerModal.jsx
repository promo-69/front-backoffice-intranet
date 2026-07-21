import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { SelectCustom } from "@/components/ui/SelectCustom";
import { updateCustomer } from "@/services/customers.service";

const GENDERS = [
  { value: "none", label: "Sin especificar" },
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

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
    const p = customer.person;
    setForm({
      first_name: p.first_name ?? "",
      last_name: p.last_name ?? "",
      document_number: p.document_number ?? "",
      phone_number: p.phone_number ?? "",
      personal_email: p.personal_email ?? "",
      gender: p.gender || "none",
      birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
    });
    setError("");
  }, [customer]);

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
      // El backend espera el body PLANO y en camelCase
      // (firstName, lastName, phoneNumber, email, birthDate, gender).
      await updateCustomer(customer.customer.id, {
        firstName: form.first_name.trim(),
        lastName: form.last_name.trim(),
        phoneNumber: form.phone_number.trim() || null,
        email: form.personal_email.trim() || null,
        gender: form.gender && form.gender !== "none" ? form.gender : null,
        birthDate: form.birth_date || null,
      });
      onClose(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Ocurrió un error al actualizar el cliente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all";

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[480px] font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-base font-black uppercase tracking-widest text-brand-primary">
            Editar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Nombre">
            <input
              value={form.first_name}
              onChange={handle("first_name")}
              className={inputClass}
              placeholder="Nombre"
            />
          </Field>
          <Field label="Apellido">
            <input
              value={form.last_name}
              onChange={handle("last_name")}
              className={inputClass}
              placeholder="Apellido"
            />
          </Field>

          <Field label="Nro. Documento">
            <input
              value={form.document_number}
              disabled
              className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
              title="El documento no puede modificarse"
            />
          </Field>

          <SelectCustom
            label="Género"
            placeholder="Sin especificar"
            options={GENDERS}
            value={form.gender}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, gender: val }))
            }
          />

          <Field label="Teléfono">
            <input
              value={form.phone_number}
              onChange={handle("phone_number")}
              className={inputClass}
              placeholder="Ej: 04XX-XXXXXXX"
            />
          </Field>

          <DatePickerCustom
            label="Fecha de Nacimiento"
            value={form.birth_date}
            onChange={(iso) =>
              setForm((prev) => ({ ...prev, birth_date: iso }))
            }
          />

          <div className="col-span-2">
            <Field label="Correo Personal">
              <input
                type="email"
                value={form.personal_email}
                onChange={handle("personal_email")}
                className={inputClass}
                placeholder="correo@ejemplo.com"
              />
            </Field>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium text-center">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={loading}
            className="rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-brand-primary hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
