import { Navigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";

export default function ProtectedRoute({
  permission = null, // un permiso único
  permissions = null, // lista de permisos (AND)
  anyOf = null, // lista de permisos (OR)
  allowedRoles = null, // roles permitidos
  children,
}) {
  const { role, isSuperAdmin, can, canAll, canAny, hasRole } = usePermission();

  // 1. Si no hay usuario logueado → redirigir
  if (!role) return <Navigate to="/login" replace />;

  // 2. SUPER_ADMIN siempre puede todo
  if (isSuperAdmin) return children;

  // 3. Validación por rol
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/no-access" replace />;
  }

  // 4. Validación por permiso único
  if (permission && !can(permission)) {
    return <Navigate to="/no-access" replace />;
  }

  // 5. Validación por permisos (AND)
  if (permissions && !canAll(permissions)) {
    return <Navigate to="/no-access" replace />;
  }

  // 6. Validación por permisos (OR)
  if (anyOf && !canAny(anyOf)) {
    return <Navigate to="/no-access" replace />;
  }

  // 7. Si pasa todas las validaciones → acceso permitido
  return children;
}
