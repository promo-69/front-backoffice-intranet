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
import { Upload, X, Check } from "lucide-react";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { TextAreaCustom } from "@/components/ui/TextAreaCustom";
import { Label } from "@/components/ui/label";

export default function MovieForm({ open, onClose, onSuccess, initialData, lifecycleStatesList=[], genresList = [] }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ageClassification: 1,
      lifecycleState: 1,
      genres: []
    }
  });

  const selectedGenres = watch("genres") || [];

  useEffect(() => {
    if (open && initialData) {
      const formattedData = {
        title: initialData.title,
        synopsis: initialData.synopsis,
        durationMinutes: initialData.duration_minutes, 
        releaseDate: initialData.release_date?.split('T')[0], 
        ageClassification: initialData.age_classification, 
        lifecycleState: initialData.lifecycle_state, 
        trailerUrl: initialData.trailer_url, 
        genres: initialData._MovieGenres?.map(g => g.genre.toString()) || []
      };
      reset(formattedData);
      setBannerPreview(initialData.banner_url);
      setPosterPreview(initialData.poster_url);
    } else if (open) {
      reset({ ageClassification: 1, lifecycleState: 1, genres: [] });
      setBannerPreview(null);
      setPosterPreview(null);
    }
  }, [initialData, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPosterPreview(URL.createObjectURL(file));
  };

  /*const onSubmit = (data) => {
    const formData = new FormData();
    
  
    formData.append('title', data.title);
    formData.append('durationMinutes', Number(data.durationMinutes)); 
    formData.append('ageClassification', Number(data.ageClassification));
    formData.append('lifecycleState', Number(data.lifecycleState));
    formData.append('synopsis', data.synopsis);
    formData.append('releaseDate', data.releaseDate);
    formData.append('trailerUrl', data.trailerUrl || "");
    if (data.genres && data.genres.length > 0) {
      data.genres.forEach(id => formData.append('genres', id));
    }
    if (data.poster && data.poster[0]) {
      formData.append('posterUrl', data.poster[0]);
    }

    onSuccess(formData);
  };*/
  const onSubmit = async (data) => {
  const testData = {
    title: data.title,
    synopsis: data.synopsis,
    durationMinutes: Number(data.durationMinutes), 
    ageClassification: Number(data.ageClassification),
    lifecycleState: Number(data.lifecycleState),
    releaseDate: data.releaseDate,
    genres: data.genres.map(Number),
    trailerUrl: data.trailerUrl || null
  };
  onSuccess(testData); 
};

  const { ref: registerRef, ...registerProps } = register("posterUrl", { 
  onChange: handleImageChange 
});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-cineflix p-8 shadow-2xl overflow-y-auto max-h-[90vh] font-montserrat">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary">
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Película" : "Nueva Película"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Asegúrese de que los campos técnicos coincidan con la distribuidora.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
       {/* Columna Póster */}
        <div className="md:col-span-4 space-y-4">
          <Label className="text-[12px] font-bold uppercase text-brand-primary">Póster Oficial</Label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
              errors.poster ? 'border-red-500 bg-red-50' : posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {posterPreview ? (
              <img src={posterPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <Upload className={`h-8 w-8 mx-auto mb-2 ${errors.poster ? 'text-red-400' : 'text-gray-300'}`} />
                <p className={`text-[10px] font-bold ${errors.poster ? 'text-red-500' : 'text-gray-400'}`}>SUBIR IMAGEN</p>
              </div>
            )}
          </div>

          {/* MENSAJE DE ERROR DEL PÓSTER */}
          {errors.poster && (
            <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">
              * {errors.poster.message}
            </p>
          )}

          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
            {...register("poster", { 
              required: isEdit ? false : "El póster es obligatorio para registrar la película",
              validate: {
                lessThan2MB: files => !files[0] || files[0].size < 2 * 1024 * 1024 || "La imagen excede los 2MB",
                acceptedFormats: files => 
                  !files[0] || 
                  ['image/jpeg', 'image/png', 'image/webp'].includes(files[0].type) || 
                  "Solo se permite JPG, PNG o WebP"
              },
              onChange: handleImageChange 
            })}
            ref={(e) => {
              register("poster").ref(e);
              fileInputRef.current = e;
            }}
          />
        </div>

          {/* Columna Datos */}
          <div className="md:col-span-8 space-y-5">
            <InputForm
              label="Título"
              {...register("title", { required: "Este campo es obligatorio",
              minLength: { value: 2, message: "Título demasiado corto" },
              maxLength: { value: 100, message: "Título demasiado largo" }

               })}
              error={errors.title?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectForm label="Clasificación" {...register("ageClassification", { valueAsNumber: true })}>
                <option value={1}>A (Todo Público)</option>
                <option value={2}>B (+12)</option>
                <option value={3}>C (+15)</option>
                <option value={4}>D (+18)</option>
              </SelectForm>

              <InputForm label="Estreno" type="date" {...register("releaseDate", { required: "Este campo es obligatorio"})}

              error={errors.releaseDate?.message}
              />
            </div>

            {/* Selector de Géneros */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-500">Géneros</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50/50">
                {genresList.map((genre) => (
                  <label 
                    key={genre.id}
                    className={`cursor-pointer px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 border transition-all ${
                      selectedGenres.includes(genre.id.toString())
                        ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:border-brand-primary/40"
                    }`}
                  >
                    <input type="checkbox" value={genre.id} className="hidden" 
                    {...register("genres",
                    { validate: (value) => value.length > 0 || "Debes seleccionar al menos un género" 
                    })}
                    />
                    {selectedGenres.includes(genre.id.toString()) && <Check className="w-3 h-3" />}
                    {genre.description}
                  </label>
                ))}
                {errors.genres && <p className="text-red-500 text-xs mt-1">{errors.genres.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputForm 
                label="Duración (min)" 
                type="number" {...register("durationMinutes", { 
                required: "Este campo es obligatorio",
                min: { value: 1, message: "Debe ser al menos 1 minuto" },
                max: { value: 500, message: "Duración poco realista" },
                valueAsNumber: true
              })} 
                error={errors.durationMinutes?.message}
              />

              <SelectForm 
              label="Estado en Ciclo" 
              {...register("lifecycleState", { 
                required: "Este campo es obligatorio",
                valueAsNumber: true 
              })}
              error={errors.lifecycleState?.message}
              >
                {lifecycleStatesList.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.description}
                  </option>
                ))}
              </SelectForm>
            </div>

            <TextAreaCustom 
            label="Sinopsis"
            rows={3}
            {...register("synopsis",
              { required: "Este campo es obligatorio",minLength: { value: 20, message: "La sinopsis debe tener al menos 20 caracteres"},
              maxLength: { value: 800, message: "La sinopsis no puede exceder los 800 caracteres" },
              setValueAs: v => v.trim()
            })}
            error={errors.synopsis?.message}
            />
            
            <InputForm label="URL Trailer" {...register("trailerUrl")} placeholder="https://youtube.com/..." />

            <div className="md:col-span-12 space-y-2">
              <Label className="text-[12px] font-bold uppercase text-brand-primary">Banner de Fondo</Label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className={`relative aspect-[16/5] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.banner ? 'border-red-500 bg-red-50' : bannerPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className={`h-6 w-6 mx-auto mb-1 ${errors.banner ? 'text-red-400' : 'text-gray-300'}`} />
                    <p className={`text-[10px] font-bold ${errors.banner ? 'text-red-500' : 'text-gray-400'}`}>SUBIR BANNER HORIZONTAL</p>
                  </div>
                )}
              </div>

              {/* MENSAJE DE ERROR DEL BANNER */}
              {errors.banner && (
                <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">
                  * {errors.banner.message}
                </p>
              )}

              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
                {...register("banner", {
                  required: false, // El banner suele ser opcional
                  validate: {
                    lessThan3MB: files => !files[0] || files[0].size < 3 * 1024 * 1024 || "El banner no puede pesar más de 3MB",
                    acceptedFormats: files => 
                      !files[0] || 
                      ['image/jpeg', 'image/png', 'image/webp'].includes(files[0].type) || 
                      "Formato de banner no válido"
                  },
                  onChange: (e) => {
                    const file = e.target.files[0];
                    if (file) setBannerPreview(URL.createObjectURL(file));
                  }
                })}
                ref={(e) => {
                  register("banner").ref(e);
                  bannerInputRef.current = e;
                }}
              />
            </div>
            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-brand-primary text-white">
                {isEdit ? "Guardar Cambios" : "Registrar Película"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}