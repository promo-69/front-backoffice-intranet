import api from "@/api/axios";

export const createEmployee = async (payload) => {
  const res = await api.post("/employees", payload);
  return res.data;
};

export const getEmployees = async () => {
  const res = await api.get("/employees");
  return res.data.data; 
};


export const getEmployeeById = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data.data;
};

export const changeEmployeePosition = async (id, payload) => {
  return api.patch(`/employees/${id}/position`, payload);
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};
