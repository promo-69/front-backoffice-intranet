import api from "@/api/axios";

export const getLoyaltyRewards = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/loyalty-rewards${query ? `?${query}` : ""}`);
  return response.data;
};

export const getLoyaltyRewardById = async (id) => {
  const response = await api.get(`/loyalty-rewards/${id}`);
  return response.data;
};

export const createLoyaltyReward = async (data) => {
  const response = await api.post("/loyalty-rewards", data);
  return response.data;
};

export const updateLoyaltyReward = async (id, data) => {
  const response = await api.put(`/loyalty-rewards/${id}`, data);
  return response.data;
};

export const deleteLoyaltyReward = async (id) => {
  const response = await api.delete(`/loyalty-rewards/${id}`);
  return response.data;
};
