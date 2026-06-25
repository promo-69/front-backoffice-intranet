import api from "@/api/axios";

export const getPriceModifiers = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/price-modifiers?${query}`);
  return response.data;
};

export const getPriceModifierById = async (id) => {
  const response = await api.get(`/price-modifiers/${id}`);
  return response.data;
};

export const createPriceModifier = async (data) => {
  const response = await api.post("/price-modifiers", data);
  return response.data;
};

export const updatePriceModifier = async (id, data) => {
  const response = await api.put(`/price-modifiers/${id}`, data);
  return response.data;
};

export const deletePriceModifier = async (id) => {
  const response = await api.delete(`/price-modifiers/${id}`);
  return response.data;
};
