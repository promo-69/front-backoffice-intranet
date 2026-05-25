import api from "../api/axios";

export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data.user;
};

export const loginAdminRequest = async (data) => {
  const response = await api.post("/auth/login/admin", data);
  return response.data.data.user
}

/*
export const refreshSession = async () => {
  try {
    await api.post("auth/refresh");
    return true;
  } catch (error) {
    // Si es 401, es un resultado "esperado" (sesión expirada), no un error crítico
    if (error.response?.status !== 401) {
      console.error("Error técnico en el servidor:", error);
    }
    return false;
  }
};*/

export const refreshSession = async () => {
  try {
    await api.post(
      "/auth/refresh",
      {},
      { withCredentials: true } // Forzamos el envío y recepción de cookies SameSite=None
    );
    return true;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error("Error técnico en el servidor:", error);
    }
    return false;
  }
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};
