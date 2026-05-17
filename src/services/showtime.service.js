import api from '../api/axios.js';

export const showtimesService = {
  getAll: async () => {
    const response = await api.get('/showtimes');
    return response.data;
  },

  getById: async(id)=>{
    const response = await api.get(`/showtimes/${id}`)
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