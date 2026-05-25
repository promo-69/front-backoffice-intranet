import api from '../api/axios.js';

export const showtimesService = {
  getAll: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/showtimes?page=${page}&limit=${limit}`);
      return response.data; 
    } catch (error) {
      console.error("Error en showtimesService.getAll:", error);
      return { data: [], metadata: { total: 0, per_page: 10, current_page: 1, total_pages: 1 } };
    }
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