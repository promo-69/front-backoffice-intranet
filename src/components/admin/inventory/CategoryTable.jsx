import { Pencil, Trash2, Tag } from "lucide-react";

export default function CategoryTable({ data, onEdit, onDelete }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
        <Tag className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg">No hay categorías registradas.</p>
        <p className="text-sm">Comienza agregando tu primera categoría.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-t-xl border-x border-t border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50 font-montserrat">
              <th className="py-4 px-6 font-semibold">Nombre</th>
              <th className="py-4 px-6 font-semibold">Descripción</th>
              <th className="py-4 px-6 font-semibold text-center w-28">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-brand-primary/5 transition-colors group">
                <td className="py-4 px-6 font-semibold text-gray-800">
                  {item.name}
                </td>
                <td className="py-4 px-6 text-gray-500">
                  {item.description || "—"}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-brand-primary hover:bg-brand-primary/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
