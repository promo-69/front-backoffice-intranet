import { useEffect, useState } from "react";
import { useForm, useWatch, Controller} from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { getMovies } from "@/services/movie.service";
import { getRoomsByCinema } from "@/services/room.service";
import { getEvents } from "@/services/events.service"; 
import { Switch } from "@/components/ui/switch";
import { useLoading } from "@/context/LoadingContext";
import { createShowtimesBulk } from "@/services/showtime.service";
import { toast } from "sonner";

// Conversión rápida sumando las 4 horas del offset (de VET a UTC)
const convertLocalTimeToUTCString = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  
  // Sumamos 4 horas para llevarlo a UTC (revisando que no se pase de 24)
  const utcHours = (hours + 4) % 24; 
  return `${String(utcHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export function ShowtimeModal({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  cinemaId,
  projectionTypes = [],
  languagesList = [],
  currenciesList = []
}) {
  const isEdit = !!initialData?.id;
  const [movies, setMovies] = useState([]);
  const [events, setEvents] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [isLoadingAux, setIsLoadingAux] = useState(false);

  const { register, handleSubmit, reset, control, setValue, formState } = useForm({
    defaultValues: {
      content_type: "movie",
      content_id: "",
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

  // Bulk creation state
  const [isBulk, setIsBulk] = useState(false);
  const [slots, setSlots] = useState([{ start_time: '', end_time: '' }]);
  const [daysSelected, setDaysSelected] = useState([]); // 0..6

  const watchContentType = useWatch({ control, name: "content_type", defaultValue: "movie" });
  const watchContentId = useWatch({ control, name: "content_id" });
  const watchStartTime = useWatch({ control, name: "start_time_raw", defaultValue: "" });
  const watchProjection = useWatch({ control, name: "projection_type", defaultValue: "" });
  const watchLanguage = useWatch({ control, name: "language", defaultValue: "" });
  const watchCurrency = useWatch({ control, name: "currency", defaultValue: "" });

  // Función reutilizable para calcular la hora de fin estimada
  const getComputedEndTime = (startTime, duration) => {
    if (!startTime || !duration) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    const endDate = new Date(date.getTime() + duration * 60000);
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
  };

  useEffect(() => {
    if (open && cinemaId) {
      const loadData = async () => {
        setIsLoadingAux(true);
        try {
          const cleanCinemaId = cinemaId?.id || cinemaId;

          const [moviesRes, roomsRes, eventsRes] = await Promise.all([
            getMovies({ limit: 100 }),
            getRoomsByCinema(cleanCinemaId),
            getEvents({ limit: 100 })
          ]);

          setMovies(moviesRes.data || []);

          const allRooms = Array.isArray(roomsRes) ? roomsRes : (roomsRes?.rows || []);
          
          const filteredRoomsByCinema = allRooms.filter(
            (room) => String(room.cinema) === String(cleanCinemaId)
          );

          setRoomsList(filteredRoomsByCinema);

          // Manejo de eventos
          if (Array.isArray(eventsRes)) setEvents(eventsRes);
          else if (Array.isArray(eventsRes?.data)) setEvents(eventsRes.data);
          else if (Array.isArray(eventsRes?.data?.rows)) setEvents(eventsRes.data.rows);
          else if (Array.isArray(eventsRes?.rows)) setEvents(eventsRes.rows);
          else setEvents([]);
        } catch (error) {
          console.error("Error cargando datos auxiliares:", error);
        } finally {
          setIsLoadingAux(false);
        }
      };
      loadData();
    }
  }, [open, cinemaId]);

  // Contenido seleccionado dinámico
  const selectedContent =
    watchContentType === "movie"
      ? movies.find(m => String(m.id) === String(watchContentId))
      : events.find(e => String(e.id) === String(watchContentId));

  // Filtrado proyección e idioma
  const filteredProjections = selectedContent?.projection_types?.length
    ? projectionTypes.filter(p => selectedContent.projection_types.some(mp => String(mp.projection_type || mp.projection_type_id || mp.id || mp) === String(p.id)))
    : projectionTypes;

  const filteredLanguages = selectedContent?.languages?.length
    ? languagesList.filter(l => selectedContent.languages.some(ml => String(ml.language || ml.language_id || ml.id || ml) === String(l.id)))
    : languagesList;

  // Limpiar campos inválidos
  useEffect(() => {
    if (watchContentId) {
      if (watchProjection && !filteredProjections.some(p => String(p.id) === String(watchProjection))) setValue("projection_type", "");
      if (watchLanguage && !filteredLanguages.some(l => String(l.id) === String(watchLanguage))) setValue("language", "");
    }
  }, [watchContentId, filteredProjections, filteredLanguages, setValue, watchProjection, watchLanguage]);

  // Cálculo hora de fin estimada (Modo Simple)
  useEffect(() => {
    if (isEdit && !isDirty) return;

    if (watchContentId && watchStartTime && selectedContent?.duration_minutes) {
      const endTime = getComputedEndTime(watchStartTime, selectedContent.duration_minutes);
      setValue("end_time_raw", endTime);
    }
  }, [watchContentId, watchStartTime, selectedContent, setValue, isEdit, isDirty]);

  // Recalcular horas de fin de los slots si cambia la película/duración (Modo Lote)
  useEffect(() => {
    if (!isBulk || !selectedContent?.duration_minutes) return;

    setSlots(prev =>
      prev.map(slot => {
        if (slot.start_time) {
          return {
            ...slot,
            end_time: getComputedEndTime(slot.start_time, selectedContent.duration_minutes)
          };
        }
        return slot;
      })
    );
  }, [selectedContent?.duration_minutes, isBulk]);

  // Cargar formulario
  useEffect(() => {
    if (!open) return;

    if (initialData && initialData.id) {
      const currencyId = initialData.currency?.id || initialData.currency;
      const basePrice = parseFloat(initialData.price).toFixed(2);
      const formattedPrice = Number(currencyId) === 2 ? basePrice.replace(".", ",") : basePrice;

      let datePart = "";
      let startTimePart = "";
      let endTimePart = "";

      if (initialData.start_time) {
        const startSec = new Date(initialData.start_time);
        datePart = startSec.toISOString().split("T")[0];
        startTimePart = startSec.toTimeString().split(" ")[0].slice(0, 5);
      }
      if (initialData.end_time) {
        const endSec = new Date(initialData.end_time);
        endTimePart = endSec.toTimeString().split(" ")[0].slice(0, 5);
      }

      const isMovie = !!initialData.movie;
      const initialContentId = isMovie ? (initialData.movie?.id || initialData.movie) : (initialData.event?.id || initialData.event);
      
      reset({
        content_type: isMovie ? "movie" : "event",
        content_id: initialContentId || "",
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
      reset({ 
        content_type: "movie", 
        content_id: "", 
        room: "", 
        date: "", 
        start_time_raw: "", 
        end_time_raw: "", 
        projection_type: "", 
        language: "", 
        currency: "", 
        price: "", 
        earned_loyalty_points: "" 
      });
    }
  }, [initialData, open, reset]);

  // Submit
  const { showLoader, hideLoader } = useLoading();

  const handleFormSubmit = async (data) => {
    let cleanPrice = typeof data.price === "string" ? data.price.replace(",", ".") : data.price;
    
    // If bulk mode, build bulk payload and call bulk service
    if (isBulk) {
      showLoader();
      try {
        const payload = {
          showtime_type: data.content_type,
          room: Number(data.room),
          projection_type: Number(data.projection_type),
          language: Number(data.language),
          currency: Number(data.currency),
          price: parseFloat(cleanPrice),
          earned_loyalty_points: Number(data.earned_loyalty_points || 0),
          period_start: data.period_start,
          period_end: data.period_end,
          days_of_week: daysSelected,
          // Se aplica la conversión de desfase UTC-4 antes de despachar al backend
          daily_slots: slots
            .filter(s => s.start_time && s.end_time)
            .map(s => ({ 
              start_time: convertLocalTimeToUTCString(s.start_time), 
              end_time: convertLocalTimeToUTCString(s.end_time) 
            }))
        };

        if (data.content_type === "movie") payload.movie = Number(data.content_id);
        if (data.content_type === "event") payload.special_event_id = Number(data.content_id);

        await createShowtimesBulk(payload);
        toast.success("Creación en lote completada");
        onClose(true, "Se crearon las funciones en lote correctamente.");
      } catch (error) {
        console.error("Error al crear funciones en lote:", error);
        toast.error(error?.response?.data?.message || "Error al crear funciones en lote");
      } finally {
        hideLoader();
      }
      return;
    }

    // Single creation flow (existing behavior)
    const startTimeISO = new Date(`${data.date}T${data.start_time_raw}:00`).toISOString();
    const endTimeISO = new Date(`${data.date}T${data.end_time_raw}:00`).toISOString();

    const payload = {
      showtime_type: data.content_type,
      room: Number(data.room),
      projection_type: Number(data.projection_type),
      language: Number(data.language),
      currency: Number(data.currency),
      price: parseFloat(cleanPrice),
      earned_loyalty_points: Number(data.earned_loyalty_points || 0),
      start_time: startTimeISO,
      end_time: endTimeISO
    };

    if (data.content_type === "movie") payload.movie = Number(data.content_id);
    if (data.content_type === "event") payload.special_event_id = Number(data.content_id);
    if (isEdit) payload.id = initialData.id;

    onSave(payload);
  };

  // Opciones de precio predeterminadas
  const priceOptions = ["3.00","6.00","10.00","12.00"];

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

          {/* Tipo de contenido */}
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="movie" {...register("content_type")} /> Película
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="event" {...register("content_type")} /> Evento
            </label>
            
            <div className="ml-4 flex items-center gap-3">
              <Switch checked={isBulk} onCheckedChange={(val) => setIsBulk(Boolean(val))} />
              <span className="text-sm font-medium text-slate-600">Crear en lote</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select dinámico */}
            <SelectForm
              label={watchContentType === "movie" ? "Película" : "Evento"}
              error={errors.content_id?.message}
              {...register("content_id",{ required: "Este campo es obligatorio" })}
            >
              <option value="">{watchContentType === "movie" ? "Seleccionar película..." : "Seleccionar evento..."}</option>
              {watchContentType === "movie"
                ? movies.map(item => <option key={item.id} value={item.id}>{item.title}</option>)
                : events.map(item => <option key={item.id} value={item.id}>{item.title}</option>)
              }
            </SelectForm>

            {/* Sala */}
            <SelectForm 
              label="Sala de Cine" 
              error={errors.room?.message} 
              disabled={!watchContentId}
              {...register("room", { required: "Este campo es obligatorio" })}
            >
              <option value="">Seleccionar sala...</option>
              {roomsList.map(r => <option key={r.id} value={r.id}>{r.name || `Sala ${r.id}`}</option>)}
            </SelectForm>
          </div>

          {/* Fecha simple o periodo bulk */}
          {!isBulk && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm label="Fecha de la Función" type="date" error={errors.date?.message} {...register("date", { required: "Este campo es obligatorio" })} />
              <InputForm label="Puntos de Lealtad" type="number" placeholder="0" error={errors.earned_loyalty_points?.message} {...register("earned_loyalty_points")} />
            </div>
          )}

          {isBulk && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputForm label="Periodo Desde" type="date" error={errors.period_start?.message} {...register("period_start", { required: "Este campo es obligatorio" })} />
              <InputForm label="Periodo Hasta" type="date" error={errors.period_end?.message} {...register("period_end", { required: "Este campo es obligatorio" })} />
              <InputForm label="Puntos de Lealtad" type="number" placeholder="0" error={errors.earned_loyalty_points?.message} {...register("earned_loyalty_points")} />
            </div>
          )}

          {!isBulk && (
            <div className="grid grid-cols-2 gap-4">
              <InputForm label="Hora Inicio" type="time" error={errors.start_time_raw?.message} {...register("start_time_raw",{ required: "Este campo es obligatorio" })} />
              <InputForm label="Hora Fin (Estimada)" type="time" error={errors.end_time_raw?.message} {...register("end_time_raw",{ required: "Este campo es obligatorio" })} />
            </div>
          )}

          {isBulk && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {['Dom','Lun','Mar','Mie','Jue','Vie','Sab'].map((label, idx) => (
                  <label key={idx} className={`inline-flex items-center gap-2 p-2 rounded ${daysSelected.includes(idx) ? 'bg-slate-100' : ''}`}>
                    <input type="checkbox" checked={daysSelected.includes(idx)} onChange={(e) => {
                      if (e.target.checked) setDaysSelected(prev => Array.from(new Set([...prev, idx])));
                      else setDaysSelected(prev => prev.filter(d => d !== idx));
                    }} />
                    <span className="text-xs">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-brand-primary uppercase">Slots diarios</label>
                <div className="space-y-2 mt-2">
                  {slots.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input 
                        type="time" 
                        value={s.start_time} 
                        onChange={(e) => {
                          const newStart = e.target.value;
                          const computedEnd = getComputedEndTime(newStart, selectedContent?.duration_minutes) || s.end_time;
                          setSlots(prev => prev.map((it, idx) => idx === i ? { ...it, start_time: newStart, end_time: computedEnd } : it));
                        }} 
                        className="p-2 border rounded w-36" 
                      />
                      <span>-</span>
                      <input 
                        type="time" 
                        value={s.end_time} 
                        onChange={(e) => setSlots(prev => prev.map((it, idx) => idx === i ? { ...it, end_time: e.target.value } : it))} 
                        className="p-2 border rounded w-36" 
                      />
                      <button type="button" onClick={() => setSlots(prev => prev.filter((_,idx)=>idx!==i))} className="text-red-500">Eliminar</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setSlots(prev => [...prev,{ start_time: '', end_time: '' }])} className="text-brand-primary text-sm">Añadir slot</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <SelectForm label="Tipo Proyección" error={errors.projection_type?.message} {...register("projection_type",{ required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar...</option>
              {filteredProjections.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
            </SelectForm>
            <SelectForm label="Idioma Audio" error={errors.language?.message} {...register("language",{ required: "Este campo es obligatorio" })}>
              <option value="">Seleccionar idioma...</option>
              {filteredLanguages.map(lang => <option key={lang.id} value={lang.id}>{lang.description || lang.name}</option>)}
            </SelectForm>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Moneda */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-primary uppercase">Moneda</label>
              <Controller
                control={control}
                name="currency"
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={String(field.value || "")}>
                    <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 text-left">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-lg rounded-md border">
                      {currenciesList.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {`${c.description} (${c.symbol})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && <span className="text-xs text-red-500">{errors.currency.message}</span>}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-primary uppercase">Precio</label>
              <Controller
                control={control}
                name="price"
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={String(field.value || "")}>
                    <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary h-10 text-left">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-lg rounded-md border">
                      {priceOptions.map(p => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:SHOWTIMES" : "CRUD:CREATE:SHOWTIMES"} title="No tienes permiso para guardar funciones">
              <Button type="submit" className="bg-brand-primary text-white font-bold px-6">{isEdit ? "Guardar Cambios" : "Registrar Función"}</Button>
            </DisableIfNoPermission>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}