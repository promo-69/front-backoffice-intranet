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

  // Objeto de configuración común para cuando se deniega el acceso
  const accessDeniedRedirect = (
    <Navigate to="/login" state={{ unauthorized: true }} replace />
  );

  // 3. Validación por rol
  if (allowedRoles && !hasRole(allowedRoles)) {
    console.log("[ProtectedRoute] denied by role", { role, allowedRoles });
    return accessDeniedRedirect;
  }

  // 4. Validación por permiso único
  if (permission && !can(permission)) {
    console.log("[ProtectedRoute] denied by permission", { role, permission });
    return accessDeniedRedirect;
  }

  // 5. Validación por permisos (AND)
  if (permissions && !canAll(permissions)) {
    console.log("[ProtectedRoute] denied by permissions (AND)", {
      role,
      permissions,
    });
    return accessDeniedRedirect;
  }

  // 6. Validación por permisos (OR)
  if (anyOf && !canAny(anyOf)) {
    console.log("[ProtectedRoute] denied by anyOf (OR)", { role, anyOf });
    return accessDeniedRedirect;
  }

  // 7. Si pasa todas las validaciones → acceso permitido
  return children;
}
