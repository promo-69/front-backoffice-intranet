import { createContext, useState, useContext, useEffect, useRef, useMemo } from "react";
import {
  loginRequest,
  refreshSession,
  logoutRequest,
  getPermissionsRequest,
} from "../services/auth.service";
import { useLoading } from "./LoadingContext";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Mantener un Set en memoria para checks O(1). Se serializa a array en localStorage.
  const initialPermissions = useMemo(() => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.permissions) ? parsed.permissions : [];
    } catch {
      return [];
    }
  }, []);

  const [permissionsSet, setPermissionsSet] = useState(() => {
    const normalized = (initialPermissions || []).map((p) => (p || "").toString().trim().toUpperCase()).filter(Boolean);
    return new Set(normalized);
  });

  const { showLoader, hideLoader } = useLoading();
  const initialized = useRef(false);

  // ============================
  //   REFRESH DE SESIÓN
  // ============================
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initSession() {
      const saved = localStorage.getItem("user");
      if (!saved) return;

      showLoader();
      try {
        const refreshed = await refreshSession();
        if (refreshed) {
          let permissions = [];
          try {
            permissions = await getPermissionsRequest();
          } catch (err) {
            console.error("Error fetching permissions on refresh:", err);
          }

          // Normalizar permisos
          const normalized = (permissions || []).map((p) => (p || "").toString().trim().toUpperCase()).filter(Boolean);

          // El backend debe devolver nuevamente roleCode
          const updatedUser = {
            ...JSON.parse(saved),
            role: refreshed.roleCode,
            permissions: normalized,
          };

          // Persistir permisos normalizados
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setPermissionsSet(new Set(normalized));
        } else {
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.log("Excepción en initSession:", error);
        setUser(null);
      } finally {
        hideLoader();
      }
    }

    initSession();
  }, []);

  // ============================
  //   LOGIN
  // ============================
  const login = async (credentials) => {
    showLoader();
    try {
      const data = await loginRequest(credentials);

      if (!data || !data.roleCode) {
        return { success: false, message: "El usuario no tiene rol asignado" };
      }

      let permissions = [];
      try {
        permissions = await getPermissionsRequest();
      } catch (err) {
        console.error("Error fetching permissions on login:", err);
      }

      const normalized = (permissions || []).map((p) => (p || "").toString().trim().toUpperCase()).filter(Boolean);

      const userData = {
        ...data,
        role: data.roleCode, // ← rol real del backend
        permissions: normalized, // ← permisos normalizados
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPermissionsSet(new Set(normalized));

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    } finally {
      hideLoader();
    }
  };

  // ============================
  //   LOGOUT
  // ============================
  const logout = async () => {
    showLoader();
    try {
      await logoutRequest();
    }
    catch (error) {
      console.error("Error al revocar token en servidor, limpiando local de igual forma", error);
     
    } finally {
       localStorage.removeItem("user");
      setUser(null);
      // Intento de limpieza por cliente: eliminar todas las cookies accesibles (no HttpOnly)
      try {
        if (typeof document !== "undefined") {
          const cookies = document.cookie ? document.cookie.split(';').map(c => c.trim()).filter(Boolean) : [];
          cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            try {
              document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0;`;
            } catch (e) {
              // noop
            }
            try {
              const domain = window.location.hostname;
              document.cookie = `${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0;`;
            } catch (e) {
              // noop
            }
          });
        }
      } catch (e) {
        console.warn("No se pudieron limpiar cookies desde cliente:", e);
      }

      hideLoader();
    }
  };

  const hasPermission = (permission) => {
    if (!permission) return false;
    const role = user?.role || null;
    if (role === "SUPER_ADMIN") return true;
    return permissionsSet.has(permission.toString().trim().toUpperCase());
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, permissionsSet, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
