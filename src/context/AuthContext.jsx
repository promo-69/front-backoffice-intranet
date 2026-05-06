import { createContext, useState } from "react";
import { loginRequest } from "../services/auth.service";

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials) => {
    try {
      const data = await loginRequest(credentials);

      const userFromServer = data.user;
      const tokens = data.tokens;

      if (!userFromServer || !userFromServer.roleCode) {
        return {
          success: false,
          message: "El usuario no tiene rol asignado",
        };
      }

      // Guardar tokens y usuario
      localStorage.setItem("token", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(userFromServer));

      setUser(userFromServer);

      return { success: true, user: userFromServer };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
