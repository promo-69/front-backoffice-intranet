import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { TextAreaCustom } from "@/components/ui/TextAreaCustom";
import { Label } from "@/components/ui/label";
import { createEvent, updateEvent } from "@/services/events.service";
import { toast } from "sonner";

export default function EventModal({ 
  open, 
  onClose, 
  onSuccess, 
  initialData,
  ageClassificationsList = [], // Lista para el dropdown de clasificación
  lifecycleStatesList = []     // Lista para el dropdown de estados
}) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
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

  // --- Funciones para el manejo y limpieza de imágenes ---
  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePoster = (e) => {
    e.stopPropagation(); // Evita disparar el click del contenedor principal
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
  // -------------------------------------------------------

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        durationMinutes: initialData.duration_minutes || "",
        ageClassification: initialData.age_classification || "",
        lifecycleState: initialData.lifecycle_state || "",
        trailerUrl: initialData.trailer_url || "",
        releaseDate: initialData.release_date?.split('T')[0] || "",
        endDate: initialData.end_date?.split('T')[0] || ""
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
  }, [initialData, open, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('durationMinutes', Number(data.durationMinutes));
      formData.append('ageClassification', Number(data.ageClassification));
      formData.append('lifecycleState', Number(data.lifecycleState));
      formData.append('trailerUrl', data.trailerUrl || "");
      formData.append('releaseDate', data.releaseDate);
      formData.append('endDate', data.endDate || "");

      // Manejo de archivos binarios para el backend
      if (data.poster instanceof FileList && data.poster[0]) formData.append('poster', data.poster[0]);
      if (data.banner instanceof FileList && data.banner[0]) formData.append('banner', data.banner[0]);

      if (isEdit) {
        await updateEvent(initialData.id, formData);
        onSuccess(`Evento "${data.title}" actualizado.`);
      } else {
        await createEvent(formData);
        onSuccess(`Evento "${data.title}" registrado.`);
      }
      onClose();
    } catch (error) {
      toast.error("Error al guardar el evento");
    }
  };

  // Validaciones de archivos vinculadas a react-hook-form
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-cineflix p-8 shadow-2xl overflow-y-auto max-h-[90vh] font-montserrat">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary z-10">
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Evento" : "Nuevo Evento Especial"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los detalles y configuraciones de la función especial." : "Configura un nuevo evento exclusivo para las salas de cine."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 space-y-4 mt-6 gap-6">
          
          {/* SECCIÓN PORTADA / PÓSTER */}
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold uppercase text-brand-primary">Póster del Evento</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                errors.poster ? 'border-red-500 bg-red-50' : posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {posterPreview ? (
                <div className="relative h-full w-full group">
                  <img src={posterPreview} alt="Preview" className="h-full w-full object-cover" />
                  
                  <button
                    type="button"
                    onClick={handleRemovePoster}
                    className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remover imagen"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>

                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <p className="text-[9px] font-bold text-white uppercase">Cambiar Imagen</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${errors.poster ? 'text-red-400' : 'text-gray-300'}`} />
                  <p className={`text-[10px] font-bold ${errors.poster ? 'text-red-500' : 'text-gray-400'}`}>SUBIR PÓSTER</p>
                </div>
              )}
            </div>

            {errors.poster && (
              <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">* {errors.poster.message}</p>
            )}

            <input 
              type="file" 
              className="hidden" 
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

          {/* CAMPOS DEL FORMULARIO */}
          <div className="md:col-span-8 space-y-4">
            <InputForm
              label="Nombre del Evento"
              {...register("title", { required: "Este campo es obligatorio" })}
              error={errors.title?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputForm 
                label="Fecha de Ejecución" 
                type="date" 
                {...register("releaseDate", { required: "Este campo es obligatorio"})}
                error={errors.releaseDate?.message}
              />

              <InputForm 
                label="Duración Estimada (min)" 
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

            <div className="grid grid-cols-2 gap-4">
              <SelectForm 
                label="Clasificación por Edad" 
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

            <div className="grid grid-cols-2 gap-4">
              <InputForm 
                label="URL del Trailer (Opcional)" 
                type="url" 
                {...register("trailerUrl")}
                error={errors.trailerUrl?.message}
              />

              <InputForm 
                label="Fecha de Finalización (Opcional)" 
                type="date" 
                {...register("endDate")}
                error={errors.endDate?.message}
              />
            </div>

            <TextAreaCustom 
              label="Descripción / Detalles Especiales"
              rows={3}
              {...register("description", { required: "Este campo es obligatorio" })}
              error={errors.description?.message}
            />

            {/* SECCIÓN BANNER HORIZONTAL */}
            <div className="md:col-span-12 space-y-2 text-left">
              <Label className="text-[12px] font-bold uppercase text-brand-primary">Banner Promocional (Fondo)</Label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className={`relative aspect-[16/5] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.banner ? 'border-red-500 bg-red-50' : bannerPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {bannerPreview ? (
                  <div className="relative h-full w-full group">
                    <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                    
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Remover banner"
                    >
                      <X className="h-4 w-4" strokeWidth={3} />
                    </button>

                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Upload className="h-5 w-5 text-white mb-1" />
                      <p className="text-[9px] font-bold text-white uppercase">Cambiar Banner</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className={`h-6 w-6 mx-auto mb-1 ${errors.banner ? 'text-red-400' : 'text-gray-300'}`} />
                    <p className={`text-[10px] font-bold ${errors.banner ? 'text-red-500' : 'text-gray-400'}`}>SUBIR BANNER HORIZONTAL</p>
                  </div>
                )}
              </div>

              {errors.banner && (
                <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">* {errors.banner.message}</p>
              )}

              <input 
                type="file" 
                className="hidden" 
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

            <DialogFooter className="pt-6 border-t flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-brand-primary text-white font-bold px-6">
                {isEdit ? "Guardar Cambios" : "Registrar Evento"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}