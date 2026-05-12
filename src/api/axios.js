import axios from 'axios';
import { refreshAccessToken } from '../services/auth.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Evitar bucles: Si el error viene del propio endpoint de refresh, no reintentar
    if (originalRequest.url.includes("/auth/refresh")) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 2. Manejar el 401 estándar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Si ni siquiera hay refresh token, fuera
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // IMPORTANTE: Usa axios directo aquí para evitar que el interceptor 
        // de petición le meta el Bearer Token viejo que causó el error
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken: refreshToken
        });

        if (res.data.success) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem("token", newToken);
          
          // Reintentar con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 3. SI EL REFRESH DA 401: Aquí es donde "muere" la sesión
        console.error("El Refresh Token también expiró.");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export default api;