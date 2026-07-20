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
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
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
  lifecycleStatesList = [],
  genresList = [],
  ageClassificationsList = [],
  languagesList = [],
  projectionTypesList = [],
}) {
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
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      lifecycleState: "",
      ageClassification: "",
      durationMinutes: "0",
      genres: [],
      languages: [],
      projectionTypes: [],
    },
  });

  const selectedGenres = watch("genres") || [];
  const selectedProjectionTypes = watch("projectionTypes") || [];
  const selectedLanguages = watch("languages") || [];

  useEffect(() => {
    if (open && initialData) {
      const getNormalizedId = (list, fieldData) => {
        if (!fieldData) return "";
        if (typeof fieldData === "number") return fieldData;
        if (
          typeof fieldData === "string" &&
          !isNaN(fieldData) &&
          fieldData.trim() !== ""
        )
          return Number(fieldData);

        if (typeof fieldData === "object") {
          if (fieldData.id) return fieldData.id;
          if (fieldData.description && list?.length > 0) {
            const found = list.find(
              (item) =>
                item.description?.toLowerCase() ===
                  fieldData.description?.toLowerCase() ||
                item.name?.toLowerCase() ===
                  fieldData.description?.toLowerCase()
            );
            return found ? found.id : "";
          }
        }
        return "";
      };

      const formattedData = {
        title: initialData.title || "",
        synopsis: initialData.synopsis || "",
        durationMinutes: initialData.duration_minutes || "",
        releaseDate: initialData.release_date?.split("T")[0] || "",
        ageClassification: getNormalizedId(
          ageClassificationsList,
          initialData.age_classification
        ),
        lifecycleState: getNormalizedId(
          lifecycleStatesList,
          initialData.lifecycle_state
        ),
        poster: initialData.poster_url,
        banner: initialData.banner_url,
        trailerUrl: initialData.trailer_url || "",
        genres:
          (initialData.genres || initialData._MovieGenres)?.map((g) =>
            (g.genre || g.id).toString()
          ) || [],
        languages:
          (initialData.languages || initialData._MovieLanguages)?.map((lang) =>
            (lang.language || lang.id).toString()
          ) || [],
        projectionTypes:
          (
            initialData.projection_types || initialData._MovieProjectionTypes
          )?.map((projt) => (projt.projection_type || projt.id).toString()) ||
          [],
      };
      reset(formattedData);
      setBannerPreview(initialData.banner_url || null);
      setPosterPreview(initialData.poster_url || null);
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
        projectionTypes: [],
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
    projectionTypesList,
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPosterPreview(URL.createObjectURL(file));
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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("durationMinutes", Number(data.durationMinutes));
      formData.append("ageClassification", Number(data.ageClassification));
      formData.append("lifecycleState", Number(data.lifecycleState));
      formData.append("synopsis", data.synopsis);
      formData.append("releaseDate", data.releaseDate);
      formData.append("trailerUrl", data.trailerUrl || "");

      if (data.genres && data.genres.length > 0) {
        formData.append("genres", JSON.stringify(data.genres.map(Number)));
      }

      formData.append("languages", JSON.stringify(data.languages.map(Number)));
      formData.append(
        "projectionTypes",
        JSON.stringify(data.projectionTypes.map(Number))
      );

      if (data.poster && data.poster instanceof FileList && data.poster[0]) {
        formData.append("poster", data.poster[0]);
      } else if (data.poster === null) {
        formData.append("poster", "");
      }

      if (data.banner && data.banner instanceof FileList && data.banner[0]) {
        formData.append("banner", data.banner[0]);
      } else if (data.banner === null) {
        formData.append("banner", "");
      }

      if (isEdit) {
        await updateMovie(initialData.id, formData);
        onSuccess(`"${data.title}" ha sido actualizada correctamente.`);
      } else {
        await createMovie(formData);
        onSuccess(
          `"${data.title}" se ha registrado exitosamente en la cartelera.`
        );
      }
    } catch (error) {
      console.error("Error guardando película:", error);
      toast.error("Error al procesar la operación en el servidor");
    }
  };

  const posterRegister = register("poster", {
    validate: {
      lessThan2MB: (files) => {
        if (!files || !files[0] || typeof files === "string") return true;
        return files[0].size < 2 * 1024 * 1024 || "La imagen excede los 2MB";
      },
      acceptedFormats: (files) => {
        if (!files || !files[0] || typeof files === "string") return true;
        return (
          ["image/jpeg", "image/png", "image/webp"].includes(files[0].type) ||
          "Solo se permite JPG, PNG o WebP"
        );
      },
    },
    onChange: handleImageChange,
  });

  const bannerRegister = register("banner", {
    required: false,
    validate: {
      lessThan3MB: (files) => {
        if (!files || !files[0] || typeof files === "string") return true;
        return (
          files[0].size < 3 * 1024 * 1024 ||
          "El banner no puede pesar más de 3MB"
        );
      },
      acceptedFormats: (files) => {
        if (!files || !files[0] || typeof files === "string") return true;
        return (
          ["image/jpeg", "image/png", "image/webp"].includes(files[0].type) ||
          "Formato de banner no válido"
        );
      },
    },
    onChange: (e) => {
      const file = e.target.files[0];
      if (file) setBannerPreview(URL.createObjectURL(file));
    },
  });

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? null : onClose}>
      <DialogContent className="max-w-5xl bg-white rounded-cineflix p-6 shadow-2xl max-h-[92vh] overflow-hidden font-montserrat flex flex-col">
        {/* ENCABEZADO FIJO CON SEPARACIÓN BORDER-B */}
        <DialogHeader className="p-0 pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-bold text-brand-primary uppercase leading-none">
            {isEdit ? "Editar Película" : "Nueva Película"}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-500 mt-1">
            {isEdit
              ? "Modifica los datos de la película seleccionada."
              : "Registra una nueva película en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        {/* CONTENEDOR CON SCROLL Y PADDING TOP PARA EVITAR CORTES */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto pt-3 pb-2 pr-2 grid grid-cols-1 md:grid-cols-12 gap-4 text-left"
        >
          {/* SECCIÓN IZQUIERDA: PÓSTER Y BANNER */}
          <div className="md:col-span-3 flex flex-col gap-3">
            {/* PÓSTER */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-bold text-brand-primary uppercase">
                Póster Oficial
              </Label>
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`relative aspect-[3/4] w-full rounded-cineflix border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.poster
                    ? "border-red-500 bg-red-50"
                    : posterPreview
                    ? "border-brand-primary"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {posterPreview ? (
                  <div className="relative h-full w-full group">
                    <img
                      src={posterPreview}
                      alt="Póster"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 disabled:hidden"
                      title="Remover imagen"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Upload className="h-5 w-5 text-white mb-1" />
                      <p className="text-[9px] font-bold text-white uppercase">
                        Cambiar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Upload
                      className={`h-6 w-6 mx-auto mb-1 ${
                        errors.poster ? "text-red-400" : "text-slate-300"
                      }`}
                    />
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        errors.poster ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      Subir Póster
                    </p>
                  </div>
                )}
              </div>
              {errors.poster && (
                <p className="text-red-500 text-[10px] font-bold uppercase italic mt-0.5">
                  * {errors.poster.message}
                </p>
              )}
              <input
                type="file"
                className="hidden"
                disabled={isSubmitting}
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

            {/* BANNER HORIZONTAL */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-bold uppercase text-brand-primary">
                Banner Horizontal
              </Label>
              <div
                onClick={() => !isSubmitting && bannerInputRef.current?.click()}
                className={`relative aspect-[16/7] w-full rounded-cineflix border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                  errors.banner
                    ? "border-red-500 bg-red-50"
                    : bannerPreview
                    ? "border-brand-primary"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {bannerPreview ? (
                  <div className="relative h-full w-full group">
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      disabled={isSubmitting}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 disabled:hidden"
                      title="Remover banner"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <Upload className="h-4 w-4 text-white mb-0.5" />
                      <p className="text-[9px] font-bold text-white uppercase">
                        Cambiar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Upload
                      className={`h-5 w-5 mx-auto mb-0.5 ${
                        errors.banner ? "text-red-400" : "text-slate-300"
                      }`}
                    />
                    <p
                      className={`text-[9px] font-bold uppercase ${
                        errors.banner ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      Subir Banner
                    </p>
                  </div>
                )}
              </div>
              {errors.banner && (
                <p className="text-red-500 text-[10px] font-bold uppercase italic mt-0.5">
                  * {errors.banner.message}
                </p>
              )}
              <input
                type="file"
                className="hidden"
                disabled={isSubmitting}
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
          </div>

          {/* CAMPOS DEL FORMULARIO (DERECHA) */}
          <div className="md:col-span-9 space-y-3">
            {/* Título y Trailer en 2 Columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7">
                <InputForm
                  label="Título"
                  disabled={isSubmitting}
                  {...register("title", { required: "Campo obligatorio" })}
                  error={errors.title?.message}
                />
              </div>
              <div className="sm:col-span-5">
                <InputForm
                  label="URL Trailer"
                  disabled={isSubmitting}
                  {...register("trailerUrl")}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Clasificación, Duración y Estado en 3 Columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <SelectForm
                label="Clasificación"
                disabled={isSubmitting}
                {...register("ageClassification", {
                  required: "Campo obligatorio",
                  valueAsNumber: true,
                })}
                error={errors.ageClassification?.message}
              >
                <option value="">Seleccionar...</option>
                {ageClassificationsList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.description}
                  </option>
                ))}
              </SelectForm>

              <InputForm
                label="Duración (min)"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (["-", "e", "E", ".", ","].includes(e.key))
                    e.preventDefault();
                }}
                type="number"
                {...register("durationMinutes", {
                  required: "Campo obligatorio",
                  valueAsNumber: true,
                })}
                error={errors.durationMinutes?.message}
              />

              <SelectForm
                label="Estado en Ciclo"
                disabled={isSubmitting}
                {...register("lifecycleState", {
                  required: "Campo obligatorio",
                  valueAsNumber: true,
                })}
                error={errors.lifecycleState?.message}
              >
                <option value="">Seleccionar...</option>
                {lifecycleStatesList.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name || state.description}
                  </option>
                ))}
              </SelectForm>
            </div>

            {/* Fecha Estreno */}
            <div className="w-1/3 pr-1.5">
              <Controller
                name="releaseDate"
                control={control}
                rules={{ required: "Campo obligatorio" }}
                render={({ field }) => (
                  <DatePickerCustom
                    label="Estreno"
                    value={field.value || ""}
                    onChange={(iso) => field.onChange(iso)}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* ChipsSelectors */}
            <div className="space-y-2">
              <ChipsSelectorForm
                label="Idiomas"
                options={languagesList}
                selectedValues={selectedLanguages}
                disabled={isSubmitting}
                registerProps={register("languages", {
                  validate: (value) =>
                    value.length > 0 || "Campo obligatorio",
                })}
                error={errors.languages?.message}
              />

              <ChipsSelectorForm
                label="Proyecciones"
                options={projectionTypesList}
                selectedValues={selectedProjectionTypes}
                disabled={isSubmitting}
                registerProps={register("projectionTypes", {
                  validate: (value) =>
                    value.length > 0 || "Campo obligatorio",
                })}
                error={errors.projectionTypes?.message}
              />

              <ChipsSelectorForm
                label="Géneros"
                options={genresList}
                selectedValues={selectedGenres}
                disabled={isSubmitting}
                registerProps={register("genres", {
                  validate: (value) =>
                    value.length > 0 || "Campo obligatorio",
                })}
                error={errors.genres?.message}
              />
            </div>

            {/* Sinopsis */}
            <TextAreaCustom
              label="Sinopsis"
              rows={2}
              disabled={isSubmitting}
              {...register("synopsis", {
                required: "Campo obligatorio",
              })}
              error={errors.synopsis?.message}
            />
          </div>

          {/* FOOTER INTERNO INTEGRADO */}
          <div className="md:col-span-12 pt-3 border-t mt-2">
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <DisableIfNoPermission
                permission={
                  isEdit ? "CRUD:UPDATE:MOVIES" : "CRUD:CREATE:MOVIES"
                }
                title="No tienes permiso para guardar películas"
              >
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-primary text-white font-bold px-5 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : isEdit ? (
                    "Guardar Cambios"
                  ) : (
                    "Registrar Película"
                  )}
                </Button>
              </DisableIfNoPermission>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}