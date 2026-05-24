import api from "../api/axios";


export const createUser = async (payload) => {
  const res = await api.post("/users/admin", payload);
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data?.data || [];
};

export const updateUserEmail = async (id, email) => {
  return api.patch("/users/me/security", {
    user: id,
    email,
    currentPassword: "dummy"
  });
};

export const updateUserStatus = async (id, status) => {
  return api.patch(`/users/${id}/status`, { status });
};

export const getRoles = async () => {
  const res = await api.get("/users/roles");
  return res.data?.data || []; // devuelve [{id, code, name, ...}]
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
