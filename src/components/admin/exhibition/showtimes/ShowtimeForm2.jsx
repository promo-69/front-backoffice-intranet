import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";

export function ShowtimeForm({ open, onClose, onSave, initialData, movies = [], rooms = [], projectionTypes = [] }) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
 
  if (!open) return; 

  if (initialData) {
    const date = new Date(initialData.start_time || initialData.startTime);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);

    reset({
      movieId: initialData.movie_id || initialData.movieId,
      roomId: initialData.room_id || initialData.roomId,
      projectionTypeId: initialData.projection_type_id || initialData.projectionTypeId,
      currencyId: initialData.currency_id || initialData.currencyId,
      price: initialData.price,
      startTime: localISOTime,
      earnedLoyaltyPoints: initialData.earned_loyalty_points || initialData.earnedLoyaltyPoints
    });
  } else {
    reset({
      movieId: "",
      roomId: "",
      projectionTypeId: "",
      currencyId: 1,
      price: "",
      startTime: "",
      earnedLoyaltyPoints: 0
    });
  }
}, [open, initialData, reset]);

  const onSubmit = (values) => {
    
    const payload = {
      movieId: Number(values.movieId),
      roomId: Number(values.roomId),
      projectionTypeId: Number(values.projectionTypeId),
      startTime: new Date(values.startTime).toISOString(), // Se envía en UTC
      currencyId: Number(values.currencyId),
      price: parseFloat(values.price),
      earnedLoyaltyPoints: Number(values.earnedLoyaltyPoints)
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-cineflix p-6 font-montserrat max-h-[90vh] shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Función" : "Programar Nueva Función"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la función seleccionada." : "Registra una nueva función."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          
          <SelectForm label="Película" error={errors.movieId?.message} {...register("movieId", { required: "Este campo es obligatorio" })}>
            <option value="">Seleccionar...</option>
            {movies.map(movie => 
            <option key={movie.id} value={movie.id}>{movie.title}
            </option>
          )}
          </SelectForm>

          <div className="grid grid-cols-2 gap-2">
            <SelectForm label="Sala" error={errors.roomId?.message} 
            {...register("roomId", { required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar...</option>
              {rooms.map(room => 
              <option key={room.id} value={room.id}>{room.name || room.description}
              </option>
            )}
            </SelectForm>
            
            <SelectForm label="Tipo Proyección" error={errors.projectionTypeId?.message} {...register("projectionTypeId", { required: "Este campo es obligatorio" })}>
              {projectionTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}
              </option>)}
            </SelectForm>
          </div>

          <InputForm label="Inicio (HH:mm)" type="datetime-local" error={errors.startTime?.message} {...register("startTime", { required: "Este campo es obligatorio" })} />
          
          <div className="grid grid-cols-2 gap-2">
            <SelectForm label="Moneda" error={errors.currencyId?.message} {...register("currencyId", { required: "Este campo es obligatorio" })}>
              <option value={1}>USD ($)</option>
              <option value={2}>VES (Bs.)</option>
            </SelectForm>

            <InputForm 
              label="Precio" 
              type="text" 
              inputMode="decimal" 
              placeholder="0.00"
              error={errors.price?.message} 
              {...register("price", { 
                required: "Este campo es obligatorio",
                // Interceptamos el evento onChange de React Hook Form
                onChange: (e) => {
                  // Limpiamos el string dejando solo los números reales enteros
                  const rawValue = e.target.value.replace(/\D/g, "");
                  
                  // Si no hay nada escrito, dejamos el campo vacío
                  if (!rawValue) {
                    e.target.value = "";
                    return;
                  }

                  //  Convertimos a centavos dividiendo entre 100
                  const numericValue = parseFloat(rawValue) / 100;

                  // Formateamos a un estándar fijo de 2 decimales (.toFixed(2))
                  // Si prefieres usar la coma como decimal, puedes usar un replace final o un NumberFormat
                  e.target.value = numericValue.toFixed(2);
                }
              })} 
            />
          </div>

          <InputForm label="Puntos de Lealtad" type="number" {...register("earnedLoyaltyPoints")} />

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}className="rounded-xl h-12 px-6">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90">
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}