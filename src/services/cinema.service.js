import api from "../api/axios";

// Obtener todas las sucursales
export const getCinemas = async () => {
  const response = await api.get("/cinemas");
  // Aplicamos la lógica de limpieza aquí para que el componente reciba data pura
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

// Crear una sucursal
export const createCinema = async (payload) => {
  const response = await api.post("/cinemas", payload);
  return response.data;
};

// Actualizar una sucursal
export const updateCinema = async (id, payload) => {
  const response = await api.put(`/cinemas/${id}`, payload);
  return response.data;
};

// Eliminar una sucursal
export const deleteCinema = async (id) => {
  const response = await api.delete(`/cinemas/${id}`);
  return response.data;
};