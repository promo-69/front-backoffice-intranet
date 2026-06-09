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
  baseURL: "https://backend-jog6.onrender.com/api/v1/test",
  withCredentials: true, 
  timeout: 30000,        
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

// INTERCEPTOR DE RESPUESTA
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Validación más segura usando .includes() para evitar problemas con URLs absolutas
      if (originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      // Si ya se está ejecutando un refresh, encolamos de forma correcta
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Al resolverse la cola, se ejecuta la petición original limpia
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true; 
      isRefreshing = true; 

      try {
        // Intentamos renovar la sesión de fondo de manera transparente
        // Eliminamos el segmento "/test" si el backend tiene la ruta en /api/v1/auth/refresh
        await axios.post(
          "https://backend-jog6.onrender.com/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        
        // Desbloqueamos y procesamos todas las peticiones encoladas
        processQueue(null);
        isRefreshing = false;

        // Reintentamos la operación original (ej: Eliminar) con el nuevo contexto de sesión
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (el refresh token expiró de verdad tras mucha inactividad)
        processQueue(refreshError);
        isRefreshing = false;

        // Limpieza segura del almacenamiento
        localStorage.removeItem("user");
        
        if (typeof window !== "undefined") {
          // Despachamos un evento personalizado por si el Contexto necesita enterarse en tiempo real
          window.dispatchEvent(new Event("auth-expired"));
          window.location.href = "/login"; 
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;