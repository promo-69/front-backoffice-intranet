import api from '../api/axios';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (raw?.rows) return raw.rows;
  return [];
}

export const cinemasService = {
  getAll: async () => {
    const response = await api.get('/cinemas');
    return extractRows(response.data);
  },
};
