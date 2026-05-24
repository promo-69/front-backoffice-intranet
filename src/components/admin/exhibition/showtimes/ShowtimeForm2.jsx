import { useEffect} from "react";
import { useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";

export function ShowtimeForm({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  movies = [], 
  bookingsList = [],
  projectionTypes = [],
  currenciesList = []
}) {
  const isEdit = !!initialData;
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      movie: "",
      booking: "",
      projection_type: "",
      currency: "",
      price: "",
      earned_loyalty_points: ""
    }
  });

  // Optimizamos usando useWatch para aislar los re-renders del cambio de moneda
  const watchCurrency = useWatch({
    control,
    name: "currency",
    defaultValue: ""
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      // Ajuste del precio inicial según la moneda que traiga de la BD
      const basePrice = parseFloat(initialData.price).toFixed(2);
      const currentCurrency = initialData.currency;
      
      const formattedPrice = Number(currentCurrency) === 2 
        ? basePrice.replace(".", ",") 
        : basePrice;

      reset({
        movie: initialData.movie,
        booking: initialData.booking,
        projection_type: initialData.projection_type,
        currency: currentCurrency,
        price: formattedPrice,
        earned_loyalty_points: initialData.earned_loyalty_points || ""
      });
    } else {
      reset({ movie: "", booking: "", projection_type: "", currency: "", price: "", earned_loyalty_points: "" });
    }
  }, [initialData, open, reset]);

  const handleFormSubmit = (data) => {
    let cleanPrice = data.price;
    if (typeof cleanPrice === "string") {
      cleanPrice = cleanPrice.replace(",", "."); // Sanitización para VES
    }

    const payload = {
      movie: Number(data.movie),
      booking: Number(data.booking),
      projection_type: Number(data.projection_type),
      currency: Number(data.currency),
      price: parseFloat(cleanPrice),
      earned_loyalty_points: data.earned_loyalty_points ? Number(data.earned_loyalty_points) : null
    };

    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Función" : "Nueva Función"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Asigna una película a una reserva de sala y define su precio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4 text-left">
          <SelectForm label="Película" error={errors.movie?.message} {...register("movie", { required: "Obligatorio" })}>
            <option value="">Seleccionar película...</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </SelectForm>

          <SelectForm label="Bloque de Reserva (Sala)" error={errors.booking?.message} {...register("booking", { required: "Obligatorio" })}>
            <option value="">Seleccionar horario y sala...</option>
            {bookingsList.map(b => (
              <option key={b.id} value={b.id}>
                {`Sala ${b.room_id || b.roomId} - ${b.start_time ? new Date(b.start_time).toLocaleString() : 'Reserva #' + b.id}`}
              </option>
            ))}
          </SelectForm>

          <div className="grid grid-cols-2 gap-4">
            <SelectForm label="Tipo Proyección" error={errors.projection_type?.message} {...register("projection_type", { required: "Obligatorio" })}>
              <option value="">Seleccionar...</option>
              {projectionTypes.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
            </SelectForm>

            <SelectForm label="Moneda" error={errors.currency?.message} {...register("currency", { required: "Obligatorio" })}>
              <option value="">Seleccionar...</option>
              {currenciesList.map(c => <option key={c.id} value={c.id}>{`${c.description} (${c.symbol})`}</option>)}
            </SelectForm>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputForm
              label="Precio"
              type="text"
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price", {
                required: "Obligatorio",
                validate: {
                  minPrice: (val) => {
                    const normalized = typeof val === "string" ? val.replace(",", ".") : val;
                    return parseFloat(normalized) >= 0 || "El precio mínimo es 0.00";
                  }
                },
                onChange: (e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  if (!rawValue) { e.target.value = ""; return; }
                  const numericValue = (parseFloat(rawValue) / 100).toFixed(2);
                  // Id 2 = VES
                  e.target.value = Number(watchCurrency) === 2 ? numericValue.replace(".", ",") : numericValue;
                }
              })}
            />

            <InputForm 
              label="Puntos Lealtad" 
              type="number" 
              error={errors.earned_loyalty_points?.message}
              {...register("earned_loyalty_points", {
                min: { value: 0, message: "Mínimo 0 puntos" }
              })} 
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-brand-primary text-white font-bold px-6">
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}