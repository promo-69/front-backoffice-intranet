import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoles, deleteRole } from "@/services/roles.service";
import DeleteConfirmModal from "@/components/ui/DialogConfirmModal";
import SuccessModal from "@/components/ui/SuccessModal";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";

// Roles del sistema que no deben poder eliminarse desde la UI.
const PROTECTED_ROLES = ["SUPER_ADMIN"];

export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    setErrorMsg("");
    try {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
      setIsSuccessOpen(true);
      await loadRoles();
    } catch (err) {
      console.error("Error eliminando rol:", err);
      // El backend suele impedir borrar un rol con empleados asignados.
      const apiMsg = err?.response?.data?.message;
      setErrorMsg(
        apiMsg ||
          "No se pudo eliminar el rol. Es posible que tenga empleados asignados.",
      );
      setRoleToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const skeletonRows = Array(3).fill(0);

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto bg-surface-container rounded-cineflix border border-border shadow-sm">
        <table className="min-w-full divide-y divide-[#4B2E83]/60">
          {/* ENCABEZADOS */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-600">
                Rol
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>

          {/* CUERPO */}
          <tbody className="divide-y divide-[#4B2E83]/40">
            {/* ESTADO DE CARGA (SKELETON) */}
            {loading &&
              skeletonRows.map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-4 flex justify-end">
                    <div className="h-5 bg-gray-200 rounded w-5"></div>
                  </td>
                </tr>
              ))}

            {/* ESTADO VACÍO */}
            {!loading && roles.length === 0 && (
              <tr>
                <td
                  colSpan="2"
                  className="text-center py-6 text-gray-500 font-montserrat"
                >
                  No hay roles registrados.
                </td>
              </tr>
            )}

            {/* DATOS */}
            {!loading &&
              roles.map((role) => {
                const isProtected = PROTECTED_ROLES.includes(role.code);
                return (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-left font-bold text-slate-700 text-xs">
                      {role.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-end gap-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/personal/edit-role?roleId=${role.id}`,
                          )
                        }
                        className="p-2 bg-white border border-slate-200 text-brand-primary rounded-lg shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                        title="Editar rol"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {!isProtected && (
                        <DisableIfNoPermission
                          permission={"CRUD:DELETE:ROLES"}
                          title="No tienes permiso para eliminar roles"
                        >
                          <button
                            onClick={() => {
                              setErrorMsg("");
                              setRoleToDelete(role);
                            }}
                            className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg shadow-sm hover:bg-red-400 hover:text-white transition-all"
                            title="Eliminar rol"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </DisableIfNoPermission>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        isOpen={!!roleToDelete}
        onClose={() => !isDeleting && setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={roleToDelete?.code}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Rol Eliminado"
        message="El rol se eliminó correctamente."
      />
    </div>
  );
}
