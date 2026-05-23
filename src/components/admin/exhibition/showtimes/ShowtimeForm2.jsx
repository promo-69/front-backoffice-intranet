import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm"; 
import { CustomCombobox } from "@/components/ui/CustomCombobox"; 
import { getRoomsByCinema, getRoomProjectionTypes } from "@/services/room.service"; 

export function ShowtimeForm({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  movies = [], 
  branches = [] 
}) {
  const isEdit = !!initialData;
  const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors } } = useForm();

  // Estados locales para controlar la doble cascada
  const [rooms, setRooms] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingProjections, setLoadingProjections] = useState(false);

  // Escucha activa de los campos controlados
  const watchMovieId = watch("movieId");
  const watchBranchId = watch("branchId");
  const watchRoomId = watch("roomId");
  const watchProjectionTypeId = watch("projectionTypeId");
  const watchCurrencyId = watch("currencyId");

  // --- CASCADA 1: Sucursal -> Salas ---
  useEffect(() => {
    if (!watchBranchId) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await getRoomsByCinema(Number(watchBranchId));
        setRooms(data || []);
      } catch (error) {
        console.error("Error al cargar las salas de la sucursal:", error);
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [watchBranchId]);

  // --- CASCADA 2: Sala -> Formatos / Tipos de Proyección ---
  useEffect(() => {
    if (!watchRoomId) {
      setProjectionTypes([]);
      return;
    }

    const fetchProjections = async () => {
      setLoadingProjections(true);
      try {
        // Consumimos tu nuevo método de servicio
        const response = await getRoomProjectionTypes(Number(watchRoomId));
        // Si el backend responde con { data: [...] }, extraemos de forma segura
        const list = response.data || response || [];
        setProjectionTypes(list);
      } catch (error) {
        console.error("Error al cargar formatos de la sala:", error);
        setProjectionTypes([]);
      } finally {
        setLoadingProjections(false);
      }
    };

    fetchProjections();
  }, [watchRoomId]);

  // --- EFECTO 3: Inicialización y Precarga (Modo Creación / Edición) ---
  useEffect(() => {
    if (!open) return; 

    if (initialData) {
      const date = new Date(initialData.start_time || initialData.startTime);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);

      const branchId = initialData.Room?.branch_id || initialData._Room?.branch_id || initialData.branch_id || "";

      reset({
        movieId: String(initialData.movie_id || initialData.movie || ""),
        branchId: String(branchId),
        roomId: String(initialData.room_id || initialData.room || ""),
        projectionTypeId: String(initialData.projection_type_id || initialData.projection_type || ""),
        currencyId: String(initialData.currency_id || initialData.currency || "1"),
        price: parseFloat(initialData.price || 0).toFixed(2),
        startTime: localISOTime,
        earnedLoyaltyPoints: initialData.earned_loyalty_points || 0
      });
    } else {
      reset({
        movieId: "",
        branchId: "",
        roomId: "",
        projectionTypeId: "",
        currencyId: "1",
        price: "",
        startTime: "",
        earnedLoyaltyPoints: 0
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data) => {
    let hasErrors = false;

    const requiredComboboxes = [
      { name: "movieId", value: watchMovieId },
      { name: "branchId", value: watchBranchId },
      { name: "roomId", value: watchRoomId },
      { name: "projectionTypeId", value: watchProjectionTypeId },
      { name: "currencyId", value: watchCurrencyId }
    ];

    requiredComboboxes.forEach((field) => {
      if (!field.value || String(field.value).trim() === "") {
        setError(field.name, { type: "required", message: "Este campo es obligatorio" });
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    const payload = {
      movieId: Number(data.movieId),
      roomId: Number(data.roomId),
      projectionTypeId: Number(data.projectionTypeId),
      startTime: new Date(data.startTime).toISOString(), 
      currencyId: Number(data.currencyId),
      price: parseFloat(data.price),
      earnedLoyaltyPoints: data.earnedLoyaltyPoints ? Number(data.earnedLoyaltyPoints) : undefined
    };

    onSave(payload);
  };

  const handleSelectCombobox = (fieldName, value) => {
    setValue(fieldName, value);
    if (value && value.trim() !== "") {
      clearErrors(fieldName);
    } else {
      setError(fieldName, { type: "required", message: "Este campo es obligatorio" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-cineflix p-6 font-montserrat max-h-[90vh] shadow-2xl border-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Función" : "Programar Nueva Función"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Configure los parámetros obligatorios para la asignación de horarios en cartelera.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-6 text-left">
          
          {/* Película */}
          <CustomCombobox
            label="Película"
            placeholder="Buscar película..."
            error={errors.movieId?.message}
            value={watchMovieId}
            onSelect={(val) => handleSelectCombobox("movieId", val)}
            options={movies.map(m => ({ value: String(m.id), label: m.title }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Sucursal */}
            <CustomCombobox
              label="Sucursal / Complejo"
              placeholder="Buscar sucursal..."
              error={errors.branchId?.message}
              value={watchBranchId}
              onSelect={(val) => {
                handleSelectCombobox("branchId", val);
                setValue("roomId", ""); 
                setValue("projectionTypeId", "");
              }}
              options={branches.map(b => ({ value: String(b.id), label: b.name }))}
            />

            {/*  Salas Dependientes */}
            <CustomCombobox
              label="Sala"
              placeholder={!watchBranchId ? "Elige una sucursal" : loadingRooms ? "Cargando..." : "Buscar sala..."}
              error={errors.roomId?.message}
              value={watchRoomId}
              disabled={!watchBranchId || loadingRooms}
              onSelect={(val) => {
                handleSelectCombobox("roomId", val);
                setValue("projectionTypeId", ""); // Limpia el formato si cambia la sala elegida
              }}
              options={rooms.map(r => ({ value: String(r.id), label: r.name || `Sala ${r.number}` }))}
            />
          </div>

          {/*  Tipo de Proyección Dependiente de la Sala */}
          <CustomCombobox
            label="Tipo Proyección"
            placeholder={!watchRoomId ? "Elige una sala primero" : loadingProjections ? "Cargando formatos..." : "Seleccionar formato..."}
            error={errors.projectionTypeId?.message}
            value={watchProjectionTypeId}
            disabled={!watchRoomId || loadingProjections}
            onSelect={(val) => handleSelectCombobox("projectionTypeId", val)}
            options={projectionTypes.map(t => {
              const id = t.projection_type_id || t.id;
              const label = t.ProjectionType?.name || t.name || t.description;
              return { value: String(id), label: label };
            })}
          />

          {/* Fecha y Hora de Inicio */}
          <InputForm 
            label="Inicio (Fecha y Hora)" 
            type="datetime-local" 
            error={errors.startTime?.message} 
            {...register("startTime", { required: "Este campo es obligatorio" })} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            
            {/*  Moneda de Cobro */}
            <CustomCombobox 
              label="Moneda" 
              error={errors.currencyId?.message} 
              value={watchCurrencyId}
              onSelect={(val) => handleSelectCombobox("currencyId", val)}
              options={[
                { value: "1", label: "USD ($)" },
                { value: "2", label: "VES (Bs.)" }
              ]}
            />

            {/* Precio Formateado */}
            <InputForm 
              label="Precio" 
              type="text" 
              inputMode="decimal" 
              placeholder="0.00"
              error={errors.price?.message} 
              {...register("price", { 
                required: "Este campo es obligatorio",
                onChange: (e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  if (!rawValue) {
                    e.target.value = "";
                    return;
                  }
                  const numericValue = parseFloat(rawValue) / 100;
                  e.target.value = numericValue.toFixed(2);
                }
              })} 
            />
          </div>

          <InputForm 
            label="Puntos de Lealtad" 
            type="number" 
            error={errors.earnedLoyaltyPoints?.message} 
            {...register("earnedLoyaltyPoints")} 
          />

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12 px-6">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-brand-primary text-white font-bold h-12 rounded-xl hover:bg-brand-primary/90 transition-all">
              {isEdit ? "Actualizar Función" : "Registrar Función"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}