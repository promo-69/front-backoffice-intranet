import api from "@/api/axios";

const BASE = "/rentals/requests";

export const getRentalRequests = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data;
};

export const getRentalRequestById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const getAdminRentalRequests = async (params = {}) => {
  const res = await api.get("/rentals/admin/requests", { params });
  return res.data;
};

export const updateRentalStatus = async (id, payload) => {
  const res = await api.patch(`${BASE}/${id}/status`, payload);
  return res.data;
};

export const confirmRentalPayment = async (id) => {
  const res = await api.patch(`${BASE}/${id}/payment`);
  return res.data;
};

// ── Taquilla (POS): cobro de solicitudes de alquiler aprobadas ────────────────

/**
 * Lista solicitudes de alquiler en "Pendiente de Pago" que el cajero puede
 * cobrar. `q` cruza cédula, nombre, correo o número de referencia.
 */
export const getPayableRentals = async (q = "") => {
  const res = await api.get("/rentals/pos/payable", {
    params: { q, limit: 50 },
  });
  return res.data;
};

/**
 * Registra el pago de una solicitud desde taquilla y la marca como pagada.
 * @param {number} id
 * @param {{ payment_method?: number, reference?: string, amount?: number }} payment
 */
export const payRentalFromPOS = async (id, payment) => {
  const res = await api.post(`/rentals/pos/${id}/pay`, payment);
  return res.data;
};
