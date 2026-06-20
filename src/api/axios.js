/*
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-jog6.onrender.com/api/v1/test",
  withCredentials: true, // Configuración global para peticiones normales
});

// Interceptor de Respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response.data?.code === "TOKEN_EXPIRED") {
        originalRequest._retry = true;

        try {
          // Usamos una instancia limpia de AXIOS para evitar que herede interceptores,
          // pero le pasamos explícitamente withCredentials para obligar el envío de cookies.
          await axios.post(
            "https://backend-jog6.onrender.com/api/v1/test/auth/refresh",
            {}, // Body vacío
            { withCredentials: true } // ¡CRUCIAL! Obliga al navegador a buscar la cookie RT
          );

          // Si la petición original llevaba archivos, limpiamos el header para el reintento
          if (originalRequest.data instanceof FormData) {
            delete originalRequest.headers["Content-Type"];
          }

          // Reintentamos la petición original
          return api(originalRequest);
        } catch (refreshError) {
          console.error("La renovación de token falló por completo:", refreshError);
          // Si el refresh falla, limpiamos el estado y mandamos al login
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
*/
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "x-client-channel": "web",
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

    if (error.response?.status === 401 && !originalRequest._retry) {
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