import { useState } from "react";
import { getCustomerByDocument, createCustomer } from "../../services/customers.service";

export default function StepIdentifyCustomer({ onNext }) {
  const [documentNumber, setDocumentNumber] = useState("");
  const [customer, setCustomer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "", gender: "", birthDate: "" });
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const doc = documentNumber.trim();
    if (!doc) return;
    if (!/^[vejpg]-?\d{5,12}$/i.test(doc)) {
      setError("Formato de cédula inválido (ej. V-12345678)");
      return;
    }
    setSearching(true);
    setError("");
    setCustomer(null);
    setNotFound(false);
    try {
      const found = await getCustomerByDocument(doc);
      if (found) {
        setCustomer(found);
      } else {
        setNotFound(true);
        setForm({ firstName: "", lastName: "", phoneNumber: "", email: "", gender: "", birthDate: "" });
      }
    } catch (err) {
      setError("Error al buscar cliente. Intente de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Nombre y apellido son obligatorios");
      return;
    }
    if (!/^[vejpg]-?\d{5,12}$/i.test(documentNumber.trim())) {
      setError("Formato de cédula inválido (ej. V-12345678)");
      return;
    }
    if (form.phoneNumber.trim()) {
      const phoneClean = form.phoneNumber.replace(/\D/g, "");
      if (phoneClean.length > 11) {
        setError("El teléfono debe tener máximo 11 dígitos");
        return;
      }
      if (phoneClean !== form.phoneNumber.trim()) {
        setError("El teléfono solo debe contener números");
        return;
      }
    }
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setError("Correo electrónico inválido");
        return;
      }
    }
    setRegistering(true);
    setError("");
    try {
      const doc = documentNumber.trim().replace(/\s+/g, "").toUpperCase();
      const normalizedDoc = doc.includes("-") ? doc : doc.replace(/^([VEJPG])/, "$1-");
      const payload = {
        documentNumber: normalizedDoc,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber.replace(/\D/g, "");
      if (form.email.trim()) payload.email = form.email.trim().toLowerCase();
      if (form.gender) payload.gender = Number(form.gender);
      if (form.birthDate.trim()) payload.birthDate = form.birthDate.trim();
      const created = await createCustomer(payload);
      setCustomer(created);
      setNotFound(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al registrar cliente");
    } finally {
      setRegistering(false);
    }
  };

  const handleContinue = () => {
    const doc = documentNumber.trim().replace(/\s+/g, "").toUpperCase();
    const normalizedDoc = doc.includes("-") ? doc : doc.replace(/^([VEJPG])/, "$1-");
    onNext({
      customerId: customer.customer?.id,
      documentNumber: customer.person?.document_number || normalizedDoc,
      firstName: customer.person?.first_name || form.firstName,
      lastName: customer.person?.last_name || form.lastName,
      pointsBalance: customer.customer?.points_balance ?? 0,
      loyaltyLevel: customer.customer.loyalty?.level_name || "",
    });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Identificar Cliente</h2>
      <p className="text-slate-600 text-sm mb-6">Ingrese la cédula del cliente para buscar o registrarlo</p>

      {!customer && (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Cédula (ej. V-12345678)"
              value={documentNumber}
              onChange={(e) => { setDocumentNumber(e.target.value); setNotFound(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3E2186]"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !documentNumber.trim()}
              className="px-6 py-3 bg-[#3E2186] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {searching ? "..." : "Buscar"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {notFound && (
            <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
              <p className="text-sm text-slate-600">Cliente no encontrado. Registre los datos obligatorios:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Apellido *</label>
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Teléfono</label>
                <input
                  type="text"
                  placeholder="Teléfono (opcional)"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Correo</label>
                <input
                  type="email"
                  placeholder="Correo (opcional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Género</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186] bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">Masculino</option>
                    <option value="2">Femenino</option>
                    <option value="3">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3E2186]"
                  />
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-3 bg-[#3E2186] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {registering ? "Registrando..." : "Registrar y Continuar"}
              </button>
            </div>
          )}
        </>
      )}

      {customer && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                {customer.person?.first_name?.[0]}{customer.person?.last_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-slate-800">{customer.person?.first_name} {customer.person?.last_name}</p>
                <p className="text-sm text-slate-600">{customer.person?.document_number}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              {customer.customer?.loyalty?.level_name && (
                <span className="bg-[#3E2186]/10 text-[#3E2186] px-3 py-1 rounded-full font-bold">
                  {customer.customer.loyalty.level_name}
                </span>
              )}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                {customer.customer?.points_balance ?? 0} pts
              </span>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-[#3E2186] text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            Continuar →
          </button>
        </div>
      )}
    </div>
  );
}