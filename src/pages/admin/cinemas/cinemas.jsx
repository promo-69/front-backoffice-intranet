import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, MapPin } from 'lucide-react';

const CinemasPage = () => {
  const [activeTab, setActiveTab] = useState('sucursales');

  const sucursales = [
    { id: 'ONYX-001', nombre: 'Sede Sambil Caracas', direccion: 'Av. Libertador, C.C. Sambil, Caracas', telefono: '+58 212 263-1212', horario: '10:00 - 01:00' },
    { id: 'ONYX-002', nombre: 'Sede Metrópolis Valencia', direccion: 'Autopista Regional del Centro, Valencia', telefono: '+58 241 876-5432', horario: '12:00 - 02:00' },
    // Agrega más según necesites
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Interno: Tabs, Buscador y Botón */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('sucursales')}
            className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'sucursales' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-400'}`}
          >
            SUCURSALES
          </button>
          <button 
            onClick={() => setActiveTab('salas')}
            className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'salas' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-400'}`}
          >
            SALAS
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="BUSCAR SUCURSAL..." 
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-md text-xs focus:outline-none w-64"
            />
          </div>
          <button className="bg-brand-primary text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-bold hover:bg-opacity-90 transition-all">
            <Plus className="w-4 h-4" /> NUEVA SUCURSAL
          </button>
        </div>
      </div>

      {/* Tabla de Sucursales */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-gray-400 uppercase tracking-wider border-b">
              <th className="py-4 px-2">ID</th>
              <th className="py-4 px-2">NOMBRE</th>
              <th className="py-4 px-2">DIRECCIÓN</th>
              <th className="py-4 px-2">TELÉFONO</th>
              <th className="py-4 px-2">HORARIO</th>
              <th className="py-4 px-2 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sucursales.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-2 text-brand-primary font-bold">{item.id}</td>
                <td className="py-4 px-2 font-bold text-slate-700">{item.nombre}</td>
                <td className="py-4 px-2 text-gray-500 max-w-xs truncate">{item.direccion}</td>
                <td className="py-4 px-2 text-gray-500">{item.telefono}</td>
                <td className="py-4 px-2 text-gray-500">{item.horario}</td>
                <td className="py-4 px-2">
                  <div className="flex justify-center gap-3">
                    <button className="text-brand-primary hover:text-blue-700"><Pencil className="w-4 h-4" /></button>
                    <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estadísticas Inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <StatCard title="TOTAL BUTACAS" value="14.850" trend="+2.4%" />
        <StatCard title="SALAS ACTIVAS" value="84" subtitle="Onyx Core" />
        <StatCard title="OCUPACIÓN MEDIA" value="62.4%" progress={62.4} />
        <div className="bg-brand-gold p-6 rounded-lg text-brand-primary">
            <p className="text-[10px] font-bold uppercase mb-2">Próxima Apertura</p>
            <h3 className="text-xl font-bebas tracking-wider">ROSARIO CENTER</h3>
            <p className="text-xs mt-1 font-bold">SEP 2024</p>
        </div>
      </div>
    </div>
  );
};

// Sub-componente para las tarjetas de stats
const StatCard = ({ title, value, trend, subtitle, progress }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-1 rounded">{trend}</span>}
      {subtitle && <span className="text-[10px] text-brand-primary font-bold">{subtitle}</span>}
    </div>
    {progress && (
      <div className="w-full bg-gray-200 h-1.5 mt-4 rounded-full overflow-hidden">
        <div className="bg-brand-primary h-full" style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

export default CinemasPage;