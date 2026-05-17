import api from '../api/axios.js'; 

export const moviesService = {
  getAll: async () => {
    const response = await api.get('/movies'); 
    return response.data;
  },

  create: async (formData) => {
  const response = await api.post('/movies', formData);
  return response.data;
},

  update: async (id, movieData) => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  }
};