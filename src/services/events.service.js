import api from "@/api/axios";


// Obtener todos los eventos - Mary
export const getEvents = async (params = { page: 1 }) => {
  const response = await api.get('/special-events/admin', {
    params: params 
  });
  return response.data;
};

// Crear un nuevo evento - Mary
export const createEvent = async (eventData) => {
  const response = await api.post('/special-events', eventData);
  return response.data;
}

// Actualizar un evento existente - Mary
export const updateEvent = async (id, eventData) => {
  const response = await api.patch(`/special-events/${id}`, eventData);
  return response.data;
};

// Eliminar un evento - Mary
export const deleteEvent = async (id) => {
  const response = await api.delete(`/special-events/${id}`);
  return response.data;
};
