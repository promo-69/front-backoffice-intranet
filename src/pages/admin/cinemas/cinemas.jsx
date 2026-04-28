import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CinemaSearch from '../../../components/admin/cinemas/SearchBar';
import CinemaTable from '../../../components/admin/cinemas/CinemaTable';
import RoomManager from "../../../components/admin/cinemas/RoomManager";

const CinemaPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [branches] = useState([
    { id: 1, name: 'Sambil Barquisimeto', address: 'Av. Venezuela, C.C. Sambil', phone: '0251-1234567', opening_time: '10:00 AM', closing_time: '11:00 PM', status: 'Activo' },
    { id: 4, name: 'Metróss', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
    { id: 2, name: 'Metrópolis', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
    { id: 3, name: 'Vallenato', address: 'Av. Florencio Jiménez', phone: '0251-7654321', opening_time: '11:00 AM', closing_time: '09:00 PM', status: 'Activo' },
  ]);

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = branches.find(
    (b) => Number(b.id) === Number(selectedId)
  );

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: LISTADO DE SUCURSALES */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-montserrat font-bold text-brand-primary">
            Listado de Sucursales
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra y configura las sucursales, horarios y contactos de la cadena.
          </p>
        </div>

        <CinemaSearch 
          placeholder="Buscar Sucursal..." 
          searchTerm={searchTerm}      
          setSearchTerm={setSearchTerm}
          onAddClick={() => console.log("Abrir modal de registro")} 
        />
      </div>

      {/* TABLA DE SUCURSALES */}
      <div className="w-full">
        <CinemaTable 
          data={filteredBranches}
          selectedId={selectedId}
          onSelectBranch={(id) => {
            setSelectedId(id);
            setIsAddingRoom(false);
          }}
          onEdit={(branch) => console.log("Editando:", branch)}
          onDelete={(id) => console.log("Eliminando ID:", id)}
        />
      </div>

      {/* SECCIÓN 2: GESTIÓN DE SALAS */}
      <div className="w-full pt-8 mt-4 border-t-2 border-dashed border-slate-200">
        {selectedBranch ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
              <div>
                <h3 className="text-lg font-montserrat font-bold text-slate-800">
                  Salas en /{" "}
                  <span className="text-brand-primary">
                    {selectedBranch.name}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configura la capacidad, tecnología y disponibilidad de las salas en esta sede.
                </p>
              </div>

              <button
                onClick={() => setIsAddingRoom(true)}
                className="
                  bg-brand-primary text-white 
                  px-5 py-2.5
                  rounded-xl
                  flex items-center gap-2 
                  text-[11px] font-black uppercase tracking-widest
                  hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5
                  active:scale-95
                  transition-all duration-300
                  border-2 border-purple-400/30
                "
              >
                <Plus className="w-4 h-4 text-brand-gold" strokeWidth={3} />
                AGREGAR SALA
              </button>
            </div>

            <RoomManager 
              key={selectedBranch.id} 
              branch={selectedBranch} 
              externalIsAdding={isAddingRoom}
              setExternalIsAdding={setIsAddingRoom}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 transition-all">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <Plus className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-center max-w-xs uppercase text-[10px] tracking-widest leading-relaxed">
              Selecciona una sucursal de la tabla superior para visualizar y configurar sus salas disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;