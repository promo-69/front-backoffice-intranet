const CinemaTable = ({
  data,
  onEdit,
  onDelete,
  onSelectBranch,
  selectedId,
}) => {

  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-gray-600 uppercase tracking-wider border-b border-border font-montserrat">
            <th className="py-4 px-4 w-10"></th>
            <th className="py-4 px-4">Nombre</th>
            <th className="py-4 px-4">Dirección</th>
            <th className="py-4 px-4">Teléfono</th>
            <th className="py-4 px-4 text-center">Horario</th>
            <th className="py-4 px-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {safeData.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400">
                No hay sucursales disponibles
              </td>
            </tr>
          ) : (
            safeData.map((item) => {
              const isSelected = String(selectedId) === String(item.id);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectBranch(isSelected ? null : item.id)}
                  className={`
                    transition-colors cursor-pointer group font-montserrat
                    hover:bg-brand-primary/10
                    ${isSelected ? "bg-brand-primary/20" : "bg-transparent"}
                  `}
                >
                  <td className="py-4 px-4">
                    <div
                      className={`
                        w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-brand-primary border-brand-primary"
                            : "border-gray-400 bg-transparent group-hover:border-brand-primary/50"
                        }
                      `}
                    >
                      {isSelected && (
                        <Check
                          className="w-2.5 h-2.5 text-brand-gold"
                          strokeWidth={4}
                        />
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-700">
                    {item.name}
                  </td>

                  <td className="py-4 px-4 text-gray-500 max-w-xs truncate">
                    {item.address}
                  </td>

                  <td className="py-4 px-4 text-gray-500 font-medium">
                    {item.phone}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 font-medium">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>{item.opening_time}</span>
                      <span className="text-brand-primary">-</span>
                      <span>{item.closing_time}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="text-brand-primary hover:scale-110 transition-transform"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="text-red-500 hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CinemaTable;