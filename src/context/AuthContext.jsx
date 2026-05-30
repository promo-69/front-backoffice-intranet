import { createContext, useState, useContext, useEffect } from "react";
import {
  loginRequest,
  refreshSession,
  logoutRequest,
} from "../services/auth.service";
import { useLoading } from "./LoadingContext";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const { showLoader, hideLoader } = useLoading();

  // ============================
  //   REFRESH DE SESIÓN
  // ============================
  useEffect(() => {
    async function initSession() {
      const saved = localStorage.getItem("user");
      if (!saved) return;

      showLoader();
      try {
        const refreshed = await refreshSession();

        if (refreshed) {
          // El backend debe devolver nuevamente roleCode y permissions
          const updatedUser = {
            ...JSON.parse(saved),
            role: refreshed.roleCode,
            permissions: refreshed.permissions || [],
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch {
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

      const userData = {
        ...data,
        role: data.roleCode, // ← rol real del backend
        permissions: data.permissions || [], // ← permisos reales del backend
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

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
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      hideLoader();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
