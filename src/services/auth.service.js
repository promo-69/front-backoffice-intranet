import api from "../api/axios";

export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data.user;
};


export const getMe = async () => {
  try {
    const response = await api.post("/auth/refresh");
    return response.data.data.user;
  } catch (error) {
    console.error(
      "Error en la sesión:",
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};
