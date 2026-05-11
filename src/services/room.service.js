import api from '../api/axios';

export const getRoomsByCinema = async (cinemaId) => {
  // Ajusta la ruta según tu API (ej: /cinemas/1/rooms o /rooms?cinema=1)
  const response = await api.get(`/rooms?cinema=${cinemaId}`);
  return response.data;
};

export const deleteRoom = async (roomId) => {
  await api.delete(`/rooms/${roomId}`);
};