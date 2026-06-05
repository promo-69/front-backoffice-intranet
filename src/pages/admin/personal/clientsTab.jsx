export default function ClientsTable({ clients }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#4B2E83]">
      <table className="min-w-full divide-y divide-[#4B2E83]/60">
        {/* ⭐ ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Documento
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nivel
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
              Puntos
            </th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-[#4B2E83]/40">
          {clients.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="text-center py-6 text-gray-500 font-montserrat"
              >
                No hay clientes registrados.
              </td>
            </tr>
          )}

          {clients.map((c) => (
            <tr
              key={c.person.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* ⭐ NOMBRE */}
              <td className="py-4 px-4 font-bold text-slate-700 text-xs max-w-32 truncate whitespace-nowrap">
                {c.person.first_name} {c.person.last_name}
              </td>

              {/* ⭐ DOCUMENTO */}
              <td className="py-4 px-4 text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                {c.person.document_number}
              </td>

              {/* ⭐ NIVEL */}
              <td className="py-4 px-4 font-bold text-gray-500 max-w-32 truncate whitespace-nowrap text-xs">
                {c.customer.loyalty.level_name}
              </td>

              {/* ⭐ PUNTOS */}
              <td className="py-4 px-4 text-gray-500 max-w-32 truncate whitespace-nowrap text-xs text-right">
                {c.customer.level_progress_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
