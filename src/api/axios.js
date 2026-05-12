import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "x-client-channel": "web", 
  },
});

// INTERCEPTOR DE RESPUESTA
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa (200-299), no hacemos nada
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y la petición NO es al endpoint de refresh (para evitar bucles)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si ya falló el refresh una vez, no reintentes más (prevenir bucle infinito)
      if (originalRequest.url === "/auth/refresh") {
        return Promise.reject(error);
      }

      originalRequest._retry = true; // Marcamos la petición para no reintentarla más de una vez

      try {
        // Intentamos renovar la sesión
        await api.post("/auth/refresh");
        
        // Si el refresh fue exitoso, reintentamos la petición original con la nueva cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh también falla, es que la sesión expiró de verdad
        // Aquí podrías forzar un logout o simplemente limpiar el localStorage
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;