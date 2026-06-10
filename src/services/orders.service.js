import api from '../api/axios';

export const ordersService = {
  createQuote: async (cinema, customerId) => {
    const payload = { cinema };
    if (customerId) payload.customerId = customerId;
    const response = await api.post('/orders/quote', payload);
    return response.data.data;
  },

  getSessionState: async () => {
    const response = await api.get('/orders/session');
    return response.data.data;
  },

  cancelSession: async () => {
    const response = await api.delete('/orders/session');
    return response.data;
  },

  checkout: async (tickets, concessions) => {
    const payload = { tickets, concessions };
    const response = await api.post('/orders/checkout', payload);
    return response.data;
  },

  registerPayment: async (paymentMethod, amount, referenceNumber) => {
    const payload = { payment_method: paymentMethod, amount };
    if (referenceNumber) payload.reference_number = referenceNumber;
    const response = await api.post('/orders/payments', payload);
    return response.data;
  },
};
