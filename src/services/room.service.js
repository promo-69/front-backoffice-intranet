import api from '../api/axios';

// Obtener salas 
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data.data || response.data || [];
};

// Guardar Sala 
export const saveRoom = async (cinemaId, roomData, roomId = null) => {
  if (roomId) {
    // PUT /rooms/{id}
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  } else {
    // POST /cinemas/{cinemaId}/rooms
    const response = await api.post(`/cinemas/${cinemaId}/rooms`, roomData);
    return response.data;
  }
};

// Crear Asientos 
export const createRoomSeats = async (roomId, seatsArray) => {

  return await api.post(`/rooms/${roomId}/seats`, { seats: seatsArray });
};

export const deleteRoom = async (roomId) => {
  return await api.delete(`/rooms/${roomId}`);
};