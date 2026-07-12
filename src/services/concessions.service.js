import api from '../api/axios';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.rows)) return raw.rows;
  return [];
}

export const concessionsService = {
  getProducts: async () => {
    const response = await api.get('/concessions/products?limit=-1');
    return extractRows(response.data);
  },

  getCombos: async () => {
    const response = await api.get('/concessions/combos?limit=-1');
    return extractRows(response.data);
  },

  getAvailableProducts: async (cinemaId) => {
    const response = await api.get('/concessions/products/available', { params: { cinemaId, limit: -1 } });
    return extractRows(response.data);
  },

  getAvailableCombos: async (cinemaId) => {
    const response = await api.get('/concessions/combos/available', { params: { cinemaId, limit: -1 } });
    return extractRows(response.data);
  },

  getComboById: async (id) => {
    const response = await api.get(`/concessions/combos/${id}`);
    return response.data?.data ?? response.data;
  },

  createCombo: async (payload) => {
    const response = await api.post('/concessions/combos', payload);
    return response.data;
  },

  updateCombo: async (id, payload) => {
    const response = await api.patch(`/concessions/combos/${id}`, payload);
    return response.data;
  },

  deleteCombo: async (id) => {
    const response = await api.delete(`/concessions/combos/${id}`);
    return response.data;
  },
};
