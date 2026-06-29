import api from "../api/axios";

// Tipos de usuario del backend (magic-vars.constant.ts): 1 = empleado, 2 = cliente.
export const USER_TYPE = { EMPLOYEE: 1, CUSTOMER: 2 };

export const createUser = async (payload) => {
  const res = await api.post("/users/admin", payload);
  return res.data;
};

// Lista cruda de cuentas (incluye clientes y empleados).
// Usada solo para métricas/conteos globales, NO para la gestión de personal.
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data?.data || [];
};

// Lista de cuentas INTERNAS (personal del negocio)
export const getStaffUsers = async () => {
  const res = await api.get("/users");
  const rows = res.data?.data || [];
  return rows.filter((u) => Number(u.user_type) === USER_TYPE.EMPLOYEE);
};

// Cambiar el correo de login de un empleado (admin).
export const updateUserEmail = async (id, email) => {
  return api.patch(`/users/${id}/email`, { email });
};

// Activar (1) / desactivar (0) la cuenta de un usuario. RF-12.
export const updateUserStatus = async (id, status) => {
  return api.patch(`/users/${id}/status`, { status: Number(status) });
};

export const getRoles = async () => {
  const res = await api.get("/users/roles");
  return res.data?.data || []; // devuelve [{id, code, name, ...}]
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
