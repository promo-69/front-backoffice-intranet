import api from "../api/axios";

export const createEmployee = async (payload) => {
  const response = await api.post("/employees", payload);
  return response.data;
};
