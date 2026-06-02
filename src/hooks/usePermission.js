import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function usePermission() {
  const { user } = useContext(AuthContext);

  const role = user?.role || null;
  const permissions = user?.permissions || [];

  // SUPER_ADMIN siempre puede todo
  const isSuperAdmin = role === "SUPER_ADMIN";

  // Validar permisos reales del backend
  const can = (permission) => {
    if (isSuperAdmin) return true; // bypass total
    return permissions.includes(permission);
  };

  // Validar múltiples permisos (OR)
  const canAny = (permissionList = []) => {
    if (isSuperAdmin) return true;
    return permissionList.some((p) => permissions.includes(p));
  };

  // Validar múltiples permisos (AND)
  const canAll = (permissionList = []) => {
    if (isSuperAdmin) return true;
    return permissionList.every((p) => permissions.includes(p));
  };

  // Validar roles
  const hasRole = (roles = []) => roles.includes(role);

  return {
    role,
    permissions,
    isSuperAdmin,
    can,
    canAny,
    canAll,
    hasRole,
  };
}
