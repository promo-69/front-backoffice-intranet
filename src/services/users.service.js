import api from "@/api/axios";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

/*
export const createUser = async (payload) => {
  const response = await api.post("/users", payload);
  return response.data;
};*/

export const createAdminUser = async (payload) => {
  const response = await api.post("/users/admin", payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.patch(`/users/security`, {
    user: id,
    ...payload,
  });
  return response.data;
};


export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/users/roles");
  return response.data.data; // porque backend envía { message, data }
};
