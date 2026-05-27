import api from "@/api/axios";

// Obtener todas las sucursales
export const getCinemas = async (params = { page: 1 }) => {
  const response = await api.get('/cinemas', {
    params: params 
  });
  return response.data;
};

// Crear una sucursal
export const createCinema = async (payload) => {
  // El backend suele esperar snake_case (opening_time)
  const response = await api.post("/cinemas", payload);
  return response.data;
};

// Actualizar una sucursal
export const updateCinema = async (id, payload) => {
  const response = await api.patch(`/cinemas/${id}`, payload);
  return response.data;
};

// Eliminar una sucursal
export const deleteCinema = async (id) => {
  const response = await api.delete(`/cinemas/${id}`);
  return response.data;
};