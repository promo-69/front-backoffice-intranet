import api from "@/api/axios";

// ==========================
// CURRENCIES (Monedas)
// ==========================
export const getCurrencies = async (params = { page: 1 }) => {
  const res = await api.get("/currencies", { params });
  return res.data;
};

export const createCurrency = async (payload) => {
  const res = await api.post("/currencies", payload);
  return res.data;
};

export const updateCurrency = async (id, payload) => {
  const res = await api.patch(`/currencies/${id}`, payload);
  return res.data;
};

export const deleteCurrency = async (id) => {
  const res = await api.delete(`/currencies/${id}`);
  return res.data;
};

// ==========================
// EXCHANGE RATES (Tasas de Cambio)
// ==========================
export const getExchangeRates = async (params = { page: 1 }) => {
  const res = await api.get("/exchange-rates", { params });
  return res.data;
};

export const createExchangeRate = async (payload) => {
  const res = await api.post("/exchange-rates", payload);
  return res.data;
};