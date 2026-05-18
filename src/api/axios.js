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

/// Nota: No vinculamos los interceptores de request aquí al LoadingContext 
// de forma global para evitar que peticiones en paralelo alteren el contador 
// y dejen la pantalla congelada si una petición falla (502 o 401).

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos reintentado esta petición aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Disparar el refresh en segundo plano usando la instancia nativa de axios
        // para que no pase por los interceptores de nuestra instancia "api"
        await axios.post(
          "/auth/refresh",
          {},
          { 
            withCredentials: true,
            _skipLoader: true // Bandera informativa
          }
        );

        // Si el refresh fue exitoso, reintentamos la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh también falla (sesión expiró de verdad), limpiamos y redirigimos
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;