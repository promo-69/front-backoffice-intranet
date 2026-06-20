import api from "@/api/axios";

const BASE = "/reports";

const p = (params = {}, cinemaId) => {
  const out = { ...params };
  if (cinemaId) out.cinemaId = cinemaId;
  return out;
};

const MIME = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

const triggerDownload = (data, format, reportType) => {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: MIME[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}-report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
      // Forzar explícitamente — responseType:'blob' puede perder withCredentials
      // del instance default en producción con dominios cruzados
      withCredentials: true,
    });

    // Detectar si el backend devolvió un error JSON disfrazado de blob
    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text =
        response.data instanceof Blob
          ? await response.data.text()
          : JSON.stringify(response.data);
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "Error al exportar");
    }

    triggerDownload(response.data, format, reportType);
  } catch (error) {
    // Error HTTP (4xx/5xx) — el body también llega como blob por responseType:'blob'
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || "Error al exportar");
      } catch {
        throw new Error("Error en la descarga del reporte");
      }
    }
    throw error;
  }
};
