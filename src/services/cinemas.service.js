import api from '../api/axios';

function extractRows(resp) {
  const raw = resp?.data ?? resp;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.rows)) return raw.rows;
  return [];
}

export const cinemasService = {
  getAll: async () => {
    const response = await api.get('/cinemas?limit=200');
    return extractRows(response.data);
  },
};
