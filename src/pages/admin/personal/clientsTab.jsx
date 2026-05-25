export default function ClientsTable({ clients }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        {/* ⭐ ENCABEZADOS */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Documento
            </th>
            <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
              Nivel
            </th>
            <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
              Puntos
            </th>
          </tr>
        </thead>

        {/* ⭐ CUERPO */}
        <tbody className="divide-y divide-gray-200">
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-800">
                {c.person.first_name} {c.person.last_name}
              </td>

              {/* ⭐ DOCUMENTO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {c.person.document_number}
              </td>

              {/* ⭐ NIVEL */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-montserrat text-gray-700">
                {c.customer.loyalty.level_name}
              </td>

              {/* ⭐ PUNTOS */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-montserrat font-bold text-brand-primary">
                {c.customer.level_progress_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
