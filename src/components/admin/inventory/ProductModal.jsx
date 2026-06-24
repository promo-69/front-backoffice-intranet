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
import { Upload, X } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

function ErrorMessage({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyProductForm = {
  name: "",
  code: "",
  product_category: "",
  currency: "",
  price: "",
  earned_loyalty_points: "",
};

export default function ProductModal({ open, onClose, initialData, categories = [], currencies = [], onSave }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyProductForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || initialData.sku || "",
          product_category: initialData.product_category?.toString() || "",
          currency: (initialData.pricing?.currency ?? initialData.currency)?.toString() || "",
          price: (initialData.pricing?.base_price ?? initialData.price)?.toString() || "",
          earned_loyalty_points: initialData.earned_loyalty_points !== null && initialData.earned_loyalty_points !== undefined ? initialData.earned_loyalty_points.toString() : "",
        });
        setImagePreview(initialData.image_url || null);
      } else {
        setFormData(emptyProductForm);
        setImagePreview(null);
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
    e.target.value = ""; // Limpiar el valor para permitir volver a seleccionar el mismo archivo
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

  const handleSubmit = async () => {
    const newErrors = {};

    // Campos requeridos
    const requiredFields = ["name", "code", "product_category", "currency", "price"];
    requiredFields.forEach((key) => {
      const value = formData[key]?.toString().trim();
      if (!value) {
        newErrors[key] = "Este campo es obligatorio.";
      } else {
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    // Validar campos opcionales con formato
    ["earned_loyalty_points"].forEach((key) => {
      const value = formData[key]?.toString().trim();
      if (value) {
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("sku", formData.code.trim());
      payload.append("productCategory", Number(formData.product_category));
      payload.append("currencyId", Number(formData.currency));
      payload.append("price", parseFloat(formData.price));
      
      if (formData.earned_loyalty_points) {
        payload.append("earnedLoyaltyPoints", parseInt(formData.earned_loyalty_points, 10));
      }

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (isEdit) {
        payload.append("id", initialData.id);
      }
      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      if (error.response?.data) {
        console.log("DETALLE DEL ERROR DEL SERVIDOR:", JSON.stringify(error.response.data, null, 2));
      }
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setErrors((prev) => ({
        ...prev,
        general: serverMessage || "Ocurrió un error inesperado al guardar el producto.",
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
            {isEdit ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifica los datos del producto seleccionado."
              : "Registra un nuevo producto de dulcería."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Imagen del Producto */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="w-full text-left">
              <span className="text-[11px] font-montserrat font-bold text-brand-primary tracking-wide uppercase">
                Imagen del Producto (Opcional)
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
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Palomitas Grandes"
            />
            <ErrorMessage message={errors.name} />
          </div>

          {/* Código */}
          <div>
            <InputForm
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ej: POP-LG-001"
            />
            <ErrorMessage message={errors.code} />
          </div>

          {/* Categoría de Producto (FK → product_categories) */}
          <div className="relative w-full">
            <label
              className="
                absolute 
                top-1 
                left-0 
                pl-2
                text-[11px] 
                font-montserrat 
                font-bold 
                text-brand-primary 
                tracking-wide 
                uppercase
              "
            >
              Categoría
            </label>
            <select
              name="product_category"
              value={formData.product_category}
              onChange={handleChange}
              className="
                w-full 
                bg-white 
                border 
                border-border 
                rounded-cineflix 
                px-3 
                pt-6 
                pb-2 
                text-sm 
                font-montserrat
                focus:outline-none 
                focus:ring-2 
                focus:ring-brand-primary/40 
                focus:border-brand-primary
                appearance-none
                cursor-pointer
              "
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.description}
                </option>
              ))}
            </select>
            <ErrorMessage message={errors.product_category} />
          </div>

          {/* Moneda (FK → currencies) */}
          <div className="relative w-full">
            <label
              className="
                absolute 
                top-1 
                left-0 
                pl-2
                text-[11px] 
                font-montserrat 
                font-bold 
                text-brand-primary 
                tracking-wide 
                uppercase
              "
            >
              Moneda
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="
                w-full 
                bg-white 
                border 
                border-border 
                rounded-cineflix 
                px-3 
                pt-6 
                pb-2 
                text-sm 
                font-montserrat
                focus:outline-none 
                focus:ring-2 
                focus:ring-brand-primary/40 
                focus:border-brand-primary
                appearance-none
                cursor-pointer
              "
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

          {/* Precio y Puntos de Lealtad */}
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
                placeholder="5.99"
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
                placeholder="10"
              />
              <ErrorMessage message={errors.earned_loyalty_points} />
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
          <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:PRODUCTS" : "CRUD:CREATE:PRODUCTS"} title="No tienes permiso para guardar productos">
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
