import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Upload, Info } from "lucide-react"
import { InputCustom } from "@/components/ui/InputCustom"
import { SelectCustom } from "@/components/ui/SelectCustom"
import { TextAreaCustom } from "@/components/ui/TextAreaCustom"


export function RegisterMovieForm({ isOpen, onClose, onSuccess }) {
  const [posterPreview, setPosterPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 border-none shadow-2xl max-h-[92vh] rounded-3xl bg-white flex flex-col overflow-hidden">
        
        {/* HEADER CON IDENTIDAD CINEFLIX */}
        <DialogHeader className="bg-white p-6 text-brand-primary shrink-0 relative">
          <div className="relative z-10 flex items-center gap-4">
        
              <DialogTitle className="text-3xl font-bebas tracking-widest uppercase">
                Registrar Película
              </DialogTitle>
        
          </div>
        </DialogHeader>

        <div 
          tabIndex="0"
          className="flex-1 h-full min-h-0 overflow-y-auto outline-none focus-visible:outline-none custom-scrollbar bg-white"
        >
            <form onSubmit={handleSubmit} className="p-10 pb-4">
              <div className="flex flex-col lg:flex-row gap-12">
                
                {/* COLUMNA IZQUIERDA: PÓSTER */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative aspect-[2/3] w-full rounded-[2rem] border-4 border-dashed 
                      transition-all duration-300 group overflow-hidden flex flex-col items-center justify-center cursor-pointer
                      ${posterPreview ? 'border-brand-primary shadow-xl' : 'border-slate-200 hover:border-brand-gold bg-slate-50'}
                    `}
                  >
                    {posterPreview ? (
                      <>
                        <img src={posterPreview} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-brand-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <Upload className="mb-2" />
                          <span className="font-bold text-xs uppercase">Cambiar Imagen</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 space-y-4">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                          <Upload className="h-8 w-8 text-slate-300 group-hover:text-brand-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-600 uppercase tracking-tighter">Subir Póster</p>
                          <p className="text-sm text-slate-400 mt-1">Formatos: JPG, PNG (Max 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 italic">
                    <Info className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Recomendado: <span className="font-bold text-brand-primary">2000x3000px</span> para una visualización óptima en la App.
                    </p>
                  </div>
                </div>

                {/* COLUMNA DERECHA: DATOS */}
                <div className="flex-1 space-y-8">
                  <InputCustom label="Título" required />

                  <div className="grid grid-cols-2 gap-6">
                    <SelectCustom 
                      label="Clasificación"
                      placeholder="Seleccionar..."
                      options={[
                        { label: "Clase A (Todo público)", value: "A" },
                        { label: "Clase B (12+ años)", value: "B" },
                        { label: "Clase C (18+ años)", value: "C" },
                      ]}
                    />
                    
                    {/* INPUT DE FECHA DE ESTRENO */}
                    <InputCustom
                      label="Fecha de Estreno" 
                      type="date" 
                      className="block" 
                    />
                  </div>

                 <div className="grid grid-cols-2 gap-4">
                    <InputCustom label="Duración (Min)" type="number" />
                    <SelectCustom
                      label="Estado"
                      defaultValue="Proximamente"
                      options={[
                        { label: "Próximamente", value: "Proximamente" },
                        { label: "En Cartelera", value: "En Cartelera" },
                      ]}
                    />
                  </div>
                  <div className="space-y-6">
                    <TextAreaCustom label="Sinopsis" placeholder="Escribe un resumen..." />

                  </div>
                  <div className="space-y-2">
                    <InputCustom
                      label="URL del Trailer (YouTube/Vimeo)" 
                    />
                  </div>
                  <div className="space-y-2">
                    <InputCustom
                      label="URL del Trailer (YouTube/Vimeo)" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <InputCustom
                      label="URL del Banner Horizontal"  
                    />
                  </div>

                  {/* Campo de sinopsis usando el estilo de tus inputs (puedes crear un CineflixTextarea luego) */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 text-center font-medium italic">
                      * Verifique que los datos coincidan con la ficha técnica oficial antes de guardar.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* ACCIONES DEL FORMULARIO  */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex flex-row gap-4 justify-end pb-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="rounded-2xl h-12 px-8 font-.monserrat font-bold text-gray-400
                hover:bg-gray-400 hover:text-gray-800 
                transition-all uppercase text-base tracking-widest"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="rounded-2xl px-6 py-5 bg-brand-primary font-montserrat font-bold  hover:bg-brand-primary/90 text-white text-base shadow-md
                 transition-all uppercase tracking-widest"
              >
                Agregar
              </Button>
            </div>

        </div>

      </DialogContent>
    </Dialog>
  )
}