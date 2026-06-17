import api from '@/api/axios';

const BASE = '/reports';

// ── Helper ────────────────────────────────────────────────────────────────────
// cinemaId undefined = vista global (superadmin sin filtro) o empleado (sale del JWT)

const p = (params = {}, cinemaId) => {
  const out = { ...params };
  if (cinemaId) out.cinemaId = cinemaId;
  return out;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = (params = {}, cinemaId) =>
  api.get(`${BASE}/dashboard`, { params: p(params, cinemaId) }).then((r) => r.data.data);

// ── Charts ────────────────────────────────────────────────────────────────────

export const getChart = (reportType, params = {}, cinemaId) =>
  api.get(`${BASE}/${reportType}/chart`, { params: p(params, cinemaId) }).then((r) => r.data.data);

// ── Reportes individuales ─────────────────────────────────────────────────────

export const getSalesReport    = (params = {}, cinemaId) => api.get(`${BASE}/sales`,     { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getMoviesReport   = (params = {}, cinemaId) => api.get(`${BASE}/movies`,    { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getEventsReport   = (params = {}, cinemaId) => api.get(`${BASE}/events`,    { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getInventoryReport= (params = {}, cinemaId) => api.get(`${BASE}/inventory`, { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getCashierReport  = (params = {}, cinemaId) => api.get(`${BASE}/cashier`,   { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getShowtimesReport= (params = {}, cinemaId) => api.get(`${BASE}/showtimes`, { params: p(params, cinemaId) }).then((r) => r.data.data);
export const getRentalsReport  = (params = {}, cinemaId) => api.get(`${BASE}/rentals`,   { params: p(params, cinemaId) }).then((r) => r.data.data);

// ── Exportación ───────────────────────────────────────────────────────────────

export const exportReport = async (reportType, format, params = {}, cinemaId) => {
  const response = await api.get(`${BASE}/${reportType}/export`, {
    params: p({ ...params, format }, cinemaId),
    responseType: format === 'json' ? 'json' : 'blob',
  });

  if (format === 'json') return response.data;

  const mimeTypes = {
    csv:  'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf:  'application/pdf',
  };

  const url = URL.createObjectURL(new Blob([response.data], { type: mimeTypes[format] }));
  const a   = document.createElement('a');
  a.href    = url;
  a.download = `${reportType}-report.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};
