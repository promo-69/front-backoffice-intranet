import api from "@/api/axios";

export const createCustomer = async (payload) => {
  const res = await api.post("/customers", payload);
  return res.data.data;
};

export const getCustomers = async () => {
  const res = await api.get("/customers");
  return res.data.data;
};

export const getCustomerByDocument = async (documentNumber) => {
  const res = await api.get("/customers", { params: { document_number: documentNumber } });
  const list = res.data?.data || [];
  return list.length > 0 ? list[0] : null;
};
