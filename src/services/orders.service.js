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

  registerPayment: async (paymentMethod, amount, currency = 1, reference = null, bank = null) => {
    const payload = { payment_method: paymentMethod, amount, currency };
    if (reference) payload.reference_number = reference;
    if (bank) payload.bank = bank;
    const response = await api.post('/orders/payments', payload);
    return response.data;
  },

  registerPayments: async (paymentsArray) => {
    const response = await api.post('/orders/payments', paymentsArray);
    return response.data;
  },

  getPendingBilling: async (status = null, params = {}) => {
    switch (status) {
      case 'active':
        params.status = 4;
        break;

      case 'voided':
        params.status = 3;
        break;

      case 'pending_billing':
        params.status = 2;
        break;

      case 'all':
        params.status = null;
        break;
    }
    const response = await api.get('/orders', { params: { status, ...params } });
    return response.data;
  },
  
  billOrder: async (payload) => {
    const response = await api.post('/orders/billing', payload);
    return response.data;
  },
};
