import api from '../api/axios';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (raw?.rows) return raw.rows;
  return [];
}

export const concessionsService = {
  getProducts: async () => {
    const response = await api.get('/concessions/products');
    return extractRows(response.data);
  },

  getCombos: async () => {
    const response = await api.get('/concessions/combos');
    return extractRows(response.data);
  },
};
