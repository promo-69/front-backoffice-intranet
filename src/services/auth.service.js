import api from "../api/axios";

// LOGIN
export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data; 
};

export const refreshAccessToken = async (refreshToken) => {
  // Usamos api en lugar de axios directamente para mantener baseURL
  const response = await api.post("/auth/refresh", { refreshToken });
  return response.data;
};
