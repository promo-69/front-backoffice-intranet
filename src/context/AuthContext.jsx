import { createContext, useState, useContext, useEffect } from "react";
import {
  loginRequest,
  refreshSession,
  logoutRequest,
} from "../services/auth.service";
import { useLoading } from "./LoadingContext";

export const AuthContext = createContext();

/*const ROLE_MAP = {
  1: "SUPER_ADMIN",
  2: "GENERAL_MANAGER",
  3: "CINEMA_MANAGER",
  4: "CASHIER",
  5: "USHER",
};*/


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    async function initSession() {
      // 1. Evitamos el 401 innecesario: si no hay usuario guardado, 
      // asumimos que no hay sesión y no disparamos el refresh.
      if (!localStorage.getItem("user")) return;

      showLoader();
      try {
        // 2. Intentamos renovar la sesión (el interceptor en axios.js ayudará aquí)
        const ok = await refreshSession(); 

        if (ok) {
          const saved = localStorage.getItem("user");
          if (saved) setUser(JSON.parse(saved));
        } else {
          // Si el refresh falla (401), limpiamos el estado
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        // Fallo de red o servidor caído
        console.error( "Error al verificar sesión:", error);
        //setUser(null);
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
      //tomando los roles para guardar  
      const userData = {
        ...data,
        role: data.roleCode, 
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