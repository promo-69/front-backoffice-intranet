import api from "../api/axios";

export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data.user;
};

export const refreshSession = async () => {
  try {
    await api.post("/auth/refresh");
    return true;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error("Error inesperado:", error);
    }
    return false;
  }
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};
