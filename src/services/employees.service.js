import api from "../api/axios";

export const createEmployee = async (payload) => {
  const res = await api.post("/employees", payload);
  return res.data;
};


export const getEmployeeById = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data.data;
};

export const updateEmployeePosition = async (id, payload) => {
  return api.put(`/employees/${id}/positions`, payload);
};
