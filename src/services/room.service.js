import api from '../api/axios';

// Obtener salas 
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data.data || response.data || [];
};

// Guardar Sala (Creación)
export const saveRoom = async (cinemaId, roomData) => {
  const response = await api.post(`/cinemas/${cinemaId}/rooms`, roomData);
  return response.data;
};

// Editar Sala (Actualización de metadatos)
export const updateRoom = async (roomId, roomData) => {
  const response = await api.patch(`/rooms/${roomId}`, roomData);
  return response.data;
};

// Obtener Asientos completos
export const getSeatsByRoom = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}/seats?limit=-1`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el mapa de asientos:", error);
    throw error;
  }
};

// Crear Asientos Iniciales 
export const createRoomSeats = async (roomId, seatsArray) => {
  return await api.post(`/rooms/${roomId}/seats`, seatsArray);
};

// Actualizar un Asiento Individual (Flujo de edición)
export const updateSeatIndividual = async (seatId, seatData) => {
  return await api.patch(`/seats/${seatId}`, seatData);
};

// Eliminar Sala
export const deleteRoom = async (roomId) => {
  return await api.delete(`/rooms/${roomId}`);
};