import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // <-- ¡REVISA QUE ESTA LÍNEA ESTÉ EXACTAMENTE ASÍ!
import { PERMISSIONS } from "@/lib/permissions";

export default function PrivateRoute({ children, permission }) {
  const { user } = useAuth();
  
  const savedUser = localStorage.getItem("user");
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  if (!user && !parsedUser) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = user || parsedUser;

  const allowed = PERMISSIONS[currentUser?.roleCode] || [];

  if (permission && !allowed.includes(permission)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}