import axios from 'axios';

const api = axios.create({
  baseURL: "https://backend-jog6.onrender.com/api/v1",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;