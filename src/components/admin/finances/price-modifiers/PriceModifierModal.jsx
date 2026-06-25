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
import { SelectForm } from "@/components/ui/SelectForm";
import { Switch } from "@/components/ui/switch";
import { getCatalogByName } from "@/services/catalog.service";
import api from "@/api/axios";
import { ScrollArea } from "@/components/ui/scroll-area";

function ErrorMessage({ message }) {
  return message ? (
    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">
      {message}
    </p>
  ) : null;
}

const emptyForm = {
  description: "",
  operationType: "",
  isPercentage: true,
  value: "",
  currency: "",
  modifierScope: "",
  audienceCategory: "",
  weekDay: "",
  seatCategory: "",
  projectionType: "",
  productCategory: "",
  product: "",
  cinema: "",
  lineType: "",
  bookingType: "",
  movie: "",
  roomType: "",
  targetCurrency: "",
  targetCurrencyCondition: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
};

export default function PriceModifierModal({ open, onClose, initialData, onSave }) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Catalogs
  const [catalogs, setCatalogs] = useState({
    modifierScopes: [],
    operationTypes: [],
    currencies: [],
    audienceCategories: [],
    seatCategories: [],
    projectionTypes: [],
    productCategories: [],
    products: [],
    cinemas: [],
    lineTypes: [],
    bookingTypes: [],
    movies: [],
    roomTypes: [],
    weekDays: [],
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          description: initialData.description || "",
          operationType: initialData.operationType || initialData.operation_type || "",
          isPercentage: initialData.isPercentage ?? initialData.is_percentage ?? true,
          value: initialData.value || "",
          currency: initialData.currency || "",
          modifierScope: initialData.modifierScope || initialData.modifier_scope || "",
          audienceCategory: initialData.audienceCategory || initialData.audience_category || "",
          weekDay: initialData.weekDay || initialData.week_day || "",
          seatCategory: initialData.seatCategory || initialData.seat_category || "",
          projectionType: initialData.projectionType || initialData.projection_type || "",
          productCategory: initialData.productCategory || initialData.product_category || "",
          product: initialData.product || "",
          cinema: initialData.cinema || "",
          lineType: initialData.lineType || initialData.line_type || "",
          bookingType: initialData.bookingType || initialData.booking_type || "",
          movie: initialData.movie || "",
          roomType: initialData.roomType || initialData.room_type || "",
          targetCurrency: initialData.targetCurrency || initialData.target_currency || "",
          targetCurrencyCondition: initialData.targetCurrencyCondition ?? initialData.target_currency_condition ?? false,
          startDate: initialData.startDate || initialData.start_date || "",
          endDate: initialData.endDate || initialData.end_date || "",
          startTime: initialData.startTime || initialData.start_time || "",
          endTime: initialData.endTime || initialData.end_time || "",
        });
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
      fetchCatalogs();
    }
  }, [open, initialData]);

  const fetchCatalogs = async () => {
    try {
      const [
        modifierScopes,
        operationTypes,
        currencies,
        audienceCategories,
        seatCategories,
        projectionTypes,
        productCategories,
        productsRes,
        cinemasRes,
        lineTypes,
        bookingTypes,
        moviesRes,
        roomTypes,
        weekDays,
      ] = await Promise.all([
        getCatalogByName("modifier-scopes").catch(() => []),
        getCatalogByName("operation-types").catch(() => []),
        getCatalogByName("currencies").catch(() => []),
        getCatalogByName("audience-categories").catch(() => []),
        getCatalogByName("seat-categories").catch(() => []),
        getCatalogByName("projection-types").catch(() => []),
        getCatalogByName("product-categories").catch(() => []),
        api.get("/concessions/products?limit=-1").catch(() => ({ data: { data: [] } })),
        api.get("/cinemas?limit=-1").catch(() => ({ data: { data: [] } })),
        getCatalogByName("line-types").catch(() => []),
        getCatalogByName("booking-types").catch(() => []),
        api.get("/movies?limit=-1").catch(() => ({ data: { data: [] } })),
        getCatalogByName("room-types").catch(() => []),
        getCatalogByName("week-days").catch(() => []),
      ]);

      const products = productsRes?.data?.data || productsRes?.data || [];
      const movies = moviesRes?.data?.data || moviesRes?.data || [];
      const cinemas = cinemasRes?.data?.data || cinemasRes?.data || [];

      setCatalogs({
        modifierScopes,
        operationTypes,
        currencies,
        audienceCategories,
        seatCategories,
        projectionTypes,
        productCategories,
        products,
        cinemas,
        lineTypes,
        bookingTypes,
        movies,
        roomTypes,
        weekDays,
      });
    } catch (error) {
      console.error("Error fetching catalogs", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const mapBackendErrorToSpanish = (message) => {
    if (!message) return "Ocurrió un error inesperado al guardar.";
    
    let translated = message;
    
    const fieldTranslations = {
      modifierScope: "Ámbito (Scope)",
      operationType: "Tipo de Operación",
      isPercentage: "¿Es Porcentaje?",
      value: "Valor",
      currency: "Moneda",
      audienceCategory: "Categoría Público",
      weekDay: "Día de la Semana",
      seatCategory: "Categoría Asiento",
      projectionType: "Tipo de Proyección",
      productCategory: "Categoría de Producto",
      product: "Producto",
      cinema: "Cine",
      lineType: "Línea",
      bookingType: "Tipo de Reserva",
      movie: "Película",
      roomType: "Tipo de Sala",
      targetCurrency: "Moneda Destino",
      startDate: "Fecha de Inicio",
      endDate: "Fecha de Fin",
      startTime: "Hora de Inicio",
      endTime: "Hora de Fin",
      description: "Descripción"
    };

    Object.keys(fieldTranslations).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      translated = translated.replace(regex, fieldTranslations[key]);
    });

    if (translated.includes("Faltan campos requeridos")) {
      return "Por favor, completa todos los campos obligatorios del formulario.";
    }
    
    return translated;
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.description) newErrors.description = "Requerido.";
    if (!formData.operationType) newErrors.operationType = "Requerido.";
    const numericValue = parseFloat(formData.value);
    if (isNaN(numericValue) || numericValue <= 0) newErrors.value = "Mayor a 0.";
    if (!formData.modifierScope) newErrors.modifierScope = "Requerido.";

    if (!formData.isPercentage && !formData.currency) {
      newErrors.currency = "Requerido si no es porcentaje.";
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "La fecha final debe ser mayor o igual a la de inicio.";
    }

    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "La hora final debe ser mayor a la de inicio.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { ...formData };
      payload.value = parseFloat(formData.value);
      
      const intFields = [
        "modifierScope", "operationType", "currency", "audienceCategory", 
        "weekDay", "seatCategory", "projectionType", "productCategory", 
        "product", "cinema", "lineType", "bookingType", "movie", 
        "roomType", "targetCurrency"
      ];
      intFields.forEach(field => {
        if (payload[field]) {
          payload[field] = parseInt(payload[field], 10);
        }
      });
      
      // Clean up empty strings to null for DB consistency
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") payload[key] = null;
      });

      if (!payload.targetCurrencyCondition) {
        payload.targetCurrency = null;
      }

      // Constraints cleanup based on modifierScope (1 = tickets, 2 = products, 3 = global)
      if (payload.modifierScope == 1) {
        payload.productCategory = null;
        payload.product = null;
        payload.lineType = null;
      } else if (payload.modifierScope == 2) {
        payload.audienceCategory = null;
        payload.seatCategory = null;
        payload.projectionType = null;
        payload.movie = null;
        payload.roomType = null;
        payload.bookingType = null;
      } else if (payload.modifierScope == 3) {
        payload.productCategory = null;
        payload.product = null;
        payload.lineType = null;
        payload.audienceCategory = null;
        payload.seatCategory = null;
        payload.projectionType = null;
        payload.movie = null;
        payload.roomType = null;
      }

      if (isEdit) {
        payload.id = initialData.id;
      }
      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar modificador:", error);
      const serverMessage = error.response?.data?.message || error.message;
      setErrors((prev) => ({
        ...prev,
        general: mapBackendErrorToSpanish(serverMessage),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-4xl bg-white rounded-cineflix p-0 shadow-2xl border-none flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Modificador" : "Nuevo Modificador"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Modifica los datos del modificador de precio."
              : "Registra un nuevo modificador de precio."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div className="col-span-1 md:col-span-3">
                <InputForm
                  label="Descripción"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                <ErrorMessage message={errors.description} />
              </div>

              <div>
                <SelectForm
                  label="Tipo de Operación"
                  name="operationType"
                  value={formData.operationType}
                  onChange={handleChange}
                  error={errors.operationType}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.operationTypes.filter(opt => opt.id === 6 || opt.id === 7).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.description}
                    </option>
                  ))}
                </SelectForm>
              </div>

              <div>
                <SelectForm
                  label="Ámbito (Scope)"
                  name="modifierScope"
                  value={formData.modifierScope}
                  onChange={handleChange}
                  error={errors.modifierScope}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.modifierScopes.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.description}
                    </option>
                  ))}
                </SelectForm>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-brand-primary mb-1">¿Porcentaje?</span>
                  <Switch
                    checked={formData.isPercentage}
                    onCheckedChange={(c) => handleChange({ target: { name: 'isPercentage', value: c, type: 'checkbox', checked: c }})}
                  />
                </div>
                <div className="flex-1">
                  <InputForm
                    label="Valor"
                    type="number"
                    name="value"
                    step="0.01"
                    value={formData.value}
                    onChange={handleChange}
                  />
                  <ErrorMessage message={errors.value} />
                </div>
              </div>

              {!formData.isPercentage && (
                <div>
                  <SelectForm
                    label="Moneda"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    error={errors.currency}
                  >
                    <option value="">Seleccione...</option>
                    {catalogs.currencies.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.description} ({opt.symbol})
                      </option>
                    ))}
                  </SelectForm>
                </div>
              )}
            </div>

            {/* DEPENDING ON SCOPE */}
            {formData.modifierScope && (
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-6">Condiciones de Aplicación</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <SelectForm label="Cine" name="cinema" value={formData.cinema} onChange={handleChange}>
                      <option value="">Todos</option>
                      {catalogs.cinemas.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name || opt.description}</option>
                      ))}
                    </SelectForm>
                  </div>
                  <div>
                    <SelectForm label="Día de la Semana" name="weekDay" value={formData.weekDay} onChange={handleChange}>
                      <option value="">Todos</option>
                      {catalogs.weekDays.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.description}</option>
                      ))}
                    </SelectForm>
                  </div>
                  
                  {/* SCOPE 1: TICKETS */}
                  {(formData.modifierScope == 1) && (
                    <>
                      <div>
                        <SelectForm label="Categoría Público" name="audienceCategory" value={formData.audienceCategory} onChange={handleChange}>
                          <option value="">Todas</option>
                          {catalogs.audienceCategories.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Categoría Asiento" name="seatCategory" value={formData.seatCategory} onChange={handleChange}>
                          <option value="">Todas</option>
                          {catalogs.seatCategories.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Tipo de Proyección" name="projectionType" value={formData.projectionType} onChange={handleChange}>
                          <option value="">Todos</option>
                          {catalogs.projectionTypes.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Película" name="movie" value={formData.movie} onChange={handleChange}>
                          <option value="">Todas</option>
                          {catalogs.movies.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.title || opt.description || opt.name}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Tipo de Sala" name="roomType" value={formData.roomType} onChange={handleChange}>
                          <option value="">Todos</option>
                          {catalogs.roomTypes.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description || opt.name}</option>
                          ))}
                        </SelectForm>
                      </div>
                    </>
                  )}

                  {/* SCOPE 2: CANDY */}
                  {(formData.modifierScope == 2) && (
                    <>
                      <div>
                        <SelectForm label="Categoría de Producto" name="productCategory" value={formData.productCategory} onChange={handleChange}>
                          <option value="">Todas</option>
                          {catalogs.productCategories.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Línea" name="lineType" value={formData.lineType} onChange={handleChange}>
                          <option value="">Todas</option>
                          {catalogs.lineTypes.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                      <div>
                        <SelectForm label="Producto" name="product" value={formData.product} onChange={handleChange}>
                          <option value="">Todos</option>
                          {catalogs.products.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name || opt.description}</option>
                          ))}
                        </SelectForm>
                      </div>
                    </>
                  )}

                  {/* BOOKING TYPE (Not for Candy) */}
                  {formData.modifierScope != 2 && (
                    <div>
                      <SelectForm label="Tipo de Reserva" name="bookingType" value={formData.bookingType} onChange={handleChange}>
                        <option value="">Todas</option>
                        {catalogs.bookingTypes.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.description}</option>
                        ))}
                      </SelectForm>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-6">Conversión (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2 justify-center">
                    <span className="text-xs font-bold text-brand-primary">¿Aplica Condición de Moneda Destino?</span>
                    <Switch
                      checked={formData.targetCurrencyCondition}
                      onCheckedChange={(c) => handleChange({ target: { name: 'targetCurrencyCondition', value: c, type: 'checkbox', checked: c }})}
                    />
                  </div>
                </div>
                {formData.targetCurrencyCondition && (
                  <div>
                    <SelectForm label="Moneda Destino" name="targetCurrency" value={formData.targetCurrency} onChange={handleChange}>
                      <option value="">Ninguna</option>
                      {catalogs.currencies.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.description} ({opt.symbol})</option>
                      ))}
                    </SelectForm>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-6">Vigencia (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <InputForm label="Fecha de Inicio" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                  <ErrorMessage message={errors.startDate} />
                </div>
                <div>
                  <InputForm label="Fecha de Fin" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                  <ErrorMessage message={errors.endDate} />
                </div>
                <div>
                  <InputForm label="Hora de Inicio" type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                  <ErrorMessage message={errors.startTime} />
                </div>
                <div>
                  <InputForm label="Hora de Fin" type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
                  <ErrorMessage message={errors.endTime} />
                </div>
              </div>
            </div>

            {errors.general && (
              <p className="text-red-500 text-xs text-center font-bold mt-2">
                {errors.general}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button variant="outline" onClick={() => onClose(false)} className="flex-1">
            Cancelar
          </Button>
          <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:CURRENCIES" : "CRUD:CREATE:CURRENCIES"} title="No tienes permiso">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90">
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
