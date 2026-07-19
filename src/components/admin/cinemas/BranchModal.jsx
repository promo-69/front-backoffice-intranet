import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/context/LoadingContext";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { InputForm } from "@/components/ui/inputForm";
import { Upload, X } from "lucide-react";

import { createCinema, updateCinema } from "@/services/cinema.service";

function ErrorMessage({ message }) {
  return message ? <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">{message}</p> : null;
}

const emptyBranchForm = { 
  name: "", 
  address: "", 
  phone: "", 
  openingTime: "", 
  closingTime: "",
  facade_url: "" // Agregado al estado inicial base
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"]; 

export default function BranchModal({ open, onClose, initialData }) {
  const isEdit = !!initialData;
  const { showLoader, hideLoader } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyBranchForm);
  const [errors, setErrors] = useState({});

  const [opening, setOpening] = useState({ hour: "", minute: "", ampm: "AM" });
  const [closing, setClosing] = useState({ hour: "", minute: "", ampm: "PM" });

  const parse24to12 = (timeString) => {
    if (!timeString) return { hour: "", minute: "", ampm: "AM" };
    const [hStr, mStr] = timeString.split(":");
    let hour = parseInt(hStr, 10);
    const minute = mStr.slice(0, 2);
    const ampm = hour >= 12 ? "PM" : "AM";
    
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour; 
    
    return {
      hour: String(hour).padStart(2, "0"),
      minute,
      ampm
    };
  };

  const convert12to24 = ({ hour, minute, ampm }) => {
    if (!hour || !minute) return "";
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        const opTime = initialData.openingTime || initialData.opening_time || "";
        const clTime = initialData.closingTime || initialData.closing_time || "";

        setFormData({
          name: initialData.name || "",
          address: initialData.address || "",
          phone: initialData.phone || "",
          openingTime: opTime,
          closingTime: clTime,
          facade_url: initialData.facade_url || initialData.facadeUrl || "", // Captura de la URL si existe en BD
        });

        setOpening(parse24to12(opTime));
        setClosing(parse24to12(clTime));
      } else {
        setFormData(emptyBranchForm);
        setOpening({ hour: "", minute: "", ampm: "AM" });
        setClosing({ hour: "", minute: "", ampm: "PM" });
      }
      setErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      openingTime: convert12to24(opening),
      closingTime: convert12to24(closing)
    }));
  }, [opening, closing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "phone") {
      const phoneRegex = /^[0-9\s-]+$/;
      if (value && !phoneRegex.test(value)) {
        error = "El teléfono solo debe contener números.";
      }
    }
    return error;
  };
  
  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(emptyBranchForm).forEach((key) => {
      const value = formData[key]?.toString().trim(); 
      if (!value) {
        newErrors[key] = "Este campo es obligatorio.";
      } else {
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        openingTime: formData.openingTime, 
        closingTime: formData.closingTime, 
        facade_url: formData.facade_url.trim(), // Inyección del campo de texto en el JSON
        status: 1 
      };

      if (isEdit) {
        await updateCinema(initialData.id, payload);
      } else {
        await createCinema(payload);
      }
      onClose(true);
    } catch (error) {
      const status = error.response?.status;
      if (status === 400) {
        setErrors((prev) => ({ ...prev, general: "Datos inválidos. Revisa los campos." }));
      } else if (status === 409) {
        setErrors((prev) => ({ ...prev, name: "Ya existe una sucursal con este nombre." }));
      } else {
        setErrors((prev) => ({ ...prev, general: "Error al guardar. Intente de nuevo." }));
      }
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  // Subcomponente Dropdown estilizado con Scroll limitado estricto
  const CustomDropdown = ({ value, placeholder, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false); // Corrección de error tipográfico del base (estaba isOpen(false))
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center rounded-md border border-slate-200 bg-white p-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none text-left"
        >
          <span className={value ? "text-slate-900" : "text-slate-400"}>
            {value || placeholder}
          </span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-32 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="cursor-pointer p-2 text-sm hover:bg-slate-100 text-slate-700 transition-colors"
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TimePicker12h = ({ label, state, setState, error }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <div className="flex gap-1">
        
        <CustomDropdown 
          value={state.hour} 
          placeholder="Hora" 
          options={HOURS_12} 
          onChange={(val) => setState(prev => ({ ...prev, hour: val }))} 
        />

        <CustomDropdown 
          value={state.minute} 
          placeholder="Min" 
          options={MINUTES} 
          onChange={(val) => setState(prev => ({ ...prev, minute: val }))} 
        />

        <CustomDropdown 
          value={state.ampm} 
          placeholder="AM/PM" 
          options={["AM", "PM"]} 
          onChange={(val) => setState(prev => ({ ...prev, ampm: val }))} 
        />
      </div>
      <ErrorMessage message={error} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? null : () => onClose(false)}>
      <DialogContent className="max-w-md bg-white rounded-cineflix p-6 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? "Modifica los datos de la sede seleccionada." : "Registra una nueva sede."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <InputForm label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Cine Plaza" />
            <ErrorMessage message={errors.name} />
          </div>

          <div>
            <InputForm label="Dirección" name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Av. Principal 123" />
            <ErrorMessage message={errors.address} />
          </div>

          <div>
            <InputForm label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej: 0251 123 1234" />
            <ErrorMessage message={errors.phone} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TimePicker12h 
              label="Apertura" 
              state={opening} 
              setState={setOpening} 
              error={errors.openingTime} 
            />
            <TimePicker12h 
              label="Cierre" 
              state={closing} 
              setState={setClosing} 
              error={errors.closingTime} 
            />
          </div>

          {/* SECCIÓN INTERACTIVA DE FACHADA DE SUCURSAL (ESTILO MOVIEMODAL) */}
          <div className="space-y-1.5 text-left">
            <label className="text-[12px] font-bold uppercase text-brand-primary">
              Fachada de la Sucursal
            </label>
            <div
              onClick={() => {
                if (isSubmitting) return;
                const url = prompt("Introduce la URL de la imagen de la fachada:");
                if (url !== null) {
                  setFormData(prev => ({ ...prev, facade_url: url }));
                  setErrors(prev => ({ ...prev, facade_url: null }));
                }
              }}
              className={`relative aspect-[16/6] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                errors.facade_url
                  ? "border-red-500 bg-red-50"
                  : formData.facade_url
                    ? "border-brand-primary"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {formData.facade_url ? (
                <div className="relative h-full w-full group">
                  <img
                    src={formData.facade_url}
                    alt="Previsualización de la Fachada"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, facade_url: "" }));
                    }}
                    disabled={isSubmitting}
                    className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 disabled:hidden"
                    title="Remover imagen"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>

                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Upload className="h-6 w-6 text-white mb-1" />
                    <p className="text-[9px] font-bold text-white uppercase">
                      Cambiar Imagen
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload
                    className={`h-6 w-6 mx-auto mb-1 ${errors.facade_url ? "text-red-400" : "text-gray-300"}`}
                  />
                  <p
                    className={`text-[10px] font-bold ${errors.facade_url ? "text-red-500" : "text-gray-400"}`}
                  >
                    ASIGNAR URL DE IMAGEN
                  </p>
                </div>
              )}
            </div>

            {errors.facade_url && (
              <p className="text-[10px] text-red-500 font-bold uppercase mt-1 italic">
                * {errors.facade_url}
              </p>
            )}
          </div>
          
          {errors.general && (
            <p className="text-red-500 text-xs text-center font-bold mt-2">
              {errors.general}
            </p>
          )}
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => onClose(false)} disabled={isSubmitting} className="flex-1">Cancelar</Button>
          <DisableIfNoPermission permission={isEdit ? "CRUD:UPDATE:CINEMAS" : "CRUD:CREATE:CINEMAS"} title="No tienes permiso para guardar sucursales">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
            >
              {isEdit ? "Actualizar" : "Registrar"}
            </Button>
          </DisableIfNoPermission>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}