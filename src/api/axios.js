import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
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