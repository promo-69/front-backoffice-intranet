import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Upload, X, Loader2 } from "lucide-react"; 
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import { TextAreaCustom } from "@/components/ui/TextAreaCustom";
import { Label } from "@/components/ui/label";
import { createEvent, updateEvent } from "@/services/events.service";
import { toast } from "sonner";

export default function EventModal({
  open,
  onClose,
  onSuccess,
  initialData,
  ageClassificationsList = [],
  lifecycleStatesList = []
}) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: "",
      ageClassification: "",
      lifecycleState: "",
      trailerUrl: "",
      releaseDate: "",
      endDate: ""
    }
  });

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePoster = (e) => {
    e.stopPropagation(); 
    setPosterPreview(null);
    setValue("poster", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    setBannerPreview(null);
    setValue("banner", null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  useEffect(() => {
    if (open && initialData) {
      const getNormalizedId = (list, fieldData) => {
        if (!fieldData) return "";
        if (typeof fieldData === "number") return fieldData;
        if (typeof fieldData === "string" && !isNaN(fieldData) && fieldData.trim() !== "") {
          return Number(fieldData);
        }
        if (typeof fieldData === "object") {
          if (fieldData.id) return fieldData.id;
          if (fieldData.description && list?.length > 0) {
            const found = list.find(
              item =>
                item.description?.toLowerCase() === fieldData.description?.toLowerCase() ||
                item.name?.toLowerCase() === fieldData.description?.toLowerCase()
            );
            return found?.id || "";
          }
        }
        return "";
      };

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        durationMinutes: initialData.duration_minutes || "",
        trailerUrl: initialData.trailer_url || "",
        releaseDate: initialData.release_date?.split("T")[0] || "",
        endDate: initialData.end_date?.split("T")[0] || "",
        ageClassification: getNormalizedId(ageClassificationsList, initialData.age_classification),
        lifecycleState: getNormalizedId(lifecycleStatesList, initialData.lifecycle_state)
      });

      setPosterPreview(initialData.poster_url);
      setBannerPreview(initialData.banner_url);
    } else if (open) {
      reset({
        title: "",
        description: "",
        durationMinutes: "",
        ageClassification: "",
        lifecycleState: "",
        trailerUrl: "",
        releaseDate: "",
        endDate: ""
      });
      setPosterPreview(null);
      setBannerPreview(null);
    }
  }, [initialData, open, reset, ageClassificationsList, lifecycleStatesList]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("durationMinutes", Number(data.durationMinutes));
      formData.append("ageClassification", Number(data.ageClassification));
      formData.append("lifecycleState", Number(data.lifecycleState));
      formData.append("trailerUrl", data.trailerUrl || "");
      formData.append("releaseDate", data.releaseDate);
      formData.append("endDate", data.endDate || "");

      if (data.poster && data.poster instanceof FileList && data.poster[0]) {
        formData.append("poster", data.poster[0]);
      } else if (data.poster === null) {
        formData.append("poster_url", "");
      }

      if (data.banner && data.banner instanceof FileList && data.banner[0]) {
        formData.append("banner", data.banner[0]);
      } else if (data.banner === null) {
        formData.append("banner_url", "");
      }

      if (isEdit) {
        await updateEvent(initialData.id, formData);
        onSuccess(`"${data.title}" ha sido actualizado correctamente.`);
      } else {
        await createEvent(formData);
        onSuccess(`"${data.title}" ha sido registrado exitosamente.`);
      }
    } catch (error) {
      console.error("Error guardando evento:", error);
      toast.error("Error al procesar la operación en el servidor");
    }
  };

  const onInvalidSubmit = (errors) => {
    console.warn("Validación del formulario falló:", errors);
    toast.error("Por favor, rellena todos los campos obligatorios requeridos.");
  };

  const posterRegister = register("poster", { 
    validate: {
      lessThan2MB: files => {
        if (!files || !files[0] || typeof files === "string") return true; 
        return files[0].size < 2 * 1024 * 1024 || "La imagen excede los 2MB";
      },
      acceptedFormats: files => {
        if (!files || !files[0] || typeof files === "string") return true;
        return ['image/jpeg', 'image/png', 'image/webp'].includes(files[0].type) || "Solo se permite JPG, PNG o WebP";
      }
    }
  });

  const bannerRegister = register("banner", {
    required: false,
    validate: {
      lessThan3MB: files => {
        if (!files || !files[0] || typeof files === "string") return true;
        return files[0].size < 3 * 1024 * 1024 || "El banner no puede pesar más de 3MB";
      },
      acceptedFormats: files => { 
        if (!files || !files[0] || typeof files === "string") return true;
        return ['image/jpeg', 'image/png', 'image/webp'].includes(files[0].type) || "Formato de banner no válido";
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? null : onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-cineflix p-5 shadow-2xl overflow-hidden font-montserrat">
        
        <button 
          type="button" 
          onClick={onClose} 
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary z-10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Evento" : "Nuevo Evento Especial"}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-500">
            {isEdit ? "Modifica los detalles del evento especial." : "Configura un nuevo evento exclusivo para las salas de cine."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-3">
          
          {/* BLOQUE SUPERIOR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* PÓSTER VERTICAL (3 COLS) */}
            <div className="md:col-span-3 flex flex-col justify-start">
              <Label className="text-[10px] font-bold uppercase text-brand-primary mb-1 block">Póster</Label>
              <div 
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`relative aspect-[3/4] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.poster ? 'border-red-500 bg-red-50' : posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
                } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {posterPreview ? (
                  <div className="relative h-full w-full group">
                    <img src={posterPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Upload className={`h-6 w-6 mx-auto mb-1 ${errors.poster ? 'text-red-400' : 'text-gray-300'}`} />
                    <p className={`text-[9px] font-bold ${errors.poster ? 'text-red-500' : 'text-gray-400'}`}>SUBIR PÓSTER</p>
                  </div>
                )}
              </div>
              {errors.poster && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 italic">* {errors.poster.message}</p>}
              
              <input 
                type="file" 
                className="hidden" 
                disabled={isSubmitting}
                accept="image/jpeg,image/png,image/webp"
                name={posterRegister.name}
                onBlur={posterRegister.onBlur}
                onChange={(e) => {
                  posterRegister.onChange(e);
                  handleImageChange(e, setPosterPreview);
                }}
                ref={(e) => {
                  posterRegister.ref(e);
                  fileInputRef.current = e;
                }}
              />
            </div>

            {/* CAMPOS DE FORMULARIO (9 COLS) */}
            <div className="md:col-span-9 space-y-2">
              <InputForm
                label="Nombre del Evento"
                disabled={isSubmitting}
                {...register("title", { required: "Este campo es obligatorio" })}
                error={errors.title?.message}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* FECHA DE EJECUCIÓN CON DATEPICKERCUSTOM */}
                <Controller
                  name="releaseDate"
                  control={control}
                  rules={{ required: "Este campo es obligatorio" }}
                  render={({ field }) => (
                    <DatePickerCustom
                      label="Fecha de Ejecución"
                      value={field.value}
                      onChange={(iso) => field.onChange(iso)}
                      disabled={isSubmitting}
                      error={errors.releaseDate?.message}
                    />
                  )}
                />

                <InputForm 
                  label="Duración Estimada (min)" 
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (["-", "e", "E", ".", ","].includes(e.key)) e.preventDefault();
                  }}
                  type="number" 
                  {...register("durationMinutes", { 
                    required: "Este campo es obligatorio",
                    valueAsNumber: true
                  })} 
                  error={errors.durationMinutes?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectForm 
                  label="Clasificación por Edad" 
                  disabled={isSubmitting}
                  {...register("ageClassification", { required: "Este campo es obligatorio", valueAsNumber: true })}
                  error={errors.ageClassification?.message}
                >
                  <option value="">Seleccionar Clasificación...</option>
                  {ageClassificationsList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.description || item.name || `Clasificación ${item.id}`}
                    </option>
                  ))}
                </SelectForm>

                <SelectForm 
                  label="Estado en Cartelera" 
                  disabled={isSubmitting}
                  {...register("lifecycleState", { required: "Este campo es obligatorio", valueAsNumber: true })}
                  error={errors.lifecycleState?.message}
                >
                  <option value="">Seleccionar Estado...</option>
                  {lifecycleStatesList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.description || item.name || `Estado ${item.id}`}
                    </option>
                  ))}
                </SelectForm>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputForm 
                  label="URL Trailer (Opcional)" 
                  type="url" 
                  disabled={isSubmitting}
                  {...register("trailerUrl")}
                  error={errors.trailerUrl?.message}
                />

                {/* FECHA FINALIZACIÓN CON DATEPICKERCUSTOM */}
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePickerCustom
                      label="Fecha Finalización (Opcional)"
                      value={field.value}
                      onChange={(iso) => field.onChange(iso)}
                      disabled={isSubmitting}
                      error={errors.endDate?.message}
                    />
                  )}
                />
              </div>
            </div>

          </div>

          {/* BLOQUE INFERIOR: BANNER + DESCRIPCIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
            <div className="md:col-span-6 space-y-1">
              <Label className="text-[10px] font-bold uppercase text-brand-primary">Banner Horizontal</Label>
              <div 
                onClick={() => !isSubmitting && bannerInputRef.current?.click()}
                className={`relative aspect-[16/5] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.banner ? 'border-red-500 bg-red-50' : bannerPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
                } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {bannerPreview ? (
                  <div className="relative h-full w-full group">
                    <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Upload className={`h-5 w-5 mx-auto mb-1 ${errors.banner ? 'text-red-400' : 'text-gray-300'}`} />
                    <p className={`text-[9px] font-bold ${errors.banner ? 'text-red-500' : 'text-gray-400'}`}>SUBIR BANNER</p>
                  </div>
                )}
              </div>
              {errors.banner && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 italic">* {errors.banner.message}</p>}

              <input 
                type="file" 
                className="hidden" 
                disabled={isSubmitting}
                accept="image/jpeg,image/png,image/webp"
                name={bannerRegister.name}
                onBlur={bannerRegister.onBlur}
                onChange={(e) => {
                  bannerRegister.onChange(e);
                  handleImageChange(e, setBannerPreview);
                }}
                ref={(e) => {
                  bannerRegister.ref(e); 
                  bannerInputRef.current = e; 
                }}
              />
            </div>

            <div className="md:col-span-6">
              <TextAreaCustom 
                label="Descripción / Detalles Especiales"
                rows={2}
                disabled={isSubmitting}
                {...register("description", { required: "Este campo es obligatorio" })}
                error={errors.description?.message}
              />
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="pt-2 border-t flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            
            <DisableIfNoPermission 
              permission={isEdit ? "CRUD:UPDATE:SPECIAL_EVENTS" : "CRUD:CREATE:SPECIAL_EVENTS"} 
              title="No tienes permiso para guardar eventos"
            >
              <Button 
                type="submit" 
                size="sm"
                className="bg-brand-primary text-white font-bold px-5 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? (
                  "Guardar Cambios"
                ) : (
                  "Registrar Evento"
                )}
              </Button>
            </DisableIfNoPermission>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}