import api from "@/api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildParams = (filters = {}) => {
  const p = {};
  if (filters.from) p.from = filters.from;
  if (filters.to) p.to = filters.to;
  if (filters.channel) p.channel = filters.channel;
  if (filters.groupBy) p.groupBy = filters.groupBy;
  return p;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = async (filters = {}) => {
  const res = await api.get("/reports/dashboard", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getDashboardByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/dashboard`, {
    params: buildParams(filters),
  });
  return res.data;
};

// ── Reportes individuales (empleado — cinemaId del JWT) ───────────────────────

export const getSalesReport = async (filters = {}) => {
  const res = await api.get("/reports/sales", { params: buildParams(filters) });
  return res.data;
};

export const getMoviesReport = async (filters = {}) => {
  const res = await api.get("/reports/movies", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getEventsReport = async (filters = {}) => {
  const res = await api.get("/reports/events", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getInventoryReport = async (filters = {}) => {
  const res = await api.get("/reports/inventory", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getShowtimesReport = async (filters = {}) => {
  const res = await api.get("/reports/showtimes", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getRentalsReport = async (filters = {}) => {
  const res = await api.get("/reports/rentals", {
    params: buildParams(filters),
  });
  return res.data;
};

export const getCashierReport = async (filters = {}) => {
  const res = await api.get("/reports/cashier", {
    params: buildParams(filters),
  });
  return res.data;
};

// ── Reportes individuales — superadmin (cinemaId en URL) ─────────────────────

export const getSalesByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/sales`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getMoviesByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/movies`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getEventsByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/events`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getInventoryByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/inventory`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getShowtimesByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/showtimes`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getRentalsByCinema = async (cinemaId, filters = {}) => {
  const res = await api.get(`/reports/cinemas/${cinemaId}/rentals`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getCashierByCinema = async (
  cinemaId,
  employeeId,
  filters = {},
) => {
  const res = await api.get(
    `/reports/cinemas/${cinemaId}/cashier/${employeeId}`,
    { params: buildParams(filters) },
  );
  return res.data;
};

// ── Charts ────────────────────────────────────────────────────────────────────

export const getChart = async (reportType, filters = {}) => {
  const res = await api.get(`/reports/${reportType}/chart`, {
    params: buildParams(filters),
  });
  return res.data;
};

export const getChartByCinema = async (cinemaId, reportType, filters = {}) => {
  const res = await api.get(
    `/reports/cinemas/${cinemaId}/${reportType}/chart`,
    { params: buildParams(filters) },
  );
  return res.data;
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const exportReport = async (reportType, format, filters = {}) => {
  const res = await api.get(`/reports/${reportType}/export`, {
    params: { ...buildParams(filters), format },
    responseType: "blob",
  });
  return res;
};

export const exportReportByCinema = async (
  cinemaId,
  reportType,
  format,
  filters = {},
) => {
  const res = await api.get(
    `/reports/cinemas/${cinemaId}/${reportType}/export`,
    {
      params: { ...buildParams(filters), format },
      responseType: "blob",
    },
  );
  return res;
};

// ── Utilidad: descargar blob ──────────────────────────────────────────────────

export const downloadBlob = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
