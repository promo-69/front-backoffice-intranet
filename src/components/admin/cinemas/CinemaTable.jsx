import { Pencil, Trash2 } from 'lucide-react';

const CinemaTable = ({ data, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="text-gray-400 uppercase tracking-wider border-b border-border">
          <th className="py-4 px-4">ID</th>
          <th className="py-4 px-4">NOMBRE</th>
          <th className="py-4 px-4">DIRECCIÓN</th>
          <th className="py-4 px-4">TELÉFONO</th>
          <th className="py-4 px-4">APERTURA</th>
          <th className="py-4 px-4">CIERRE</th>
          <th className="py-4 px-4">ESTADO</th>
          <th className="py-4 px-4 text-center">ACCIONES</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50/5 transition-colors">
            <td className="py-4 px-4 text-brand-primary font-bold">{item.id}</td>
            <td className="py-4 px-4 font-bold text-slate-700">{item.name}</td>
            <td className="py-4 px-4 text-gray-500 max-w-xs truncate">{item.address}</td>
            <td className="py-4 px-4 text-gray-500">{item.phone}</td>
            <td className="py-4 px-4 text-gray-500">{item.opening_time}</td>
            <td className="py-4 px-4 text-gray-500">{item.closing_time}</td>
            <td className="py-4 px-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                item.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.status.toUpperCase()}
              </span>
            </td>
            <td className="py-4 px-4">
              <div className="flex justify-center gap-3">
                <button onClick={() => onEdit(item)} className="text-brand-primary hover:scale-110 transition-transform">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:scale-110 transition-transform">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CinemaTable;