import api from "../api/axios";

export const getShowtimes = async (page = 1, limit = 10) => {
  const res = await api.get(`/showtimes?page=${page}&limit=${limit}`);
  return res.data;
};

export const getShowtimesByCinema = async ({ cinemaId, page = 1, limit = 10, startDate, endDate, onlyFuture = true }) => {
  try {
    // Construimos los query params dinámicamente
    const params = {
      page,
      limit,
      onlyFuture
    };
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    // Realiza la petición inyectando el id en la ruta de forma segura
    const res = await api.get(`/showtimes/admin/cinemas/${cinemaId}/showtimes`, { params });
     return {
      showtimes: res.data?.data?.rows || [],
      total: res.data?.data?.count || 0
    }; 
  } catch (error) {
    console.error("Error en getShowtimes service:", error);
    return { showtimes: [], total: 0 };
  }
};


export const getShowtimeById = async (id) => {
  const res = await api.get(`/showtimes/${id}`);
  return res.data.data;
};

export const createShowtime = async (payload) => {
  const res = await api.post("/showtimes", payload);
  return res.data;
};

export const createByCinema = async (cinemaId, payload) => {
  const res = await api.post(`/cinemas/${cinemaId}/showtimes`, payload);
  return res.data;
};

export const updateShowtime = async (id, payload) => {
  const res = await api.patch(`/showtimes/${id}`, payload);
  return res.data;
};

export const deleteShowtime = async (id) => {
  const res = await api.delete(`/showtimes/${id}`);
  return res.data;
};