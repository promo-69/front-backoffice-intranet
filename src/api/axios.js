import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {
    //"x-client-channel": "web", 
  },
});


export default api;
