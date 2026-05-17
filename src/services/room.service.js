import api from '../api/axios';


export const getAllRooms = async () => {
    // /api/v1/rooms
    const response = await api.get(`/rooms`);
    return response.data;
  }

export const getRoomById = async (roomId) => {
    // /api/v1/rooms/:id
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  }

export const getRoomsByCinema = async (cinemaId) => {
  // Ajusta la ruta según tu API (ej: /cinemas/1/rooms o /rooms?cinema=1)
  const response = await api.get(`/rooms?cinema=${cinemaId}`);
  return response.data;
};

export const getRoomProjectionTypes = async (roomId) =>{
//rooms/:id/projection-types

  const response = await api.get(`/rooms/${roomId}/projection-types`);
  return response.data;
}


export const deleteRoom = async (roomId) => {
  await api.delete(`/rooms/${roomId}`);
};