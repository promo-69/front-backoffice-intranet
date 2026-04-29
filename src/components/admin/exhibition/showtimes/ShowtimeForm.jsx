import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ShowtimeForm({ open, onClose, initialData, movies, rooms, existingShowtimes }) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    movie_id: "",
    room_id: "",
    date: "",
    start_time: "",
    end_time: "",
    price: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ movie_id: "", room_id: "", date: "", start_time: "", end_time: "", price: "" });
    setError("");
  }, [initialData, open]);

  // Lógica para calcular hora de fin automáticamente
  useEffect(() => {
  if (formData.movie_id && formData.start_time) {
    const movie = movies.find(m => m.id === parseInt(formData.movie_id));
    if (movie) {
      const [hours, minutes] = formData.start_time.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes);
      
      // Sumar duración + 15 min de limpieza (opcional)
      const end = new Date(start.getTime() + movie.duration_minutes * 60000);
      
      const endHours = String(end.getHours()).padStart(2, '0');
      const endMinutes = String(end.getMinutes()).padStart(2, '0');
      
      setFormData(prev => ({ ...prev, end_time: `${endHours}:${endMinutes}` }));
    }
  }
}, [formData.movie_id, formData.start_time, movies]);

  const checkOverlap = () => {
    // Simulación de validación de solapamiento
    const overlap = existingShowtimes.some(st => 
      st.room_id === formData.room_id && 
      st.date === formData.date &&
      ((formData.start_time >= st.start_time && formData.start_time < st.end_time) ||
       (formData.end_time > st.start_time && formData.end_time <= st.end_time))
    );
    return overlap;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkOverlap()) {
      setError("Conflicto de horario: Ya existe una función en esta sala que se solapa con el horario seleccionado.");
      return;
    }
    // Lógica para guardar...
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-8 font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Función" : "Programar Función"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <SelectForm label="Película" name="movie_id" value={formData.movie_id} onChange={(e) => setFormData({...formData, movie_id: e.target.value})}>
            <option value="">Seleccione película...</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title || m.titulo}</option>)}
          </SelectForm>

          <div className="grid grid-cols-2 gap-4">
            <SelectForm label="Sala" name="room_id" value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
              <option value="">Seleccione sala...</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </SelectForm>
            <InputForm label="Fecha" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputForm label="Hora Inicio" type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2">Hora Fin (Auto)</label>
              <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold">
                {formData.end_time || "--:--"}
              </div>
            </div>
          </div>

          <InputForm label="Precio Base" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-brand-primary text-white">Confirmar Función</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}