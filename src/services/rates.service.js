import api from "../api/axios";

export const createCurrency = async (payload) => {
  const res = await api.post("/rates/currencies", payload);
  return res.data;
};

export const getCurrencies = async () => {
  const res = await api.get("/rates/currencies");
  return res.data.data; 
};


export const getCurrencyById = async (id) => {
  const res = await api.get(`/rates/currencies/${id}`);
  return res.data.data;
};

export const updateCurrency = async (id, payload) => {
  const res=api.put(`/rates/currencies/${id}`, payload);
  return res.data;
};

export const deleteCurrency = async (id) => {
  const res = await api.delete(`/rates/currencies/${id}`);
  return res.data;
};

//Create currency

//get all currencies

//get currency by id

//update currency

//delete currency