import api from "@/api/axios";

export const getMyInventory = async (params = {}) => {
  const response = await api.get("/concessions/products", { params });
  return response.data;
};

export const getInventoryById = async (id) => {
  const response = await api.get(`/concessions/products/${id}`);
  return response.data;
};

export const getInventoryByCinema = async (cinemaId, params = {}) => {
  const response = await api.get(`/concessions/inventory/${cinemaId}`, { params });
  return response.data;
};

export const createInventoryItem = async (payload) => {
  const response = await api.post("/concessions/products", payload);
  return response.data;
};

export const updateInventoryItem = async (id, payload) => {
  const response = await api.patch(`/concessions/products/${id}`, payload);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/concessions/products/${id}`);
  return response.data;
};

export const registerMovement = async (id, payload) => {
  const response = await api.post(`/inventory/${id}/movements`, payload);
  return response.data;
};

export const registerCinemaMovement = async (cinemaId, id, payload) => {
  const response = await api.post(`/cinemas/${cinemaId}/inventory/${id}/movements`, payload);
  return response.data;
};
