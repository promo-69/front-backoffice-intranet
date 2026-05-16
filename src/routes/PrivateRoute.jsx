import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // <-- ¡REVISA QUE ESTA LÍNEA ESTÉ EXACTAMENTE ASÍ!
import { PERMISSIONS } from "@/lib/permissions";

export default function PrivateRoute({ children, permission }) {
  const { user } = useAuth();
  
  // Buscamos directamente la persistencia real de la sesión
  const savedUser = localStorage.getItem("user");
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  // NUESTROS ESPÍAS DE CONSOLA PARA VER QUÉ PASA AL BORRAR EL AT:
  console.log("--- CHEQUEO DE RUTA PRIVADA ---");
  console.log("Estado 'user' en React:", user);
  console.log("Persistencia en localStorage:", savedUser);

  // 1. Si no hay estado en React NI hay nada en el localStorage → Fuera
  if (!user && !parsedUser) {
    console.log("REDIRECCIÓN: Forzando login por falta de usuario absoluto.");
    return <Navigate to="/login" replace />;
  }

  // Usamos el usuario que esté disponible
  const currentUser = user || parsedUser;

  // 2. Validamos los permisos basados en el rol del usuario recuperado
  const allowed = PERMISSIONS[currentUser?.roleCode] || [];

  // Si la ruta requiere un permiso y el usuario no lo tiene → Fuera
  if (permission && !allowed.includes(permission)) {
    console.log(`REDIRECCIÓN: Forzando login por falta de permiso [${permission}]. Permisos del usuario:`, allowed);
    return <Navigate to="/login" replace />;
  }

  return children;
}