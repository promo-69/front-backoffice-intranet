import api from '../api/axios';
import { getCatalogByName } from './catalog.service';

export const paymentsService = {
  getMethods: async () => {
    const data = await getCatalogByName('payment-methods');
    return data || [];
  },
  getLoyaltyInfo: async () => {
    const response = await api.get('/users/me/loyalty');
    return response.data.data;
  },
  getCurrencies: async () => {
    const data = await getCatalogByName('currencies');
    return data || [];
  },
  getBankAccounts: async (params = { page: 1, limit: 10 }) => {
    const response = await api.get('/payments/bank-accounts', { params });
    return response.data;
  },
  createBankAccount: async (data) => {
    const response = await api.post('/payments/bank-accounts', data);
    return response.data;
  },
  updateBankAccount: async (id, data) => {
    const response = await api.patch(`/payments/bank-accounts/${id}`, data);
    return response.data;
  },
  deleteBankAccount: async (id) => {
    const response = await api.delete(`/payments/bank-accounts/${id}`);
    return response.data;
  },
};
