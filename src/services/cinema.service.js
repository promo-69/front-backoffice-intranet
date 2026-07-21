import api from "@/api/axios";

// Obtener todas las sucursales - Mary
export const getCinemas = async (params = { page: 1 }) => {
  const response = await api.get('/cinemas', {
    params: params 
  });
  return response.data;
};

// Crear una sucursal - Mary
export const createCinema = async (payload) => {
  const response = await api.post("/cinemas", payload);
  return response.data;
};

// Actualizar una sucursal - Mary
export const updateCinema = async (id, payload) => {
  const response = await api.patch(`/cinemas/${id}`, payload);
  return response.data;
};

// Eliminar una sucursal - Mary
export const deleteCinema = async (id) => {
  const response = await api.delete(`/cinemas/${id}`);
  return response.data;
};

// Obtener sucursales con salas existentes - Mary
export const getCinemasWithRooms = async () => {
  const response = await api.get('/cinemas/rooms-available');
  return response.data;
}