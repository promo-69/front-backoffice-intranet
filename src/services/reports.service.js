import api from "@/api/axios";

const BASE = "/reports";

const p = (params = {}, cinemaId) => {
  const out = { ...params };
  if (cinemaId) out.cinemaId = cinemaId;
  return out;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/dashboard`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);

// ── Charts ────────────────────────────────────────────────────────────────────

export const getChart = (reportType, params = {}, cinemaId) =>
  api
    .get(`${BASE}/${reportType}/chart`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);

// ── Reportes individuales ─────────────────────────────────────────────────────

export const getSalesReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/sales`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getMoviesReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/movies`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getEventsReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/events`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getInventoryReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/inventory`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getCashierReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/cashier`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getShowtimesReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/showtimes`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);
export const getRentalsReport = (params = {}, cinemaId) =>
  api
    .get(`${BASE}/rentals`, { params: p(params, cinemaId) })
    .then((r) => r.data.data);

// ── Exportación ───────────────────────────────────────────────────────────────

const MIME = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

const triggerDownload = (data, format, reportType) => {
  const url = URL.createObjectURL(new Blob([data], { type: MIME[format] }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}-report.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportReport = async (
  reportType,
  format,
  params = {},
  cinemaId,
) => {
  try {
    const response = await api.get(`${BASE}/${reportType}/export`, {
      params: p({ ...params, format }, cinemaId),
      responseType: "blob",
    });

    // Si la respuesta no es un blob válido o el content-type indica error
    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      // El backend devolvió un error JSON (posible error de validación)
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "Error al exportar");
    }

    triggerDownload(response.data, format, reportType);
  } catch (error) {
    // Si el error es del axios (status 400, 403, etc.)
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "Error al exportar");
    }
    throw error;
  }
};
