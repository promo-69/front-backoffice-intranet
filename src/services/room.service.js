import api from '../api/axios';

// Obtener salas por sucursal - Mary
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data.data || response.data || [];
};

// Esta no se esta utilizando - Mary
export const getRooms = async () => {
  const response = await api.get(`/rooms`);
  return response.data;
};

// Guardar Sala - Mary
export const saveRoom = async (cinemaId, roomData) => {
  const response = await api.post(`/cinemas/${cinemaId}/rooms`, roomData);
  return response.data;
};

// Editar Sala - Mary
export const updateRoom = async (roomId, roomData) => {
  const response = await api.patch(`/rooms/${roomId}`, roomData);
  return response.data;
};

// Obtener Asientos completos - Mary
export const getSeatsByRoom = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}/seats?limit=-1`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el mapa de asientos:", error);
    throw error;
  }
};

// Crear Asientos Iniciales - Mary
export const createRoomSeats = async (roomId, seatsArray) => {
  return await api.post(`/rooms/${roomId}/seats`, seatsArray);
};

export const getRoomProjectionTypes = async (roomId) =>{
  const response = await api.get(`/rooms/${roomId}/projection-types`);
  return response.data;
}


// Actualizar un Asiento Individual - Mary
export const updateSeatIndividual = async (seatId, seatData) => {
  return await api.patch(`/seats/${seatId}`, seatData);
};

// Eliminar Sala- Mary
export const deleteRoom = async (roomId) => {
  return await api.delete(`/rooms/${roomId}`);
};


// Eliminar Asientos Individuales por Sala - Mary
export const deleteSeatIndividual = async (roomId) => {
  return await api.delete(`/seats/room/${roomId}`);
};

// Editar lista de asientos - Mary
export const updateSeatsBatch = async (roomId, seatsArray) => {
  return await api.patch(`/rooms/${roomId}/seats`, seatsArray);
};  
  