import axios from "axios";
import { nanoid } from "nanoid";

const baseURL = import.meta.env.VITE_API_URL;

let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = nanoid();
  localStorage.setItem("device_id", deviceId);
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "x-client-channel": "web",
    "x-device-id": deviceId,
  },
});

let isRefreshing = false;
let failedQueue = [];

// Procesamos la cola pasando el error si lo hay
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // Al resolver con éxito, las promesas avanzan al reintento
    }
  });
  failedQueue = [];
};

// Función unificada para refrescar el token usando los locks
export const refreshToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post(
      api.defaults.baseURL + "/auth/refresh",
      {},
      { withCredentials: true }
    );
    processQueue(null);
    isRefreshing = false;
    return response.data?.data?.user || response.data?.user;
  } catch (refreshError) {
    processQueue(refreshError);
    isRefreshing = false;

    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-expired"));
      window.location.href = "/login";
    }
    throw refreshError;
  }
};

// INTERCEPTOR DE RESPUESTA
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest =
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/auth/login');

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      if (originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true; 

      try {
        await refreshToken();
        // Reintentamos la operación original con el nuevo contexto de sesión
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;