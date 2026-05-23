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

const api = axios.create({
  baseURL: "https://backend-jog6.onrender.com/api/v1/test", // Tu URL de Render
  withCredentials: true, // Crucial para que viajen siempre las cookies SameSite=None
  timeout: 50000,        // 30 segundos de margen para que Render se despierte si está dormido
  headers: {
    "x-client-channel": "web", 
  },
});

// Variables para controlar el refresco concurrente
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// INTERCEPTOR DE RESPUESTA
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url === "/auth/refresh") {
        return Promise.reject(error);
      }

      // Si ya se está ejecutando un refresh, mandamos esta petición a la cola de espera
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true; 
      isRefreshing = true; // Bloqueamos el paso para las demás peticiones

      try {
        // Intentamos renovar la sesión una única vez para todo el sistema
        await api.post("/auth/refresh");
        
        // Desbloqueamos y procesamos todas las peticiones que quedaron esperando
        processQueue(null);
        isRefreshing = false;

        // Reintentamos la petición que inició el refresco
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla, cancelamos toda la cola y limpiamos sesión
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("user");
        
        // Opcional: Redirigir al login de forma limpia si estás en el navegador
        if (typeof window !== "undefined") {
          window.location.href = "/login"; 
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;