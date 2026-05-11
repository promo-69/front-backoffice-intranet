import api from "../api/axios";

/**
 * Obtener sucursales paginadas
 * @param {number} page - El número de página a solicitar
 */
export const getCinemas = async (page = 1) => {
  // Pasamos la página como parámetro en la URL (?page=X)
  const response = await api.get(`/cinemas?page=${page}`);
  
  /**
   * IMPORTANTE: Devolvemos response.data completo.
   * Esto contiene: { success, message, data, metadata }
   * La metadata es esencial para que el frontend sepa el total de páginas.
   */
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
  const response = await api.put(`/cinemas/${id}`, payload);
  return response.data;
};

// Eliminar una sucursal
export const deleteCinema = async (id) => {
  const response = await api.delete(`/cinemas/${id}`);
  return response.data;
};