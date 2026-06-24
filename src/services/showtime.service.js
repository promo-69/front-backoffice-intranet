import api from "../api/axios";

export const getShowtimes = async (page = 1, limit = 10) => {
  const res = await api.get(`/showtimes?page=${page}&limit=${limit}`);
  return res.data;
};

export const getShowtimesByCinema = async ({ cinemaId, page = 1, limit = 10, startDate, endDate, onlyFuture = true }) => {
  // Construimos los query params dinámicamente
  const params = { page, limit, onlyFuture };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  // Petición al endpoint
  const res = await api.get(`/showtimes/admin/cinemas/${cinemaId}/showtimes`, { params });

  // El backend puede devolver varias formas:
  // 1) { data: [ ... ], metadata: { total, ... } }
  // 2) { data: { rows: [...], count: N } }
  // 3) directamente { rows: [...], count: N }
  const body = res.data?.data ?? res.data;

  let rows = [];
  let count = 0;
  let metadata = res.data?.metadata ?? (body?.metadata ?? {});

  if (Array.isArray(body)) {
    rows = body;
    count = metadata?.total ?? body.length;
  } else {
    rows = body?.rows ?? [];
    count = body?.count ?? metadata?.total ?? 0;
    metadata = body?.metadata ?? metadata;
  }

  return {
    showtimes: rows,
    total: count,
    metadata
  };
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

// Bulk creation endpoint
export const createShowtimesBulk = async (payload) => {
  const res = await api.post(`/showtimes/bulk`, payload);
  return res.data;
};

// Creacion de una funcion de Evento - Mary
export const createShowtimesByEvent = async (cinemaId, payload) => {
    const res = await api.post(`/cinemas/${cinemaId}/showtimes`, payload);
    return res.data;
};

// Obtener Eventos completos - Mary
export const getEvents = async () => {
  const response = await api.get('/special-events/admin?limit=-1');
  return response.data;
};

// Obtener cartelera por sucursal
export const getBillboard = async (cinemaId) => {
  const response = await api.get('/showtimes/billboard', { params: { cinemaId } });
  const body = response.data?.data ?? response.data;
  const rows = Array.isArray(body) ? body : (body?.rows ?? []);
  return { rows };
};

// Mapa completo de asientos con categorías, condición y estado
export const getSeatMap = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seat-map`);
  return response.data?.data || response.data;
};

// Estado de asientos (vendidos + bloqueados) de una función
export const getSeatsStatus = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seats-status`);
  const data = response.data?.data || response.data;
  console.log(`[seats-status ${showtimeId}]`, data);
  return data;
};
