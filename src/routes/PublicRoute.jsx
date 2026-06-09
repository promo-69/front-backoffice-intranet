import { Navigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";

export default function PublicRoute({ children }) {
  const { role } = usePermission();

  // Si hay un usuario logueado con rol, redirigir al dashboard según el rol
  if (role) {
    if (
      role === "SUPER_ADMIN" ||
      role === "GENERAL_MANAGER" ||
      role === "CINEMA_MANAGER" ||
      role === "USHER"
    ) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === "CASHIER") {
      return <Navigate to="/ticketOffice/dashboard" replace />;
    }
    return <Navigate to="/no-access" replace />;
  }

  // Si no está logueado, permitir el acceso a la ruta (como el Login)
  return children;
}
