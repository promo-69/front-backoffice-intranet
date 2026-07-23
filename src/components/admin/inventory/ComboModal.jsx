import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

function ErrorMessage({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyComboForm = {
  name: "",
  code: "",
  description: "",
  currency: "",
  price: "",
  earned_loyalty_points: "",
};

export default function ComboModal({ open, onClose, initialData, products = [], currencies = [], onSave }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyComboForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // [{ productId, quantity }]
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.sku || "",
          description: initialData.description || "",
          currency: (initialData.pricing?.currency ?? initialData.currency)?.toString() || "",
          price: (initialData.pricing?.base_price ?? initialData.price)?.toString() || "",
          earned_loyalty_points: initialData.earned_loyalty_points !== null && initialData.earned_loyalty_points !== undefined ? initialData.earned_loyalty_points.toString() : "",
        });
        setImagePreview(initialData.image_url || null);
        
        // Cargar productos asociados desde _ComboProducts
        const rawComboProducts = initialData._ComboProducts || [];
        const items = rawComboProducts.map((cp) => ({
          productId: cp.product?.toString() || "",
          quantity: cp.quantity || 1,
        }));
        setSelectedItems(items);
      } else {
        setFormData(emptyComboForm);
        setImagePreview(null);
        setSelectedItems([]);
      }
      setImageFile(null);
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "La imagen excede los 2MB" }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: "Solo se permite JPG, PNG o WebP" }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: null }));
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "price") {
      const priceRegex = /^\d+(\.\d{1,2})?$/;
      if (value && !priceRegex.test(value)) {
        error = "Ingrese un precio válido (Ej: 5.99).";
      }
      if (value && Number(value) < 0) {
        error = "El precio no puede ser negativo.";
      }
    }
    if (name === "earned_loyalty_points") {
      const pointsRegex = /^\d+$/;
      if (value && !pointsRegex.test(value)) {
        error = "Los puntos deben ser un número entero.";
      }
    }
    return error;
  };

  // Agregar un producto al combo
  const handleAddItem = () => {
    setSelectedItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  // Remover un producto del combo
  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Modificar selección de producto o cantidad
  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Campos requeridos
    const requiredFields = ["name", "code", "description", "currency", "price"];
    requiredFields.forEach((key) => {
      const value = formData[key]?.toString().trim();
      if (!value) {
        newErrors[key] = "Este campo es obligatorio.";
      } else {
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    // Validar productos incluidos
    if (selectedItems.length === 0) {
      newErrors.general = "Debe añadir al menos un producto al combo.";
    } else {
      const invalidItem = selectedItems.some((item) => !item.productId || item.quantity <= 0);
      if (invalidItem) {
        newErrors.general = "Por favor, seleccione un producto y cantidad válidos para cada fila.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("sku", formData.code.trim());
      payload.append("description", formData.description.trim());
      payload.append("currencyId", Number(formData.currency));
      payload.append("price", parseFloat(formData.price));
      
      if (formData.earned_loyalty_points) {
        payload.append("earnedLoyaltyPoints", parseInt(formData.earned_loyalty_points, 10));
      }

      // Estructurar el array de productos y enviarlo como string JSON
      const cleanProductsList = selectedItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }));
      payload.append("products", JSON.stringify(cleanProductsList));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (isEdit) {
        payload.append("id", initialData.id);
      }
      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar combo:", error);
      if (error.response?.data) {
        console.log("DETALLE DEL ERROR DEL SERVIDOR:", JSON.stringify(error.response.data, null, 2));
      }
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setErrors((prev) => ({
        ...prev,
        general: serverMessage || "Ocurrió un error inesperado al guardar el combo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Combo" : "Nuevo Combo"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifica los datos del combo seleccionado."
              : "Registra un nuevo combo promocional de dulcería."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Imagen del Combo */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="w-full text-left">
              <span className="text-[11px] font-montserrat font-bold text-brand-primary tracking-wide uppercase">
                Imagen del Combo (Opcional)
              </span>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                errors.image ? 'border-red-500 bg-red-50' : imagePreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-2 flex flex-col items-center">
                  <Upload className={`h-6 w-6 mb-1 ${errors.image ? 'text-red-400' : 'text-gray-300'}`} />
                  <p className={`text-[8px] font-bold ${errors.image ? 'text-red-500' : 'text-gray-400'}`}>SUBIR</p>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">
                * {errors.image}
              </p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {/* Nombre */}
          <div>
            <InputForm
              label="Nombre del Combo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Combo Pareja"
            />
            <ErrorMessage message={errors.name} />
          </div>

          {/* Código SKU */}
          <div>
            <InputForm
              label="Código (SKU)"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ej: CMB-DUO"
            />
            <ErrorMessage message={errors.code} />
          </div>

          {/* Descripción */}
          <div>
            <InputForm
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: 1 Cotufa Grande + 2 Refrescos Medianos"
            />
            <ErrorMessage message={errors.description} />
          </div>

          {/* Moneda */}
          <div className="relative w-full">
            <label className="absolute top-1 left-0 pl-2 text-[11px] font-montserrat font-bold text-brand-primary tracking-wide uppercase">
              Moneda
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full bg-white border border-border rounded-cineflix px-3 pt-6 pb-2 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary appearance-none cursor-pointer"
            >
              <option value="">Selecciona una moneda</option>
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.symbol} — {curr.description} ({curr.code})
                </option>
              ))}
            </select>
            <ErrorMessage message={errors.currency} />
          </div>

          {/* Precio y Puntos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputForm
                label="Precio"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="8.50"
              />
              <ErrorMessage message={errors.price} />
            </div>
            <div>
              <InputForm
                label="Puntos Lealtad"
                name="earned_loyalty_points"
                type="number"
                min="0"
                value={formData.earned_loyalty_points}
                onChange={handleChange}
                placeholder="15"
              />
              <ErrorMessage message={errors.earned_loyalty_points} />
            </div>
          </div>

          {/* Productos Incluidos (Dynamic Builder) */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-montserrat font-bold text-brand-primary tracking-wide uppercase">
                Productos del Combo
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-black uppercase text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 bg-brand-gold/15 p-1 px-2.5 rounded-lg active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3 text-brand-gold" strokeWidth={3} />
                Agregar
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                    className="flex-1 bg-white border border-border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10) || 1)}
                    className="w-16 bg-white border border-border rounded-lg p-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg active:scale-90 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errors.general && (
            <p className="text-red-500 text-xs text-center font-bold mt-2">
              {errors.general}
            </p>
          )}
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:COMBOS" : "CRUD:CREATE:COMBOS"} title="No tienes permiso para guardar combos">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
            >
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
