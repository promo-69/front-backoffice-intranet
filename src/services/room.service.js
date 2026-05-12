import api from '../api/axios';

export const getRoomsByCinema = async (cinemaId) => {
  // Construimos la URL dinámica siguiendo el patrón: /cinemas/{id}/rooms
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  
  // Mantenemos la lógica de retorno que ya tenías
  return response.data.data || response.data || [];
};

export const deleteRoom = async (roomId) => {
  return await api.delete(`/rooms/${roomId}`);
};