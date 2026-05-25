import api from '../api/axios';

// Obtener salas 
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data.data || response.data || [];
};

export const getRooms = async () => {
  const response = await api.get(`/rooms`);
  return response.data;
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

export const getSeatsByRoom = async (roomId) => {
  try {
    // Endpoint basado en image_71b79e.png
    const response = await api.get(`/rooms/${roomId}/seats`);
    return response.data; 
  } catch (error) {
    console.error("Error al obtener el mapa de asientos:", error);
    throw error;
  }
};

// Crear Asientos - Enviamos el objeto individual directamente
export const createRoomSeats = async (roomId, seatData) => {
  return await api.post(`/rooms/${roomId}/seats`, seatData);
};

export const getRoomProjectionTypes = async (roomId) =>{
//rooms/:id/projection-types

  const response = await api.get(`/rooms/${roomId}/projection-types`);
  return response.data;
}


export const deleteRoom = async (roomId) => {
  return await api.delete(`/rooms/${roomId}`);
};