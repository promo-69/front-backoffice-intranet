import api from '../api/axios.js'; 

// Obtener todas las películas
export const getMovies = async (page = 1, limit = 10) => {
  const response = await api.get('/movies', { params: { page, limit } }); 
  return response.data;
};

export const getMovieById = async (movieId) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
}

export const createMovie = async (formData) => {
  // Aseguramos withCredentials síncronamente en la petición del formulario binario
  const response = await api.post("/movies", formData, {
    withCredentials: true,
    timeout: 60000,
  });
  return response.data;
};
/*
export const createMovie = async (formData) => {
    //const response = await api.post('/movies', formData);
    //return response.data;
    const response = await api.post("/movies", formData, {
    headers: {
      // ❌ NO coloques "Content-Type": "multipart/form-data" manualmente aquí.
      // Deja que Axios y el navegador lo calculen solos para que no rompa el boundary.
    },
    withCredentials: true // 100% OBLIGATORIO para que el navegador adjunte las cookies
  });
  
  return response.data;
};*/



export const updateMovie = async (id, movieData) => {
    const response = await api.patch(`/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
};

/*export const moviesService = {
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
};*/