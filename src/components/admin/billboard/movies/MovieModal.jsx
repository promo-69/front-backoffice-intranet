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
import { ChipsSelectorForm } from "@/components/ui/ChipsSelectorForm";
import { Label } from "@/components/ui/label";
import { createMovie, updateMovie } from "@/services/movie.service";
import { toast } from "sonner";

export default function MovieModal({ 
  open, 
  onClose, 
  onSuccess, 
  initialData, 
  lifecycleStatesList, 
  genresList = [],
  ageClassificationsList,
  languagesList = [],
  projectionTypesList=[]
}) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      lifecycleState: "",
      ageClassification: "",
      durationMinutes: "0",
      genres: [],
      languages:[],
      projectionTypes:[]
    }
  });

  const selectedGenres = watch("genres") || [];
  const selectedProjectionTypes = watch("projectionTypes") || [];
  const selectedLanguages = watch("languages") || [];

  useEffect(() => {
    if (open && initialData) {
      // Helper para normalizar los valores que vienen del backend
      const getNormalizedId = (list, fieldData) => {
        if (!fieldData) return "";
        
        // Si es un ID directo (número o string numérico)
        if (typeof fieldData === "number") return fieldData;
        if (typeof fieldData === "string" && !isNaN(fieldData) && fieldData.trim() !== "") return Number(fieldData);
        
        // Si es un objeto (como el caso de age_classification en el ejemplo del usuario)
        if (typeof fieldData === "object") {
          if (fieldData.id) return fieldData.id;
          
          // Búsqueda por descripción en el catálogo cargado (Salvavidas)
          if (fieldData.description && list?.length > 0) {
            const found = list.find(item => 
              item.description?.toLowerCase() === fieldData.description?.toLowerCase() || 
              item.name?.toLowerCase() === fieldData.description?.toLowerCase()
            );
            return found ? found.id : "";
          }
        }
        return "";
      };

      const formattedData = {
        title: initialData.title,
        synopsis: initialData.synopsis,
        durationMinutes: initialData.duration_minutes, 
        releaseDate: initialData.release_date?.split('T')[0], 
        ageClassification: getNormalizedId(ageClassificationsList, initialData.age_classification), 
        lifecycleState: getNormalizedId(lifecycleStatesList, initialData.lifecycle_state), 
        poster: initialData.poster_url,
        banner: initialData.banner_url,
        trailerUrl: initialData.trailer_url, 
        genres: (initialData.genres || initialData._MovieGenres)?.map(g => (g.genre || g.id).toString()) || [],
        languages: (initialData.languages || initialData._MovieLanguages)?.map(lang => (lang.language || lang.id).toString()) || [],
        projectionTypes: (initialData.projection_types || initialData._MovieProjectionTypes)?.map(projt => (projt.projection_type || projt.id).toString()) || []
      };
      reset(formattedData);
      setBannerPreview(initialData.banner_url);
      setPosterPreview(initialData.poster_url);
    } else if (open) {
      reset({ 
        title: "", 
        synopsis: "", 
        durationMinutes: "", 
        releaseDate: "", 
        trailerUrl: "", 
        ageClassification: "", 
        lifecycleState: "", 
        genres: [], 
        languages: [],
        projectionTypes: []
      });
      setBannerPreview(null);
      setPosterPreview(null);
    }
  }, [
    initialData, 
    open, 
    reset, 
    genresList, 
    ageClassificationsList, 
    lifecycleStatesList, 
    languagesList, 
    projectionTypesList
  ]);

  // Manejador de cambio para el Póster
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPosterPreview(URL.createObjectURL(file));
  };

  // Función para remover el Póster de la vista y del formulario
  const handleRemovePoster = (e) => {
    e.stopPropagation(); // Evita que se abra el selector de archivos al hacer click en la X
    setPosterPreview(null);
    setValue("poster", null); // Limpia el valor en React Hook Form
    if (fileInputRef.current) fileInputRef.current.value = ""; // Limpia el input nativo
  };

  // Función para remover el Banner de la vista y del formulario
  const handleRemoveBanner = (e) => {
    e.stopPropagation(); // Evita que se abra el selector de archivos al hacer click en la X
    setBannerPreview(null);
    setValue("banner", null); // Limpia el valor en React Hook Form
    if (bannerInputRef.current) bannerInputRef.current.value = ""; // Limpia el input nativo
  };

  const onSubmit = async (data) => {
    try{
      const formData = new FormData();
  
    formData.append('title', data.title);
    formData.append('durationMinutes', Number(data.durationMinutes)); 
    formData.append('ageClassification', Number(data.ageClassification));
    formData.append('lifecycleState', Number(data.lifecycleState));
    formData.append('synopsis', data.synopsis);
    formData.append('releaseDate', data.releaseDate);
    formData.append('trailerUrl', data.trailerUrl || "");

    if (data.genres && data.genres.length > 0) {
      const genresArrayOfNumbers = data.genres.map(Number);
      formData.append('genres', JSON.stringify(genresArrayOfNumbers));
    }

    formData.append('languages', JSON.stringify(data.languages.map(Number)));
    formData.append('projectionTypes', JSON.stringify(data.projectionTypes.map(Number)));

    // Solo adjuntar si es un archivo real (File), ignorar si se quedó como string URL o null
    if (data.poster && data.poster instanceof FileList && data.poster[0]) {
      formData.append('poster', data.poster[0]);
    } else if (data.poster === null) {
      formData.append('poster', ''); // Enviar vacío si el usuario lo removió intencionalmente
    }
  
    if (data.banner && data.banner instanceof FileList && data.banner[0]) {
      formData.append('banner', data.banner[0]);
    } else if (data.banner === null) {
      formData.append('banner', ''); 
    }
    if (isEdit) {
        await updateMovie(initialData.id, formData);
        toast.success("Película actualizada de manera exitosa");
      } else {
        await createMovie(formData);
        toast.success("Película creada en cartelera");
      }
      onSuccess();

    }
    catch (error) {
      console.error("Error guardando película:", error);
      toast.error("Error al procesar la operación en el servidor");
    }
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
    },
    onChange: handleImageChange 
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
    },
    onChange: (e) => {
      const file = e.target.files[0];
      if (file) setBannerPreview(URL.createObjectURL(file));
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
            {isEdit ? "Editar Película" : "Nueva Película"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la película seleccionada." : "Registra una nueva película."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 space-y-4 mt-6 gap-6">
          
          {/* SECCIÓN PORTADA / PÓSTER */}
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold uppercase text-brand-primary">Póster Oficial</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                errors.poster ? 'border-red-500 bg-red-50' : posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {posterPreview ? (
                <div className="relative h-full w-full group">
                  <img src={posterPreview} alt="Preview" className="h-full w-full object-cover" />
                  
                  {/* Botón Flotante 'X' para remover el Póster */}
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
                    <p className="text-[9px] font-bold text-white uppercase">Cambiar Póster</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${errors.poster ? 'text-red-400' : 'text-gray-300'}`} />
                  <p className={`text-[10px] font-bold ${errors.poster ? 'text-red-500' : 'text-gray-400'}`}>SUBIR IMAGEN</p>
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
              onChange={posterRegister.onChange}
              onBlur={posterRegister.onBlur}
              ref={(e) => {
                posterRegister.ref(e);
                fileInputRef.current = e;
              }}
            />
          </div>

          {/* CAMPOS DEL FORMULARIO */}
          <div className="md:col-span-8 space-y-4">
            <InputForm
              label="Título"
              {...register("title", { required: "Este campo es obligatorio" })}
              error={errors.title?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectForm 
                label="Clasificación" 
                {...register("ageClassification", { required: "Este campo es obligatorio", valueAsNumber: true })}
                error={errors.ageClassification?.message}
              >
                <option value="">Seleccionar...</option>
                {ageClassificationsList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.description}
                  </option>
                ))}
              </SelectForm>

              <InputForm 
                label="Estreno" 
                type="date" 
                {...register("releaseDate", { required: "Este campo es obligatorio"})}
                error={errors.releaseDate?.message}
              />
            </div>

              <ChipsSelectorForm
              label="Idiomas"
              options={languagesList}
              selectedValues={selectedLanguages}
              registerProps={register("languages", { 
                validate: (value) => value.length > 0 || "Este campo es obligatorio" 
              })}
              error={errors.languages?.message}
              />
              
          
              <ChipsSelectorForm
              label="Proyecciones"
              options={projectionTypesList}
              selectedValues={selectedProjectionTypes}
              registerProps={register("projectionTypes", { 
                validate: (value) => value.length > 0 || "Este campo es obligatorio" 
              })}
              error={errors.projectionTypes?.message}
              />
            

            <ChipsSelectorForm
              label="Géneros"
              options={genresList}
              selectedValues={selectedGenres}
              registerProps={register("genres", { 
                validate: (value) => value.length > 0 || "Este campo es obligatorio" 
              })}
              error={errors.genres?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputForm 
                label="Duración (min)" 
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

              <SelectForm 
                label="Estado en Ciclo" 
                {...register("lifecycleState", { required: "Este campo es obligatorio", valueAsNumber: true })}
                error={errors.lifecycleState?.message}
              >
                <option value="">Seleccionar...</option>
                {lifecycleStatesList.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.name || state.description}
                  </option>
                ))}
              </SelectForm>
            </div>

            <TextAreaCustom 
              label="Sinopsis"
              rows={3}
              {...register("synopsis", { required: "Este campo es obligatorio" })}
              error={errors.synopsis?.message}
            />
            
            <InputForm label="URL Trailer" {...register("trailerUrl")} placeholder="https://youtube.com/..." />

            {/* SECCIÓN BANNER */}
            <div className="md:col-span-12 space-y-2 text-left">
              <Label className="text-[12px] font-bold uppercase text-brand-primary">Banner de Fondo</Label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className={`relative aspect-[16/5] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.banner ? 'border-red-500 bg-red-50' : bannerPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {bannerPreview ? (
                  <div className="relative h-full w-full group">
                    <img src={bannerPreview} alt="Banner Preview" className="h-full w-full object-cover" />
                    
                    {/* Botón Flotante 'X' para remover el Banner */}
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
                onChange={bannerRegister.onChange}
                onBlur={bannerRegister.onBlur}
                ref={(e) => {
                  bannerRegister.ref(e); 
                  bannerInputRef.current = e; 
                }}
              />
            </div>

            <DialogFooter className="pt-6 border-t flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-brand-primary text-white font-bold px-6">
                {isEdit ? "Guardar Cambios" : "Registrar Película"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}