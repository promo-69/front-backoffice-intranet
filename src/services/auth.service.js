import api, { refreshToken } from "../api/axios";

export const loginRequest = async (data) => {
  const response = await api.post("/auth/login/admin", data);
  return response.data.data.user;
};

export const loginAdminRequest = async (data) => {
  const response = await api.post("/auth/login/admin", data);
  return response.data.data.user
}

export const refreshSession = async () => {
  try {
    return await refreshToken();
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
