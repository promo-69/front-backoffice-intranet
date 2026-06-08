export default function ClientsTable({ clients, isLoading = false }) {
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Nombre</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Documento</th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">Nivel</th>
            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">Puntos</th>
          </tr>
        </thead>

        {/* CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          
          {/* ESTADO DE CARGA - Alineado con las celdas de datos */}
          {isLoading &&
            skeletonRows.map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="py-4 px-4 text-left"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="py-4 px-4 text-left"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="py-4 px-4 text-left"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
              </tr>
            ))}

          {/* ESTADO VACÍO */}
          {!isLoading && clients.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500 font-montserrat">
                No hay clientes registrados.
              </td>
            </tr>
          )}

          {/* ESTADO CON DATOS */}
          {!isLoading &&
            clients.map((c) => (
              <tr key={c.person.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs truncate">
                  {c.person.first_name} {c.person.last_name}
                </td>
                <td className="py-4 px-4 text-left text-gray-500 text-xs">
                  {c.person.document_number}
                </td>
                <td className="py-4 px-4 text-left font-bold text-gray-500 text-xs">
                  {c.customer.loyalty.level_name}
                </td>
                <td className="py-4 px-4 text-right text-gray-500 text-xs font-medium">
                  {c.customer.level_progress_points}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}