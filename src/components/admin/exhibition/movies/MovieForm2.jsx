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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function MovieForm({ open, onClose, onSuccess, initialData }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);
  const [posterPreview, setPosterPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    // Definimos valores por defecto para evitar saltos en el renderizado inicial
    defaultValues: {
      lifecycleStates: 1,
      allowPromotions: true
    }
  });

  /** * React Compiler Warning: 
   * watch() dispara re-renders necesarios. Para que el compilador no se queje 
   * en versiones futuras, podrías usar useWatch, pero watch es totalmente 
   * funcional aquí para la lógica condicional.
   */
  const selectedState = watch("lifecycleStates");

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          ...initialData,
          poster: undefined, 
        });
        setPosterPreview(initialData.poster_url);
      } else {
        reset({
          title: "",
          ageClassification: "",
          releaseDate: "",
          durationMinutes: "",
          lifecycleStates: 1,
          synopsis: "",
          trailerUrl: "",
          allowPromotions: true,
          specialPrice: ""
        });
        setPosterPreview(null);
      }
    }
  }, [initialData, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);
      setValue("poster", e.target.files); 
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach((key) => {
      if (key === "poster") {
        if (data[key] && data[key][0]) {
          formData.append("poster", data[key][0]);
        }
      } else {
        // Solo enviamos campos de precio si es Evento Especial
        if (selectedState !== 3 && (key === "special_price" || key === "allowPromotions")) {
            return;
        }
        formData.append(key, data[key]);
      }
    });

    onSuccess(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-cineflix p-8 shadow-2xl border-none overflow-y-auto max-h-[90vh] font-montserrat">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary transition">
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary uppercase tracking-tight">
            {isEdit ? "Editar Película" : "Nueva Película"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground ">
            {isEdit
              ? "Modifique los detalles de la película seleccionada"
              : "Complete los datos para registrar una nueva película en el sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
          
          {/* COLUMNA IZQUIERDA: PÓSTER */}
          <div className="md:col-span-4 space-y-4">
            <Label className="text-[12px] font-bold uppercase tracking-wide text-brand-primary">Póster Oficial</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50'}`}
            >
              {posterPreview ? (
                <img src={posterPreview} alt="Prevista del póster" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Subir Imagen</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            {errors.poster && <p className="text-[10px] text-red-500 text-center font-bold">{errors.poster.message}</p>}
          </div>

          {/* COLUMNA DERECHA: DATOS */}
          <div className="md:col-span-8 space-y-5">
            <InputForm
              label="Título"
              {...register("title", { required: "El título es obligatorio" })}
              placeholder="Título de la película"
              error={errors.title?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectForm
                label="Clasificación"
                {...register("ageClassification", { required: "Este campo es obligatorio", valueAsNumber: true })}
                error={errors.ageClassification?.message}
              >
                <option value="">Seleccione...</option>
                <option value={1}>A (Todo Público)</option>
                <option value={2}>B (Mayores de 12)</option>
                <option value={3}>C (Mayores de 15)</option>
                <option value={4}>C (Exclusivo o Mayores de 18)</option>
              </SelectForm>

              <InputForm
                label="Fecha de Estreno"
                type="date"
                {...register("releaseDate", { required: "Este campo es obligatorio" })}
                error={errors.releaseDate?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputForm
                label="Duración (min)"
                type="number"
                {...register("durationMinutes", { required: "Este campo es obligatorio", valueAsNumber: true })}
                error={errors.durationMinutes?.message}
              />
              <SelectForm
                label="Estado"
                {...register("lifecycleState", { valueAsNumber: true })}
              >
                <option value={1}>Próximamente</option>
                <option value={2}>En Cartelera</option>
                <option value={3}>Evento Especial</option>
              </SelectForm>
            </div>

            {/* SECCIÓN CONDICIONAL: EVENTO ESPECIAL */}
            {selectedState === 3 && (
              <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center text-brand-primary">
                 
                  <span className="text-[10px] font-bold uppercase tracking-widest">Configuración Evento Especial</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputForm
                    label="Precio Especial ($)"
                    type="number"
                    step="0.01"
                    {...register("specialPrice", { required: selectedState === 3 })}
                  />
                  <div className="flex flex-col justify-center space-y-2">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Promociones</Label>
                    <div className="flex items-center gap-2">
                      <Switch 
                        onCheckedChange={(checked) => setValue("allowPromotions", checked)}
                        defaultChecked={true}
                      />
                      <span className="text-[10px]font-medium">Habilitar descuentos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TextAreaCustom
              label="Sinopsis"
              {...register("synopsis", { required: "Este campo es obligatoria" })}
              placeholder="Resumen de la trama..."
              error={errors.synopsis?.message}
            />

            <InputForm
              label="URL Trailer"
              {...register("trailerUrl")}
              placeholder="https://youtube.com/..."
              error={errors.trailerUrl?.message}
            />
          </div>

          <DialogFooter className="col-span-12 mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="font-bold text-[10px] uppercase tracking-widest rounded-xl h-12 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary hover:brightness-110 text-white font-bold px-8 rounded-xl h-12 shadow-lg uppercase text-[10px] tracking-widest transition-all active:scale-95"
            >
              {isEdit ? "Guardar Cambios" : "Registrar Película"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}