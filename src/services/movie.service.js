import api from '../api/axios.js'; 
/*
export const getMovies = async(params) => {
    const response = await api.get('/movies', { 
      params
    }); 
    return response.data;
  };*/

  // Cambia esto en movie.service.js
export const getMovies = async (params) => {
  const response = await api.get('/movies', {
    params: {
      page: String(params.page || 1),
      per_page: String(params.per_page || 10)
    }
  }); 
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
    const response = await api.put(`/movies/${id}`, movieData);
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