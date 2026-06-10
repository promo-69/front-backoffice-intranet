import api from '../api/axios.js';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (raw?.rows) return raw.rows;
  return [];
}

export const showtimesService = {
  getAll: async () => {
    const response = await api.get('/showtimes');
    return extractRows(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/showtimes/${id}`);
    return response.data;
  },

  create: async (showtimeData) => {
    const response = await api.post('/showtimes', showtimeData);
    return response.data;
  },

  update: async (id, showtimeData) => {
    const response = await api.put(`/showtimes/${id}`, showtimeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/showtimes/${id}`);
    return response.data;
  }
};