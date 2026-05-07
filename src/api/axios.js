import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //baseURL: "/api", //para desarrollo con proxy
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;