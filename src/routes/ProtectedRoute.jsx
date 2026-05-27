import { Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role } = useRole();

  // Si no hay rol, no está logueado
  if (!role) return <Navigate to="/login" replace />;

  // Si el rol NO está permitido, redirigimos
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/no-access" replace />;
  }

  // Si está permitido, mostramos la ruta
  return children;
}
