import { useEffect } from "react";
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
import { X } from "lucide-react";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";

export function ShowtimeForm({ open, onClose, onSuccess, initialData, movies = [], rooms = [], projectionTypes = [] }) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: 1,
      currency: 1 
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ status: 1, currency: 1, movie: "", room: "", projectionType: "" });
    }
  }, [initialData, open, reset]);

  const onSubmit = (data) => {
    
    onSuccess(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" bg-white rounded-cineflix p-6 shadow-2xl border-none overflow-y-auto max-h-[90vh] font-montserrat">
        <DialogHeader>
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-brand-primary transition">
            <X className="h-5 w-5" />
          </button>
            <div>
              <DialogTitle className="text-xl font-bold text-brand-primary font-montserrat">
                {isEdit ? "Editar Función" : "Registrar Nueva Función"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                Configuración de horarios y salas
              </DialogDescription>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/*<div className="grid grid-cols-12 gap-5">*/}
            
            <div>
              <SelectForm
                label="Película"
                error={errors.movie?.message}
                {...register("movie", { required: "Selecciona una película" })}
              >
                <option value="">Seleccionar...</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </SelectForm>
            </div>

            <div >
              <SelectForm
                label="Sala de Cine"
                error={errors.room?.message}
                {...register("room", { required: "Selecciona una sala" })}
              >
                <option value="">Seleccionar...</option>
                 {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                {/*{rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.description}
                  </option>
                ))}*/}
              </SelectForm>
            </div>
            

            <div >
              <InputForm
                label="Inicio de Función"
                type="datetime-local"
                error={errors.startTime?.message}
                {...register("startTime", { required: "Este campo es obligatorio" })}
              />
            </div>

            <div >
              <SelectForm
                label="Tipo de Proyección"
                error={errors.projectionType?.message}
                {...register("projectionType", { required: "Este campo es obligatorio" })}
              >
                <option value="">Seleccionar...</option>
                {projectionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </SelectForm>
            </div>

            <div >
              <InputForm
                label="Precio"
                type="number"
                step="0.01"
                error={errors.price?.message}
                {...register("price", { required: "Este campo es obligatorio" })}
              />
            </div>

          {/*</div>*/}

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12 px-6">
              Cancelar
            </Button>
            <Button type="submit" className="bg-brand-primary text-white px-8 rounded-xl h-12 shadow-lg uppercase text-[10px] font-black tracking-widest">
              {isEdit ? "Actualizar" : "Crear Función"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}