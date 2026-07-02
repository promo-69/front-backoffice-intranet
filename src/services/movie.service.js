import api from '../api/axios.js';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (raw?.rows) return raw.rows;
  return [];
}

// Obtener todas las películas
export const getMovies = async ({ page = 1, limit = 10 } = {}) => {
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


export const updateMovie = async (id, movieData) => {
    const response = await api.patch(`/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
};
