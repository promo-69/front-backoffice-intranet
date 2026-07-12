import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { InputForm } from "@/components/ui/inputForm";
import { SelectCustom } from "@/components/ui/SelectCustom";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { getCatalogByName } from "@/services/catalog.service";
import { cinemasService } from "@/services/cinemas.service";
import { concessionsService } from "@/services/concessions.service";

function ErrorMessage({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">{message}</p>
  ) : null;
}

const REWARD_TYPES = [
  { value: "PRODUCT", label: "Producto" },
  { value: "COMBO", label: "Combo" },
  { value: "BLANK_TICKET", label: "Boleto en Blanco" },
  { value: "TWO_FOR_ONE", label: "2x1 en Entradas" },
];

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  pointsCost: "",
  requiredLoyaltyLevel: "",
  cinema: "",
  rewardType: "",
  product: "",
  combo: "",
  quantity: "1",
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function RewardModal({ open, onClose, initialData, onSave }) {
  const { user } = useAuth();
  // El superadmin puede elegir la sucursal aunque tenga una asignada.
  // Un empleado normal queda anclado a su sucursal (igual que en el backend).
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isBranchLocked = !!user?.cinemaId && !isSuperAdmin;

  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [catalogs, setCatalogs] = useState({
    levels: [],
    cinemas: [],
    products: [],
    combos: [],
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          imageUrl: initialData.image_url || initialData.imageUrl || "",
          pointsCost: initialData.points_cost?.toString() || initialData.pointsCost?.toString() || "",
          requiredLoyaltyLevel:
            initialData.required_loyalty_level?.toString() ||
            initialData.requiredLoyaltyLevel?.toString() ||
            "",
          cinema: (initialData.cinema ?? "").toString(),
          rewardType: initialData.reward_type || initialData.rewardType || "",
          product: (initialData.product ?? "").toString(),
          combo: (initialData.combo ?? "").toString(),
          quantity: initialData.quantity?.toString() || "1",
          startDate: (initialData.start_date || initialData.startDate || "").toString().slice(0, 10),
          endDate: (initialData.end_date || initialData.endDate || "").toString().slice(0, 10),
          isActive: initialData.is_active ?? initialData.isActive ?? true,
        });
      } else {
        setFormData({
          ...emptyForm,
          // Sugerimos la sucursal del usuario como valor inicial (el superadmin puede cambiarla).
          cinema: user?.cinemaId ? user.cinemaId.toString() : "",
        });
      }
      setErrors({});
      fetchCatalogs();
    }
  }, [open, initialData]);

  const fetchCatalogs = async () => {
    try {
      const [levels, cinemas] = await Promise.all([
        getCatalogByName("loyalty-levels").catch(() => []),
        cinemasService.getAll().catch(() => []),
      ]);
      setCatalogs((prev) => ({ ...prev, levels, cinemas }));
    } catch (error) {
      console.error("Error fetching catalogs", error);
    }
  };

  // Productos/combos dependen de la sucursal: se cargan los disponibles de esa sucursal
  // y se recargan cuando cambia la sucursal seleccionada.
  useEffect(() => {
    if (!open) return;
    const cinemaId = formData.cinema;
    if (!cinemaId) {
      setCatalogs((prev) => ({ ...prev, products: [], combos: [] }));
      return;
    }
    let cancelled = false;
    (async () => {
      const [products, combos] = await Promise.all([
        concessionsService.getAvailableProducts(cinemaId).catch(() => []),
        concessionsService.getAvailableCombos(cinemaId).catch(() => []),
      ]);
      if (!cancelled) setCatalogs((prev) => ({ ...prev, products, combos }));
    })();
    return () => {
      cancelled = true;
    };
  }, [open, formData.cinema]);

  // Helpers de cambio (los componentes Custom devuelven el valor directo, no un evento)
  const setField = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const mapBackendErrorToSpanish = (message) => {
    if (!message) return "Ocurrió un error inesperado al guardar.";
    if (message.includes("Faltan campos requeridos")) {
      return "Por favor, completa todos los campos obligatorios del formulario.";
    }
    return message;
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Requerido.";
    if (!formData.rewardType) newErrors.rewardType = "Requerido.";

    const pointsCost = parseInt(formData.pointsCost, 10);
    if (isNaN(pointsCost) || pointsCost <= 0) newErrors.pointsCost = "Entero mayor a 0.";

    const requiredLevel = parseInt(formData.requiredLoyaltyLevel, 10);
    if (isNaN(requiredLevel) || requiredLevel <= 0) newErrors.requiredLoyaltyLevel = "Requerido.";

    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) newErrors.quantity = "Entero mayor a 0.";

    if (!isBranchLocked && !formData.cinema) newErrors.cinema = "Requerido.";

    if (formData.rewardType === "PRODUCT" && !formData.product) newErrors.product = "Requerido para tipo Producto.";
    if (formData.rewardType === "COMBO" && !formData.combo) newErrors.combo = "Requerido para tipo Combo.";

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "La fecha final debe ser mayor o igual a la de inicio.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        pointsCost,
        requiredLoyaltyLevel: requiredLevel,
        cinema: formData.cinema ? Number(formData.cinema) : undefined,
        rewardType: formData.rewardType,
        product: formData.rewardType === "PRODUCT" ? Number(formData.product) : null,
        combo: formData.rewardType === "COMBO" ? Number(formData.combo) : null,
        // La cantidad aplica a todos los tipos: unidades entregadas (producto/combo)
        // o vales emitidos (boleto en blanco / 2x1).
        quantity,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isActive: !!formData.isActive,
      };

      if (isEdit) payload.id = initialData.id;

      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar premio:", error);
      const serverMessage = error.response?.data?.message || error.message;
      setErrors((prev) => ({ ...prev, general: mapBackendErrorToSpanish(serverMessage) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const needsProduct = formData.rewardType === "PRODUCT";
  const needsCombo = formData.rewardType === "COMBO";
  const isVoucherType = formData.rewardType === "BLANK_TICKET" || formData.rewardType === "TWO_FOR_ONE";

  const quantityLabel = isVoucherType ? "Cantidad de Vales" : "Cantidad de Unidades";
  const quantityHelp =
    needsProduct || needsCombo
      ? "Unidades entregadas por canje. Para un 2x1 (p. ej. 2 cotufas por el precio en puntos de una), coloca 2."
      : "Número de vales emitidos por canje (2x1 en entradas = 2).";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-3xl bg-white rounded-cineflix p-0 shadow-2xl border-none flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Premio" : "Nuevo Premio de Fidelidad"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifica los datos del premio canjeable por CinePuntos."
              : "Configura un nuevo premio canjeable solo con CinePuntos."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputForm label="Nombre del Premio" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Boleto en blanco de cumpleaños" />
                <ErrorMessage message={errors.name} />
              </div>

              <div className="md:col-span-2">
                <InputForm label="Descripción (opcional)" name="description" value={formData.description} onChange={handleChange} placeholder="Breve descripción visible para el cliente" />
              </div>

              <div>
                <SelectCustom
                  label="Tipo de Premio"
                  placeholder="Seleccione..."
                  options={REWARD_TYPES}
                  value={formData.rewardType}
                  onValueChange={(v) => setField("rewardType", v)}
                  error={errors.rewardType}
                />
              </div>

              <div>
                <SelectCustom
                  label="Nivel de Fidelidad Requerido"
                  placeholder="Seleccione..."
                  options={catalogs.levels.map((lvl) => ({ value: lvl.id, label: lvl.name }))}
                  value={formData.requiredLoyaltyLevel}
                  onValueChange={(v) => setField("requiredLoyaltyLevel", v)}
                  error={errors.requiredLoyaltyLevel}
                />
              </div>

              <div>
                <InputForm label="Costo en CinePuntos" type="number" min="1" name="pointsCost" value={formData.pointsCost} onChange={handleChange} placeholder="Ej: 1500" />
                <ErrorMessage message={errors.pointsCost} />
              </div>

              <div>
                <InputForm
                  label={quantityLabel}
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
                <p className="text-[9px] text-slate-400 mt-1 ml-1">{quantityHelp}</p>
                <ErrorMessage message={errors.quantity} />
              </div>

              <div>
                <SelectCustom
                  label="Sucursal"
                  placeholder="Seleccione..."
                  options={catalogs.cinemas.map((c) => ({ value: c.id, label: c.name || c.description }))}
                  value={formData.cinema}
                  onValueChange={(v) => setField("cinema", v)}
                  error={errors.cinema}
                  disabled={isBranchLocked}
                />
                {isBranchLocked ? (
                  <p className="text-[9px] text-slate-400 mt-1 ml-1">
                    Estás gestionando premios de tu sucursal asignada.
                  </p>
                ) : (
                  <p className="text-[9px] text-slate-400 mt-1 ml-1">
                    Elige la sucursal a la que pertenece este premio.
                  </p>
                )}
              </div>

              {needsProduct && (
                <div>
                  <SelectCustom
                    label="Producto"
                    placeholder="Seleccione..."
                    options={catalogs.products.map((p) => ({ value: p.id, label: p.name || p.description }))}
                    value={formData.product}
                    onValueChange={(v) => setField("product", v)}
                    error={errors.product}
                  />
                  {!formData.cinema && (
                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                      Selecciona primero una sucursal para ver sus productos.
                    </p>
                  )}
                </div>
              )}

              {needsCombo && (
                <div>
                  <SelectCustom
                    label="Combo"
                    placeholder="Seleccione..."
                    options={catalogs.combos.map((c) => ({ value: c.id, label: c.name || c.description }))}
                    value={formData.combo}
                    onValueChange={(v) => setField("combo", v)}
                    error={errors.combo}
                  />
                  {!formData.cinema && (
                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                      Selecciona primero una sucursal para ver sus combos.
                    </p>
                  )}
                </div>
              )}

              {isVoucherType && (
                <div className="md:col-span-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-3 text-[11px] text-brand-primary font-semibold">
                  Este tipo emite vales de un solo uso (código + QR), válidos por 30 días desde el canje. No debe asociarse a producto ni combo.
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-6">Vigencia (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePickerCustom
                    label="Fecha de Inicio"
                    value={formData.startDate}
                    onChange={(v) => setField("startDate", v)}
                  />
                  <ErrorMessage message={errors.startDate} />
                </div>
                <div>
                  <DatePickerCustom
                    label="Fecha de Fin"
                    value={formData.endDate}
                    onChange={(v) => setField("endDate", v)}
                  />
                  <ErrorMessage message={errors.endDate} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-brand-primary">¿Premio Activo?</span>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(c) => setField("isActive", c)}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Los premios inactivos dejan de mostrarse en el catálogo del cliente, pero conservan su historial de canjes.
              </p>
            </div>

            {errors.general && (
              <p className="text-red-500 text-xs text-center font-bold mt-2">{errors.general}</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="flex-1">
            Cancelar
          </Button>
          <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:LOYALTY-REWARDS" : "CRUD:CREATE:LOYALTY-REWARDS"} title="No tienes permiso">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90">
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
