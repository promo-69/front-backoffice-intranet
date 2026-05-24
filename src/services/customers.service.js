import api from "@/api/axios";

/*
export const createCustomer = async (payload) => {
  const res = await api.post("/customers", payload);
  return res.data;
};*/

export const getCustomers = async () => {
  const res = await api.get("/customers");
  return res.data.data;
};
