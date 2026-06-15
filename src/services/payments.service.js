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
};
