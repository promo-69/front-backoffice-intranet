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

  useEffect(() => {
    async function initSession() {
      showLoader();
      try {
        const ok = await refreshSession(); // renueva cookies

        if (ok) {
          const saved = localStorage.getItem("user");
          if (saved) setUser(JSON.parse(saved));
        } else {
          setUser(null);
        }
      } finally {
        hideLoader();
      }
    }

    initSession();
  }, []);

  const login = async (credentials) => {
    showLoader();
    try {
      const data = await loginRequest(credentials);

      if (!data || !data.roleCode) {
        return { success: false, message: "El usuario no tiene rol asignado" };
      }

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    } finally {
      hideLoader();
    }
  };

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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
