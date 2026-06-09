import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { getMovies } from "@/services/movie.service";
import { getRoomsByCinema } from "@/services/room.service";

export function ShowtimeModal({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  cinemaId,
  projectionTypes = [],
  languagesList=[],
  currenciesList = []
}) {
  const isEdit = !!initialData?.id;
  const [movies, setMovies] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoadingAux, setIsLoadingAux] = useState(false);
  
  const { register, handleSubmit, reset, control, setValue, formState} = useForm({
    defaultValues: {
      movie: "",
      room: "",
      date: "",
      start_time_raw: "",
      end_time_raw: "",
      projection_type: "",
      language: "",
      currency: "",
      price: "",
      earned_loyalty_points: ""
    }
  });

  const { errors, isDirty } = formState;
  const watchMovie = useWatch({ control, name: "movie", defaultValue: "" });
  const watchStartTime = useWatch({ control, name: "start_time_raw", defaultValue: "" });
  const watchProjection = useWatch({ control, name: "projection_type", defaultValue: "" });
  const watchLanguage = useWatch({ control, name: "language", defaultValue: "" });

  // Carga automática de películas y salas al abrir el modal
  useEffect(() => {
    if (open && cinemaId) {
      const loadData = async () => {
        setIsLoadingAux(true);
        try {
          const [moviesRes, roomsRes] = await Promise.all([
            getMovies({ limit: 100 }),
            getRoomsByCinema(cinemaId)
          ]);
          setMovies(moviesRes.data || []);
          setRoomsList(Array.isArray(roomsRes) ? roomsRes : (roomsRes?.rows || []));
        } catch (error) {
          console.error("Error cargando datos auxiliares:", error);
        } finally {
          setIsLoadingAux(false);
        }
      };
      loadData();
    }
  }, [open, cinemaId]);

  // Lógica de Filtrado: Cruza la película seleccionada con los catálogos globales
  const selectedMovie = movies.find(m => String(m.id) === String(watchMovie));

  const filteredProjections = selectedMovie?.projection_types?.length > 0
    ? projectionTypes.filter(p => 
        selectedMovie.projection_types.some(mp => String(mp.projection_type || mp.projection_type_id || mp.id || mp) === String(p.id))
      )
    : projectionTypes;

  const filteredLanguages = selectedMovie?.languages?.length > 0
    ? languagesList.filter(l => 
        selectedMovie.languages.some(ml => String(ml.language || ml.language_id || ml.id || ml) === String(l.id))
      )
    : languagesList;

  // Efecto para limpiar campos si dejan de ser válidos al cambiar la película
  useEffect(() => {
    if (watchMovie) {
      if (watchProjection && !filteredProjections.some(p => String(p.id) === String(watchProjection))) {
        setValue("projection_type", "");
      }
      if (watchLanguage && !filteredLanguages.some(l => String(l.id) === String(watchLanguage))) {
        setValue("language", "");
      }
    }
  }, [watchMovie, filteredProjections, filteredLanguages, setValue, watchProjection, watchLanguage]);

  // cálculo de la Hora de Fin Estimada
  useEffect(() => {
    if (isEdit && !isDirty) {
      setFilteredRooms([]);
    return;
    }

    if (watchMovie && watchStartTime && selectedMovie?.duration_minutes) {
      const [hours, minutes] = watchStartTime.split(':').map(Number);
      
      // Creamos un objeto Date para manipular el tiempo fácilmente
      const date = new Date();
      date.setHours(hours, minutes, 0);
      
      // Sumamos la duración de la película (en milisegundos)
      const endDate = new Date(date.getTime() + selectedMovie.duration_minutes * 60000);
      
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      
      setValue("end_time_raw", `${endHours}:${endMinutes}`);
    }
  }, [watchMovie, watchStartTime, selectedMovie, setValue]);

  // CARGAR O RESETEAR EL FORMULARIO
  useEffect(() => {
    if (!open) return;

    if (initialData && initialData.id) {
      // 1. Formatear precio según moneda
      const currencyId = initialData.currency?.id || initialData.currency;
      const basePrice = parseFloat(initialData.price).toFixed(2);
      const formattedPrice = Number(currencyId) === 2 
        ? basePrice.replace(".", ",") 
        : basePrice;

      // 2. Parsear Fechas ISO del Backend a Inputs nativos (YYYY-MM-DD y HH:mm)
      let datePart = "";
      let startTimePart = "";
      let endTimePart = "";

      if (initialData.start_time) {
        const startSec = new Date(initialData.start_time);
        datePart = startSec.toISOString().split("T")[0]; // "2026-06-15"
        startTimePart = startSec.toTimeString().split(" ")[0].slice(0, 5); // "18:00"
      }

      if (initialData.end_time) {
        const endSec = new Date(initialData.end_time);
        endTimePart = endSec.toTimeString().split(" ")[0].slice(0, 5); // "20:15"
      }

      reset({
        movie: initialData.movie?.id || initialData.movie, // Previene si el backend manda objeto o ID plano
        room: initialData.room?.id || initialData.room,
        date: datePart,
        start_time_raw: startTimePart,
        end_time_raw: endTimePart,
        projection_type: initialData.projection_type?.id || initialData.projection_type,
        language: initialData.language?.id || initialData.language,
        currency: initialData.currency?.id || initialData.currency,
        price: formattedPrice,
        earned_loyalty_points: initialData.earned_loyalty_points || "0"
      });
    } else {
      // Valores limpios para creación de nueva función
      reset({ movie: "", room: "", date: "", start_time_raw: "", end_time_raw: "", projection_type: "", language: "0", currency: "", price: "", earned_loyalty_points: "" });
    }
  }, [initialData, open, reset, isEdit]);

  // SUBMIT DEL FORMULARIO
  const handleFormSubmit = (data) => {
    let cleanPrice = data.price;
    if (typeof cleanPrice === "string") {
      cleanPrice = cleanPrice.replace(",", "."); 
    }

    // Unir la Fecha con las Horas nativas para construir los ISO Strings perfectos que espera Cineflix
    const startTimeISO = new Date(`${data.date}T${data.start_time_raw}:00`).toISOString();
    const endTimeISO = new Date(`${data.date}T${data.end_time_raw}:00`).toISOString();

    const payload = {
      movie: Number(data.movie),
      room: Number(data.room),
      projection_type: Number(data.projection_type),
      language: Number(data.language),
      currency: Number(data.currency),
      price: parseFloat(cleanPrice),
      earned_loyalty_points: data.earned_loyalty_points ? Number(data.earned_loyalty_points) : 0,
      start_time: startTimeISO,
      end_time: endTimeISO
    };

    if (isEdit) {
      payload.id = initialData.id; 
    }

    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-cineflix p-6 shadow-2xl font-montserrat max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary uppercase">
            {isEdit ? "Editar Función" : "Registrar Función"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Establece los parámetros de tiempo, espacio y precio de la función.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4 text-left">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SELECCIÓN DE PELÍCULA */}
            <SelectForm label="Película" error={errors.movie?.message} {...register("movie", { required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar película...</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </SelectForm>

            {/* SELECCIÓN DE SALA REAL DISPONIBLE */}
            <SelectForm 
              label="Sala de Cine" 
              error={errors.room?.message} 
              disabled={!watchMovie}
              {...register("room", { required: "Este campo es obligatorio" })}
            >
              <option value="">Seleccionar sala...</option>
              {roomsList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name || `Sala ${r.id}`}
                </option>
              ))}
            </SelectForm>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CONTROL DE FECHA */}
            <InputForm
              label="Fecha de la Función"
              type="date"
              error={errors.date?.message}
              {...register("date", { required: "Este campo es obligatorio" })}
            />

            {/* PUNTOS DE LEALTAD */}
            <InputForm 
              label="Puntos de Lealtad" 
              type="number" 
              placeholder="0"
              error={errors.earned_loyalty_points?.message}
              {...register("earned_loyalty_points")} 
            />
          </div>

          {/* CONTROLES DE HORAS ATÓMICAS */}
          <div className="grid grid-cols-2 gap-4">
            <InputForm
              label="Hora Inicio"
              type="time"
              error={errors.start_time_raw?.message}
              {...register("start_time_raw", { required: "Este campo es obligatorio" })}
            />
            <InputForm
              label="Hora Fin (Estimada)"
              type="time"
              error={errors.end_time_raw?.message}
              {...register("end_time_raw", { required: "Este campo es obligatorio" })}
            />
          </div>

          {/* PROYECCIÓN E IDIOMA */}
          <div className="grid grid-cols-2 gap-4">
            <SelectForm label="Tipo Proyección" error={errors.projection_type?.message} {...register("projection_type", { required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar...</option>
              {filteredProjections.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
            </SelectForm>

            <SelectForm label="Idioma Audio" error={errors.language?.message} {...register("language", { required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar idioma...</option>
              {filteredLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.description || lang.name}</option>
              ))}
            </SelectForm>
          </div>

          {/* MONEDA Y PRECIO */}
          <div className="grid grid-cols-2 gap-4">
            <SelectForm label="Moneda" error={errors.currency?.message} {...register("currency", { required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar...</option>
              {currenciesList.map(c => <option key={c.id} value={c.id}>{`${c.description} (${c.symbol})`}</option>)}
            </SelectForm>

            <InputForm
              label="Precio Entrada"
              type="text"
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price", {
                required: "Este campo es obligatorio",
                onChange: (e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  if (!rawValue) { e.target.value = ""; return; }
                  const numericValue = (parseFloat(rawValue) / 100).toFixed(2);
                  e.target.value = Number(watchCurrency) === 2 ? numericValue.replace(".", ",") : numericValue;
                }
              })}
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
            type="submit" 
            className="bg-brand-primary text-white font-bold px-6"
            >
              {isEdit ? "Guardar Cambios" : "Registrar Función"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}