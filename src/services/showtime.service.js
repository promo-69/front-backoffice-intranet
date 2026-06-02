import api from "../api/axios";

export const getShowtimes = async (page = 1, limit = 10) => {
  const res = await api.get(`/showtimes?page=${page}&limit=${limit}`);
  return res.data;
};

export const getShowtimesByCinema = async (cinemaId, filters = {}) => {
  const { page = 1, limit = 10, date, startDate, endDate, movieId } = filters;

  // Construimos dinámicamente los parámetros presentes
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);

  if (date) params.append("date", date);
  if (startDate && endDate) {
    params.append("startDate", startDate);
    params.append("endDate", endDate);
  }
  if (movieId) params.append("movieId", movieId);

  const res = await api.get(`/cinemas/${cinemaId}/showtimes?${params.toString()}`);
  return res.data;
};

export const getShowtimeById = async (id) => {
  const res = await api.get(`/showtimes/${id}`);
  return res.data.data;
};

export const createShowtime = async (payload) => {
  const res = await api.post("/showtimes", payload);
  return res.data;
};

/**
 * Programar una funcion en una sucursal
 */
export const createByCinema = async (cinemaId, payload) => {
  const res = await api.post(`/cinemas/${cinemaId}/showtimes`, payload);
  return res.data;
};

export const patchShowtime = async (id, payload) => {
  const res = await api.patch(`/showtimes/${id}`, payload);
  return res.data;
};

export const deleteShowtime = async (id) => {
  const res = await api.delete(`/showtimes/${id}`);
  return res.data;
};