import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Info } from "lucide-react";
import { InputForm } from "@/components/ui/inputForm"; 
import { SelectForm } from "@/components/ui/SelectForm";
import { TextAreaCustom } from "@/components/ui/TextAreaCustom";

export default function MovieForm({ open, onClose, onSuccess, initialData }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);

  /*
  const [formData, setFormData] = useState({
    title: "",
    age_classification_id: "",
    release_date: "",
    duration_minutes: "",
    state: "Proximamente",
    synopsis: "",
    trailer_url: "",
  });*/
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || "",
    age_classification_id: initialData?.age_classification_id || "",
    release_date: initialData?.release_date || "",
    duration_minutes: initialData?.duration_minutes || "",
    state: initialData?.state || "Proximamente",
    synopsis: initialData?.synopsis || "",
    trailer_url: initialData?.trailer_url || "",
  }));

  //const [posterPreview, setPosterPreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(initialData?.poster_url || null);

  // Sincronización de datos
  /*
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPosterPreview(initialData.poster_url);
    } else {
      setFormData({
        title: "",
        age_classification_id: "",
        release_date: "",
        duration_minutes: "",
        state: "Proximamente",
        synopsis: "",
        trailer_url: "",
      });
      setPosterPreview(null);
    }
  }, [initialData, open]);
  */
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setPosterPreview(initialData.poster_url);
      } else {
        setFormData({
          title: "",
          age_classification_id: "",
          release_date: "",
          duration_minutes: "",
          state: "Proximamente",
          synopsis: "",
          trailer_url: "",
        });
        setPosterPreview(null);
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Aquí iría tu validación lógica
    console.log("Enviando película:", formData);
    onSuccess(isEdit);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* max-w-2xl para dar espacio al diseño de 2 columnas pero manteniendo el estilo compacto */}
      <DialogContent className="max-w-2xl bg-white rounded-cineflix p-8 shadow-2xl border-none overflow-y-auto max-h-[90vh] custom-scrollbar">
        
        {/* BOTÓN CERRAR ESTILO BRANCHMODAL */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-primary transition"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary font-montserrat">
            {isEdit ? "Editar Película" : "Nueva Película"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-montserrat">
            {isEdit
              ? "Actualice la ficha técnica y el material promocional de la película."
              : "Ingrese los datos principales para registrar el estreno en la cartelera."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
          
          {/* SECCIÓN PÓSTER (30% del ancho) */}
          <div className="md:col-span-4 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 font-montserrat">
              Póster Oficial
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed 
                transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden
                ${posterPreview ? 'border-brand-primary' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}
              `}
            >
              {posterPreview ? (
                <img src={posterPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Subir Imagen</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* SECCIÓN DATOS (70% del ancho) */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <InputForm
                label="Título de la Película"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: El Drama"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectForm
                label="Clasificación"
                name="age_classification_id"
                value={formData.age_classification_id}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Clase A (Todo público)</option>
                <option value="2">Clase B (12+ años)</option>
                <option value="3">Clase C (18+ años)</option>
              </SelectForm>

              <InputForm
                label="Fecha Estreno"
                name="release_date"
                type="date"
                value={formData.release_date}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputForm
                label="Duración (min)"
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="120"
              />
              <SelectForm
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleChange}
              >
                <option value="Proximamente">Próximamente</option>
                <option value="En Cartelera">En Cartelera</option>
              </SelectForm>
            </div>

            <TextAreaCustom
              label="Sinopsis"
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              placeholder="Resumen de la trama..."
              className="text-sm min-h-[100px]"
            />

            <InputForm
              label="URL Trailer"
              name="trailer_url"
              value={formData.trailer_url}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="font-montserrat text-xs uppercase tracking-widest rounded-xl h-12 px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-brand-primary hover:brightness-110 text-white font-montserrat font-bold px-8 rounded-xl h-12 shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            {isEdit ? "Guardar Cambios" : "Registrar Película"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}