import api from "@/api/axios";

export const createEmployee = async (payload) => {
  const response = await api.post("/employees", payload);
  return response.data;
};

export const updateEmployeePosition = async (id, payload) => {
  const response = await api.put(`/employees/${id}/positions`, payload);
  return response.data;
};
