import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/lib/permissions";

export default function PrivateRoute({ children, permission }) {
  const { user } = useAuth();

  // Si no hay usuario → fuera
  if (!user) return <Navigate to="/login" />;

  // Permisos del rol actual
  const allowed = PERMISSIONS[user.roleCode] || [];

  // Si la ruta requiere un permiso y el usuario no lo tiene → fuera
  if (permission && !allowed.includes(permission)) {
    return <Navigate to="/login" />;
  }

  return children;
}
