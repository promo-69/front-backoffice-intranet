import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

const CatalogTable = ({ data, selectedId, onSelectCatalog, onEdit, onDelete, metadata }) => {
  const dynamicFields = metadata
    ? Object.entries(metadata).filter(([key, config]) => 
        config.visible && !["id", "deleted_at", "created_at", "updated_at", "status"].includes(key)
      )
    : [];
  return (
    <div className="bg-white rounded-t-xl border border-gray-200 shadow-sm overflow-hidden border-b-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-montserrat">
            <tr>
              <th className="px-6 py-4 font-semibold">ID</th>
              {dynamicFields.length > 0 ? (
                dynamicFields.map(([key, config]) => (
                  <th key={key} className="px-6 py-4 font-semibold capitalize">{config.uiLabel}</th>
                ))
              ) : (
                <>
                  <th className="px-6 py-4 font-semibold">Nombre del Maestro</th>
                  <th className="px-6 py-4 font-semibold">Descripción</th>
                </>
              )}
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-montserrat">
                  No se encontraron maestros en el sistema.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectCatalog(item.id)}
                  className={`hover:bg-brand-primary/5 transition-colors cursor-pointer group ${
                    selectedId === item.id ? "bg-brand-primary/10 border-l-4 border-l-brand-gold" : "border-l-4 border-l-transparent"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-500">#{item.id}</td>
                  {dynamicFields.length > 0 ? (
                    dynamicFields.map(([key], index) => (
                      <td key={key} className={`px-6 py-4 ${index === 0 ? 'font-bold text-brand-primary' : 'text-gray-600'}`}>
                        {item[key]}
                      </td>
                    ))
                  ) : (
                    <>
                      <td className="px-6 py-4 font-bold text-brand-primary">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600">{item.description}</td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DisableIfNoPermission permission={"CRUD:UPDATE:CATALOGS"} title="No tienes permiso para editar maestros">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                          title="Editar maestro"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </DisableIfNoPermission>
                      <DisableIfNoPermission permission={"CRUD:DELETE:CATALOGS"} title="No tienes permiso para eliminar maestros">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar maestro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </DisableIfNoPermission>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogTable;
