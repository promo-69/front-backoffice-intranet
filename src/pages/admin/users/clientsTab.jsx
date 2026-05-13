export default function ClientesTab() {
  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="px-20 py-4 w-20">Nombre</th>
            <th className="px-4 py-4">Correo</th>
            <th className="px-4 py-4">Fecha Nac</th>
            <th className="px-4 py-4">Genero</th>
            <th className="px-1 py-4">Telefono</th>
            <th className="px-4 py-4 text-center">Acciones</th>
          </tr>
        </thead>

        
      </table>
    </div>
  );
}
